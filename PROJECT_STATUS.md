# NETHRA — Founder Command Center Project Status

> Building the greatest political intelligence platform of all time.

## Mission
Transform the SuperAdmin dashboard from a static politician list into a real-time, mission-control-grade **Founder Command Center** that gives the founder complete situational awareness and operational control over every politician, constituency, grievance, media mention, and threat.

---

## ✅ What is working

### Infrastructure
- Ubuntu 24.04 server with Nginx, MySQL, Node 20, pnpm
- Live domains with SSL: `thoughtfirst.in`, `api.thoughtfirst.in`
- API and web services running via systemd
- Database `pos_db` with full political data schema

### Founder Dashboard v2 (Phase 1 — DEPLOYED)
- Live at: Platform Admin → Overview
- 25 politician health cards with performance / winning / risk / sentiment
- Top Performers tab
- Risk Watch tab
- Activity Feed tab
- State/District Map tab + Party Summary
- Pulsing LIVE indicator + 30-second auto-refresh + manual refresh
- One-click politician profile access from health cards

### Data Pipeline
- Sentiment queue schema mismatch fixed
- Added `source_type`, `received_at`, `news_score`, `social_score`, `whatsapp_score`, `grievance_score`, `ground_score`, `channel_breakdown`
- Unified `/api/founder-v2/dashboard` endpoint serving real data

### Security & Access
- Politician login created: `hbalayogi@thoughtfirst.in` / `Admin@123`
- Politician profile PUT endpoint secured so politician_admin can only edit own profile
- Global dark-theme form styles applied

---

## ⚠️ In Progress / Partially Working

| Area | Status | Blocker |
|---|---|---|
| Grievance Command Center tab | Backend ready, frontend has JSX insertion issues | Needs clean component separation |
| Politician Profile page rendering | Duplicated JSX line fixed | Needs rebuild verification |
| Constituency edit/save | Not saving | `constituency_profiles` CRUD route is not scoped to politician_id; also constituency profile may not exist for Harish |
| "New Profile" button | Fix applied | Needs rebuild |

---

## ❌ Not Started

- Media & Sentiment War Room
- Opposition Threat Radar
- Events & Outreach Calendar
- Project Mission Control
- AI-Generated Daily Briefing
- Financial & Compliance Command
- Coalition & Seat Forecasting
- Voter Intelligence Overview
- Multi-State Readiness
- Bulk Operations
- Audit & Security Center
- System Health Monitor
- Founder Notifications Hub

---

## 🔒 Critical Security TODO

1. Rotate default MySQL password
2. Disable root SSH password login
3. Set git user.name / user.email
4. Force password reset on first login for all politician accounts
5. Audit generic CRUD endpoints for politician_id scoping leaks
6. Remove duplicate `/api/founder/dashboard` route or redirect to v2

---

## Next Immediate Actions

1. Fix `constituency_profiles` CRUD to be politician-scoped
2. Auto-create a `constituency_profiles` row for Harish if missing
3. Rebuild and verify Profile page renders + edits work
4. Commit the status fixes
5. Resume Phase 2: Media & Sentiment War Room

---

## Development Rules

- Backup DB + code before schema or route changes
- Commit small, reviewable changes with clear messages
- Run `pnpm run build` before every `systemctl restart pos-web`
- Never paste passwords or JWT tokens in chat
- Clear shell history after typing secrets (`history -c`)
