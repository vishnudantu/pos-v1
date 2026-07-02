import express from 'express';
import pool from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

function requireSuperAdmin(req, res) {
  if (req.user?.role !== 'super_admin') {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}

// ── PLATFORM-WIDE OVERVIEW ───────────────────────────────────
router.get('/overview', authMiddleware, async (req, res) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const [[{ total_politicians }]] = await pool.query(
      "SELECT COUNT(*) AS total_politicians FROM politician_profiles WHERE role = 'politician' OR role IS NULL"
    );
    const [[{ total_mps }]] = await pool.query(
      "SELECT COUNT(*) AS total_mps FROM politician_profiles WHERE designation LIKE '%Lok Sabha%'"
    );
    const [[{ total_mlas }]] = await pool.query(
      "SELECT COUNT(*) AS total_mlas FROM politician_profiles WHERE designation LIKE '%Legislative Assembly%'"
    );
    const [[{ total_users }]] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
    const [[{ active_users }]] = await pool.query("SELECT COUNT(*) AS active_users FROM users WHERE is_active = 1");
    const [[{ total_grievances }]] = await pool.query("SELECT COUNT(*) AS total_grievances FROM grievances");
    const [[{ open_grievances }]] = await pool.query(
      "SELECT COUNT(*) AS open_grievances FROM grievances WHERE status NOT IN ('Resolved','Closed')"
    );
    const [[{ total_projects }]] = await pool.query("SELECT COUNT(*) AS total_projects FROM projects");
    const [[{ active_projects }]] = await pool.query(
      "SELECT COUNT(*) AS active_projects FROM projects WHERE status IN ('In Progress','Planning','Tendering')"
    );
    const [[{ total_events }]] = await pool.query("SELECT COUNT(*) AS total_events FROM events");
    const [[{ upcoming_events }]] = await pool.query(
      "SELECT COUNT(*) AS upcoming_events FROM events WHERE start_date >= NOW()"
    );
    const [[{ total_media }]] = await pool.query("SELECT COUNT(*) AS total_media FROM media_mentions");
    const [[{ negative_mentions_24h }]] = await pool.query(
      "SELECT COUNT(*) AS negative_mentions_24h FROM media_mentions WHERE sentiment = 'negative' AND published_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)"
    );
    const [[{ avg_sentiment }]] = await pool.query(
      "SELECT ROUND(AVG(overall_score)) AS avg_sentiment FROM sentiment_scores WHERE score_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)"
    );
    const [[{ high_threats }]] = await pool.query(
      "SELECT COUNT(*) AS high_threats FROM opposition_intelligence WHERE threat_level >= 7 AND detected_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    const [[{ voice_reports_30d }]] = await pool.query(
      "SELECT COUNT(*) AS voice_reports_30d FROM voice_reports WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    const [[{ briefings_7d }]] = await pool.query(
      "SELECT COUNT(*) AS briefings_7d FROM ai_briefings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    const [[{ unread_notifications }]] = await pool.query(
      "SELECT COUNT(*) AS unread_notifications FROM notifications WHERE is_read = 0"
    );
    const [[{ recent_logins }]] = await pool.query(
      "SELECT COUNT(*) AS recent_logins FROM users WHERE last_login_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)"
    );

    res.json({
      platform: {
        total_politicians,
        total_mps,
        total_mlas,
        total_users,
        active_users,
      },
      operations: {
        total_grievances,
        open_grievances,
        total_projects,
        active_projects,
        total_events,
        upcoming_events,
      },
      intelligence: {
        total_media_mentions: total_media,
        negative_mentions_24h,
        avg_sentiment: avg_sentiment || 0,
        high_threats,
        voice_reports_30d,
        briefings_7d,
      },
      alerts: {
        unread_notifications,
        recent_logins,
      },
    });
  } catch (e) {
    console.error('[founder-v2/overview]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── POLITICIAN PERFORMANCE RANKING ───────────────────────────
router.get('/ranking', authMiddleware, async (req, res) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const limit = Math.min(parseInt(req.query.limit || '25', 10), 100);
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.full_name,
        p.display_name,
        p.party,
        p.designation,
        p.constituency_name,
        p.district,
        p.state,
        p.photo_url,
        (SELECT COUNT(*) FROM grievances g WHERE g.politician_id = p.id AND g.status NOT IN ('Resolved','Closed')) AS open_grievances,
        (SELECT COUNT(*) FROM projects pr WHERE pr.politician_id = p.id AND pr.status IN ('In Progress','Planning','Tendering')) AS active_projects,
        (SELECT COUNT(*) FROM events e WHERE e.politician_id = p.id AND e.start_date >= NOW()) AS upcoming_events,
        (SELECT COUNT(*) FROM media_mentions m WHERE m.politician_id = p.id AND m.sentiment = 'Negative' AND m.published_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS negative_mentions_30d,
        (SELECT COUNT(*) FROM opposition_intelligence o WHERE o.politician_id = p.id AND o.threat_level >= 7 AND o.detected_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS high_threats_30d,
        (SELECT ROUND(AVG(s.overall_score)) FROM sentiment_scores s WHERE s.politician_id = p.id AND s.score_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)) AS sentiment_score,
        (SELECT COUNT(*) FROM voice_reports v WHERE v.politician_id = p.id AND v.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS voice_reports_30d
      FROM politician_profiles p
      WHERE p.role = 'politician' OR p.role IS NULL
      ORDER BY p.full_name
      LIMIT ?
    `, [limit]);

    const ranked = rows.map(r => {
      const score =
        ((r.sentiment_score || 50) * 0.3) +
        (Math.max(0, 10 - (r.open_grievances || 0)) * 2) +
        ((r.active_projects || 0) * 3) +
        ((r.upcoming_events || 0) * 2) -
        ((r.negative_mentions_30d || 0) * 3) -
        ((r.high_threats_30d || 0) * 4) +
        ((r.voice_reports_30d || 0) * 1);
      return { ...r, performance_score: Math.round(Math.max(0, score)) };
    }).sort((a, b) => b.performance_score - a.performance_score);

    res.json(ranked);
  } catch (e) {
    console.error('[founder-v2/ranking]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── AUDIT LOG VIEWER ─────────────────────────────────────────
router.get('/audit', authMiddleware, async (req, res) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const offset = parseInt(req.query.offset || '0', 10);
    const [rows] = await pool.query(
      'SELECT a.*, u.email AS user_email FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM audit_logs');
    res.json({ logs: rows, total, limit, offset });
  } catch (e) {
    console.error('[founder-v2/audit]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── SYSTEM HEALTH ────────────────────────────────────────────
router.get('/health', authMiddleware, async (req, res) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const dbCheck = await pool.query('SELECT 1 AS ok');
    const dbHealthy = dbCheck?.[0]?.[0]?.ok === 1;
    const aiProviders = [
      { name: 'Ollama', configured: !!process.env.OLLAMA_BASE_URL },
      { name: 'Mistral', configured: !!process.env.MISTRAL_API_KEY },
      { name: 'Groq', configured: !!process.env.GROQ_API_KEY },
      { name: 'Gemini', configured: !!process.env.GEMINI_API_KEY },
      { name: 'OpenRouter', configured: !!process.env.OPENROUTER_API_KEY },
      { name: 'OpenAI', configured: !!process.env.OPENAI_API_KEY },
      { name: 'Anthropic', configured: !!process.env.ANTHROPIC_API_KEY },
      { name: 'NVIDIA', configured: !!process.env.NVIDIA_API_KEY },
    ];
    res.json({
      api: { status: 'ok', uptime: process.uptime() },
      database: { status: dbHealthy ? 'ok' : 'error' },
      ai_providers: aiProviders,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[founder-v2/health]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── STATE / DISTRICT MAP ─────────────────────────────────────
router.get('/state-map', authMiddleware, async (req, res) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const [byState] = await pool.query(`
      SELECT state, COUNT(*) AS count,
        SUM(designation LIKE '%Lok Sabha%') AS mps,
        SUM(designation LIKE '%Legislative Assembly%') AS mlas
      FROM politician_profiles
      WHERE role = 'politician' OR role IS NULL
      GROUP BY state
      ORDER BY state
    `);
    const [byDistrict] = await pool.query(`
      SELECT state, district, COUNT(*) AS count
      FROM politician_profiles
      WHERE role = 'politician' OR role IS NULL
      GROUP BY state, district
      ORDER BY state, district
    `);
    res.json({ by_state: byState, by_district: byDistrict });
  } catch (e) {
    console.error('[founder-v2/state-map]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── ACTIVITY TIMELINE ────────────────────────────────────────
router.get('/activity', authMiddleware, async (req, res) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
    const [logins] = await pool.query(`
      SELECT u.id, u.email, u.display_name, u.last_login_at, u.last_login_ip
      FROM users u
      WHERE u.last_login_at IS NOT NULL
      ORDER BY u.last_login_at DESC
      LIMIT ?
    `, [limit]);
    const [audits] = await pool.query(`
      SELECT a.*, u.email AS user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ?
    `, [limit]);
    res.json({ recent_logins: logins, recent_audit: audits });
  } catch (e) {
    console.error('[founder-v2/activity]', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── PARTY SUMMARY ────────────────────────────────────────────
router.get('/party-summary', authMiddleware, async (req, res) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    const [rows] = await pool.query(`
      SELECT party,
        COUNT(*) AS total,
        SUM(designation LIKE '%Lok Sabha%') AS mps,
        SUM(designation LIKE '%Legislative Assembly%') AS mlas
      FROM politician_profiles
      WHERE role = 'politician' OR role IS NULL
      GROUP BY party
      ORDER BY total DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error('[founder-v2/party-summary]', e.message);
    res.status(500).json({ error: e.message });
  }
});


// ── UNIFIED FOUNDER DASHBOARD ─────────────────────────────────
router.get('/dashboard', authMiddleware, async (req, res) => {
  if (!requireSuperAdmin(req, res)) return;
  try {
    // ── Platform metrics ──
    const [[{ total_politicians }]] = await pool.query(
      "SELECT COUNT(*) AS total_politicians FROM politician_profiles WHERE role = 'politician' OR role IS NULL"
    );
    const [[{ total_mps }]] = await pool.query(
      "SELECT COUNT(*) AS total_mps FROM politician_profiles WHERE designation LIKE '%Lok Sabha%'"
    );
    const [[{ total_mlas }]] = await pool.query(
      "SELECT COUNT(*) AS total_mlas FROM politician_profiles WHERE designation LIKE '%Legislative Assembly%'"
    );
    const [[{ total_users }]] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
    const [[{ active_users }]] = await pool.query("SELECT COUNT(*) AS active_users FROM users WHERE is_active = 1");
    const [[{ total_grievances }]] = await pool.query("SELECT COUNT(*) AS total_grievances FROM grievances");
    const [[{ open_grievances }]] = await pool.query(
      "SELECT COUNT(*) AS open_grievances FROM grievances WHERE status NOT IN ('Resolved','Closed')"
    );
    const [[{ total_projects }]] = await pool.query("SELECT COUNT(*) AS total_projects FROM projects");
    const [[{ active_projects }]] = await pool.query(
      "SELECT COUNT(*) AS active_projects FROM projects WHERE status IN ('In Progress','Planning','Tendering')"
    );
    const [[{ total_events }]] = await pool.query("SELECT COUNT(*) AS total_events FROM events");
    const [[{ upcoming_events }]] = await pool.query(
      "SELECT COUNT(*) AS upcoming_events FROM events WHERE start_date >= NOW()"
    );
    const [[{ total_media }]] = await pool.query("SELECT COUNT(*) AS total_media FROM media_mentions");
    const [[{ negative_mentions_24h }]] = await pool.query(
      "SELECT COUNT(*) AS negative_mentions_24h FROM media_mentions WHERE sentiment = 'negative' AND published_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)"
    );
    const [[{ avg_sentiment }]] = await pool.query(
      "SELECT ROUND(AVG(overall_score)) AS avg_sentiment FROM sentiment_scores WHERE score_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)"
    );
    const [[{ high_threats }]] = await pool.query(
      "SELECT COUNT(*) AS high_threats FROM opposition_intelligence WHERE threat_level >= 7 AND detected_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    const [[{ voice_reports_30d }]] = await pool.query(
      "SELECT COUNT(*) AS voice_reports_30d FROM voice_reports WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );
    const [[{ briefings_7d }]] = await pool.query(
      "SELECT COUNT(*) AS briefings_7d FROM ai_briefings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    const [[{ unread_notifications }]] = await pool.query(
      "SELECT COUNT(*) AS unread_notifications FROM notifications WHERE is_read = 0"
    );

    const metrics = {
      total_politicians,
      total_mps,
      total_mlas,
      total_users,
      active_users,
      total_grievances,
      open_grievances,
      total_projects,
      active_projects,
      total_events,
      upcoming_events,
      total_media_mentions: total_media,
      negative_mentions_24h,
      avg_sentiment: avg_sentiment || 0,
      high_threats,
      voice_reports_30d,
      briefings_7d,
      unread_notifications,
    };

    // ── Politician health / performance / risk ──
    const [politicians] = await pool.query(`
      SELECT
        p.id,
        p.full_name,
        p.display_name,
        p.photo_url,
        p.party,
        p.designation,
        p.constituency_name,
        p.district,
        p.state,
        p.is_active,
        p.subscription_status,
        (SELECT COUNT(*) FROM grievances g WHERE g.politician_id = p.id AND g.status NOT IN ('Resolved','Closed')) AS open_grievances,
        (SELECT COUNT(*) FROM projects pr WHERE pr.politician_id = p.id AND pr.status IN ('In Progress','Planning','Tendering')) AS active_projects,
        (SELECT COUNT(*) FROM events e WHERE e.politician_id = p.id AND e.start_date >= NOW()) AS upcoming_events,
        (SELECT COUNT(*) FROM media_mentions m WHERE m.politician_id = p.id AND m.sentiment = 'Negative' AND m.published_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS negative_mentions_30d,
        (SELECT COUNT(*) FROM opposition_intelligence o WHERE o.politician_id = p.id AND o.threat_level >= 7 AND o.detected_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS high_threats_30d,
        (SELECT ROUND(AVG(s.overall_score)) FROM sentiment_scores s WHERE s.politician_id = p.id AND s.score_date >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)) AS sentiment_avg,
        (SELECT COUNT(*) FROM voice_reports v WHERE v.politician_id = p.id AND v.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS voice_reports_30d
      FROM politician_profiles p
      WHERE p.role = 'politician' OR p.role IS NULL
      ORDER BY p.full_name
    `);

    const derived = politicians.map(p => {
      const openGrievances = p.open_grievances || 0;
      const negativeMentions = p.negative_mentions_30d || 0;
      const highThreats = p.high_threats_30d || 0;
      const activeProjects = p.active_projects || 0;
      const upcomingEvents = p.upcoming_events || 0;
      const voiceReports = p.voice_reports_30d || 0;
      const sentiment = p.sentiment_avg || 50;
      const riskScore = Math.round(openGrievances * 0.6 + negativeMentions * 1.2 + highThreats * 2);
      const momentum = Math.round(activeProjects * 6 + upcomingEvents * 3 + voiceReports * 1.2);
      const performance = Math.max(0, Math.min(100, Math.round(sentiment + momentum - riskScore)));
      const winning = Math.max(0, Math.min(100, Math.round(sentiment * 0.7 + momentum * 0.4 - highThreats * 4 - negativeMentions)));
      const health = riskScore > 80 ? 'Critical' : riskScore > 40 ? 'Watch' : 'Healthy';
      const status = p.is_active === 1 && p.subscription_status === 'active' ? 'Live' : 'Offline';
      return { ...p, riskScore, momentum, performance, winning, health, status };
    });

    const topPerformers = [...derived].sort((a, b) => b.performance - a.performance).slice(0, 6);
    const riskWatch = [...derived].filter(p => p.health !== 'Healthy').sort((a, b) => b.riskScore - a.riskScore).slice(0, 6);
    const livePoliticians = derived.filter(p => p.status === 'Live');

    // ── Activity feed ──
    const [recent_logins] = await pool.query(`
      SELECT u.id, u.email, u.display_name, u.last_login_at, u.last_login_ip, 'login' AS type
      FROM users u
      WHERE u.last_login_at IS NOT NULL
      ORDER BY u.last_login_at DESC
      LIMIT 15
    `);
    const [recent_audit] = await pool.query(`
      SELECT a.*, u.email AS user_email, 'audit' AS type
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 15
    `);
    const [recent_media] = await pool.query(`
      SELECT m.id, m.headline AS title, m.source, m.sentiment, m.published_at, p.full_name AS politician_name, 'media' AS type
      FROM media_mentions m
      LEFT JOIN politician_profiles p ON m.politician_id = p.id
      ORDER BY m.published_at DESC
      LIMIT 15
    `);
    const [recent_opposition] = await pool.query(`
      SELECT o.id, o.opponent_name AS title, o.activity_type, o.threat_level, o.description, o.detected_at, p.full_name AS politician_name, 'opposition' AS type
      FROM opposition_intelligence o
      LEFT JOIN politician_profiles p ON o.politician_id = p.id
      ORDER BY o.detected_at DESC
      LIMIT 15
    `);

    const activityFeed = [
      ...recent_logins.map(r => ({ ...r, time: r.last_login_at, label: 'User login', detail: r.email })),
      ...recent_audit.map(r => ({ ...r, time: r.created_at, label: `${r.action} ${r.table_name || ''}`, detail: r.user_email || 'System' })),
      ...recent_media.map(r => ({ ...r, time: r.published_at, label: 'Media mention', detail: r.title?.slice(0, 60) })),
      ...recent_opposition.map(r => ({ ...r, time: r.detected_at, label: 'Opposition activity', detail: r.title?.slice(0, 60) })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 25);

    // ── State / district map ──
    const [by_state] = await pool.query(`
      SELECT state,
        COUNT(*) AS count,
        SUM(designation LIKE '%Lok Sabha%') AS mps,
        SUM(designation LIKE '%Legislative Assembly%') AS mlas
      FROM politician_profiles
      WHERE role = 'politician' OR role IS NULL
      GROUP BY state
      ORDER BY state
    `);
    const [by_district] = await pool.query(`
      SELECT state, district, COUNT(*) AS count
      FROM politician_profiles
      WHERE role = 'politician' OR role IS NULL
      GROUP BY state, district
      ORDER BY state, district
    `);

    // ── Party summary ──
    const [party_summary] = await pool.query(`
      SELECT party,
        COUNT(*) AS total,
        SUM(designation LIKE '%Lok Sabha%') AS mps,
        SUM(designation LIKE '%Legislative Assembly%') AS mlas
      FROM politician_profiles
      WHERE role = 'politician' OR role IS NULL
      GROUP BY party
      ORDER BY total DESC
    `);

    res.json({
      metrics,
      live_count: livePoliticians.length,
      politicians: derived,
      top_performers: topPerformers,
      risk_watch: riskWatch,
      activity_feed: activityFeed,
      state_map: { by_state, by_district },
      party_summary,
    });
  } catch (e) {
    console.error('[founder-v2/dashboard]', e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
