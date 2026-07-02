# Founder Dashboard Command Center — Implementation Notes

## Status
Branch: `founder-dashboard-start`
Live URL: https://thoughtfirst.in

## Completed (Phase 1)
1. **Live Politician Health Cards** — photo/name/designation/constituency, live status chip, health status, performance/winning/risk/sentiment mini-stats, grievances/projects/events/media counts.
2. **Performance Leaderboard** — Top Performers tab ranked by `performance_score`.
3. **Risk Watch Tower** — auto-flagged Watch/Critical politicians with risk reasons.
4. **Real-Time Activity Feed** — logins, audit logs, media mentions, opposition activity.
5. **State / District Deployment Map** — Andhra Pradesh district counts + party summary.
6. **Live Indicator** — pulsing LIVE badge + 30-second auto-refresh + manual refresh.
7. **One-Click Profile** — click any health card to open the politician dashboard.
8. **Global Form Styling Fix** — dark inputs, selects, date pickers across the platform.

## Pending Phases
- **Phase 2**: Grievance Command Center, Media War Room, Opposition Radar, real district heatmap.
- **Phase 3**: Project Mission Control, AI Daily Briefing, Financial Compliance.
- **Phase 4**: Coalition Forecasting, Voter Intelligence, Multi-State Readiness, Bulk Operations, Security Center.

## Dos
- Take a full DB + code backup before any schema or route change.
- Commit in small, reviewable parts with clear messages.
- Test the API endpoint with a real token before wiring the UI.
- Run database migrations before deploying code that depends on them.
- Build the web app (`pnpm run build`) before restarting `pos-web`.
- Clear shell history (`history -c`) after typing passwords/tokens.
- Rotate JWT secret immediately if a token is ever logged or shared.
- Use `git --no-pager diff` instead of `git diff` to avoid pager traps.

## Don'ts
- Do not paste production passwords, JWT tokens, or DB credentials in chat.
- Do not run `ALTER TABLE` statements directly as shell commands — use `mysql` heredoc or migration files.
- Do not skip `pnpm run build`; always verify the frontend compiles.
- Do not make large string replacements in JSX without first checking exact whitespace.
- Do not leave uncommitted working changes before starting the next feature.
- Do not edit files on the server without a corresponding commit.

## Critical Schema Migration
File: `migrations/20260703_fix_sentiment_schema.sql`
This must be run on any fresh database before the sentiment pipeline works.

## Next Recommended Feature
Leaderboard export to PDF/Excel OR real district heatmap visualization.
