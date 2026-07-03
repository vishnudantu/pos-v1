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
- Top Performers, Risk Watch, Activity Feed, State Map tabs
- Party Summary
- Pulsing LIVE indicator + 30-second auto-refresh + manual refresh
- One-click politician profile access from health cards

### Data Pipeline
- Sentiment queue schema mismatch fixed
- Added `source_type`, `received_at`, and sentiment score columns
- Unified `/api/founder-v2/dashboard` endpoint serving real data

### Security & Access
- Politician login created: `hbalayogi@thoughtfirst.in` / `Admin@123`
- Politician profile PUT endpoint secured to own profile only
- Global dark-theme form styles applied

### Politician Self-Service
- Profile page renders correctly (JSX duplicate fixed)
- "New Profile" button hidden for non-super-admins
- Constituency profile edit in progress (adding missing DB columns)

---

## ⚠️ In Progress

| Area | Status |
|---|---|
| Constituency edit/save | Adding missing columns: `urban_population_pct`, `rural_population_pct`, `key_facts`, `key_industries`, `revenue_divisions`, `assembly_segments`, `notes` |
| Grievance Command Center tab | Backend ready, frontend needs clean component wiring |
| Founder Dashboard build | Clean build after fixing `registered_voters` → `total_voters` |

---

## ❌ Not Started

- Media & Sentiment War Room
- Opposition Threat Radar
- Events & Outreach Calendar
- Project Mission Control
- AI Daily Briefing
- Financial & Compliance Command
- Coalition & Seat Forecasting
- Voter Intelligence
- Multi-State Readiness
- Bulk Operations
- Audit & Security Center
- System Health Monitor
- Founder Notifications Hub

---

## 🔒 Security TODO

1. Rotate default MySQL password
2. Disable root SSH password login
3. Set git user.name / user.email
4. Force password reset on first login for politician accounts
5. Audit generic CRUD endpoints for scoping leaks
6. Remove duplicate `/api/founder/dashboard` route

---

## Next Actions

1. Apply constituency column migration
2. Verify edit/save works for Harish
3. Commit migration file to repo
4. Resume Phase 2: Media & Sentiment War Room
