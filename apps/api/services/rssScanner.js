import pool from '../db.js';
import { aiComplete } from './ai.js';

function decodeXmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1');
}

function extractText(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(re);
  return m ? decodeXmlEntities(m[1].trim()) : '';
}

function parseRSS(xml) {
  const items = [];
  const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  for (const itemXml of itemMatches) {
    const title = extractText(itemXml, 'title');
    const link = extractText(itemXml, 'link') || (itemXml.match(/<guid[^>]*>(.*?)<\/guid>/i)?.[1] || '');
    const summary = extractText(itemXml, 'description');
    const pubDate = extractText(itemXml, 'pubDate') || extractText(itemXml, 'dc:date');
    items.push({ title, link, summary, pubDate });
  }
  return items;
}

function parseAtom(xml) {
  const items = [];
  const entryMatches = xml.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi) || [];
  for (const entryXml of entryMatches) {
    const title = extractText(entryXml, 'title');
    const linkMatch = entryXml.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
    const link = linkMatch ? linkMatch[1] : extractText(entryXml, 'id');
    const summary = extractText(entryXml, 'summary') || extractText(entryXml, 'content');
    const pubDate = extractText(entryXml, 'published') || extractText(entryXml, 'updated');
    items.push({ title, link, summary, pubDate });
  }
  return items;
}

function parseFeed(xml) {
  if (xml.includes('<feed')) return parseAtom(xml);
  return parseRSS(xml);
}

function parseDate(str) {
  if (!str) return new Date();
  try { return new Date(str); } catch { return new Date(); }
}

function keywordMatches(item, keywords) {
  const text = `${item.title || ''} ${item.summary || ''}`.toLowerCase();
  return keywords.some(k => text.includes(k.keyword.toLowerCase()));
}

async function analyzeSentiment(text, politicianId) {
  const prompt = `Classify the sentiment of this news headline/summary toward the politician. Choose exactly one: Positive, Negative, or Neutral. Respond with only the single word.\n\nText: ${text.slice(0, 800)}`;
  try {
    const result = await aiComplete({ prompt, system: 'You classify political news sentiment as Positive, Negative, or Neutral. Reply with exactly one word.', politicianId, endpoint: 'sentiment', maxTokens: 10, temperature: 0.1 });
    const clean = result.trim().toLowerCase();
    if (clean.includes('positive')) return 'Positive';
    if (clean.includes('negative')) return 'Negative';
    return 'Neutral';
  } catch (e) {
    return 'Neutral';
  }
}

export async function scanFeed(feed, keywords) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(feed.feed_url, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NethraBot/1.0)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();
    if (!xml || xml.length < 50) throw new Error('Empty feed');

    const items = parseFeed(xml).slice(0, 50);
    const matches = items.filter(item => keywordMatches(item, keywords));

    let inserted = 0;
    for (const item of matches) {
      const pubDate = parseDate(item.pubDate);
      try {
        const sentiment = await analyzeSentiment(`${item.title} ${item.summary}`, feed.politician_id);
        await pool.query(
          `INSERT INTO media_mentions (politician_id, headline, source, summary, url, published_at, sentiment)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE headline=VALUES(headline), summary=VALUES(summary), sentiment=VALUES(sentiment)`,
          [
            feed.politician_id,
            item.title.slice(0, 500),
            feed.feed_name,
            item.summary.slice(0, 2000),
            item.link.slice(0, 1000),
            pubDate,
            sentiment,
          ]
        );
        inserted++;
      } catch (e) {
        console.warn('[rssScanner] insert failed:', e.message);
      }
    }

    await pool.query(
      `UPDATE rss_feeds SET last_scanned_at = NOW(), last_status = 'success', last_error = NULL, items_fetched = ? WHERE id = ?`,
      [items.length, feed.id]
    );

    return { success: true, total: items.length, matched: inserted };
  } catch (error) {
    clearTimeout(timeout);
    await pool.query(
      `UPDATE rss_feeds SET last_scanned_at = NOW(), last_status = 'failed', last_error = ? WHERE id = ?`,
      [error.message.slice(0, 500), feed.id]
    );
    return { success: false, error: error.message };
  }
}

export async function scanAllFeeds(politicianId, feedType = null) {
  const [keywords] = await pool.query(
    'SELECT * FROM keywords WHERE politician_id = ? AND is_active = 1',
    [politicianId]
  );

  let sql = 'SELECT * FROM rss_feeds WHERE politician_id = ? AND is_active = 1';
  const params = [politicianId];
  if (feedType) {
    sql += ' AND feed_type = ?';
    params.push(feedType);
  }
  sql += ' ORDER BY id';
  const [feeds] = await pool.query(sql, params);

  const results = [];
  let totalMatched = 0;
  let successCount = 0;
  let failCount = 0;

  const batchSize = 8;
  for (let i = 0; i < feeds.length; i += batchSize) {
    const batch = feeds.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(feed => scanFeed(feed, keywords)));
    batchResults.forEach((res, idx) => {
      const feed = batch[idx];
      const r = res.status === 'fulfilled' ? res.value : { success: false, error: res.reason?.message || 'Batch error' };
      results.push({ feed: feed.feed_name, ...r });
      if (r.success) {
        successCount++;
        totalMatched += r.matched || 0;
      } else {
        failCount++;
      }
    });
  }

  return {
    feeds_scanned: feeds.length,
    success: successCount,
    failed: failCount,
    total_matched: totalMatched,
    details: results,
  };
}
