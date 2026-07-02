# NETHRA (POS v1) — Project Log

> **MOAT** = Mother Of All Time  
> **GOAT** = Greatest Of All Time  
> Goal: Build the ultimate, production-grade political intelligence platform for Indian politicians.

---

## Server Details

- **Server IP**: 5.189.147.105
- **Hostname**: vmi3284430
- **OS**: Ubuntu 24.04 Noble
- **Project Path**: `/var/www/pos-v1-clean`
- **Frontend URL**: https://thoughtfirst.in
- **API URL**: https://api.thoughtfirst.in
- **Admin Login**: admin@thoughtfirst.in / Admin@123

---

## Architecture

- `apps/web`: React + Vite + Tailwind frontend
- `apps/api`: Node.js + Express + MySQL backend
- `packages`: Shared libraries (monorepo via pnpm/turbo)
- **Database**: MySQL `pos_db` on localhost:3306
- **Reverse Proxy**: Nginx with Let's Encrypt SSL
- **Services**: `pos-api` (port 3002), `pos-web` (port 4173), `nginx`, `mysql`

---

## What Has Been Completed

### 1. Login Fix
- **Problem**: API could not read `.env` because systemd started it from `apps/api/`, but `.env` was at repo root.
- **Fix**: Created symlink `apps/api/.env → /var/www/pos-v1-clean/.env`
- **Result**: Login now works, API returns valid JWT tokens.

### 2. Admin Password Reset
- **Problem**: Admin password hash did not match `Admin@123`.
- **Fix**: Updated `users.password_hash` for `admin@thoughtfirst.in` using bcrypt.
- **Result**: Browser login succeeds.

### 3. Database Schema Expansion
- Recreated `politician_profiles` with full column set (bio, education, vote counts, margins, etc.)
- Created missing core tables:
  - `election_results`, `constituency_profiles`, `politician_details`
  - `grievances`, `projects`, `events`, `team_members`, `voters`
  - `media_mentions`, `finances`, `communications`, `documents`, `appointments`
  - `polls`, `poll_responses`, `citizen_engagements`, `volunteers`, `suggestions`
  - `booths`, `sentiment_scores`, `opposition_intelligence`, `voice_reports`
  - `ai_briefings`, `ai_generated_content`, `promises`, `notifications`
  - `feature_modules`, `feature_flags`, `politician_module_access`, `politician_feature_access`
  - `audit_logs`, `website_content`, `platform_settings`, `admin_reports`
  - WhatsApp, Darshan, Parliamentary, Future Lab, and AI training tables
- **Result**: Dashboard API now loads without table-not-found errors.

### 4. Real TDP Politician Data Seeded
- **25 politicians** inserted:
  - 16 TDP MPs from Andhra Pradesh (2024 Lok Sabha)
  - 9 TDP MLAs from Andhra Pradesh (2024 Assembly)
- Includes: name, constituency, district, party, designation, vote counts, winning margins
- Also seeded `election_results` and `constituency_profiles` for each.

### 5. Module & Feature Access
- Triggered API to create default `feature_modules` (51) and `feature_flags` (31)
- Enabled all modules and features for all 25 politicians via cross-join inserts.

### 6. Dashboard API Fixed
- `/api/founder/dashboard` now returns `total_politicians: 25` and politician list.
- `/api/access/summary` returns all enabled modules/features.

---

## Sample Data Seeded

Run `/tmp/seed_sample_data.sql` to populate:
- Grievances
- Projects
- Events
- Media mentions
- Sentiment scores
- Opposition intelligence

---

## Known Security Issues (TO FIX)

> ⚠️ These must be resolved before production/real use.

1. **Default secrets exposed** in gist:
   - `JWT_SECRET` is weak/default
   - `DB_PASSWORD` is `pos_password`
   - Admin password is `Admin@123`
   - SSH root password was exposed
   - **Action needed**: Rotate all of these.

2. **Hardcoded API key** in `apps/api/index.js`:
   - Line in Mistral branch: `'Authorization': `Bearer ${'6z87gOvz3u4TTVmLqTIUbP3QoL2c7GOT'}``
   - **Action needed**: Remove hardcoded key and use secret store.

3. **Deprecated npm package**:
   - `crypto` package in `package.json` should be removed; Node.js has built-in `crypto`.

4. **SQL injection risk**:
   - Dynamic CRUD route uses `order.replace(/[^a-zA-Z_]/g,'')` — should be whitelisted.
   - Some query parameters are not fully parameterized.

5. **CORS conflict**:
   - Nginx adds `Access-Control-Allow-Origin *` while Express also handles CORS.
   - **Action needed**: Let Express handle CORS and remove from Nginx.

6. **No helmet / rate limiting**:
   - **Action needed**: Add `helmet`, `express-rate-limit`, input validation.

7. **Vite preview in production**:
   - `apps/web` is served via `vite preview`, which is not suitable for production.
   - **Action needed**: Serve static build from Nginx or a proper static server.

---

## Next Steps

### Immediate
1. Refresh browser dashboard and confirm 25 politicians appear.
2. Seed sample operational data.
3. Commit and push this log file.

### Security (MOAT layer)
1. Rotate JWT_SECRET, DB password, admin password, SSH password.
2. Remove hardcoded API key.
3. Remove `crypto` npm package.
4. Add `helmet`, rate limiting, input validation.
5. Fix SQL injection in CRUD.
6. Fix Nginx CORS.

### Scaling (GOAT layer)
1. Add real-time data ingestion for news/media.
2. Build constituency-level dashboards.
3. Add voter database with booth-level segmentation.
4. Add grievance workflow with SLA tracking.
5. Add project monitoring with budget risk.
6. Add AI assistant with context training.
7. Replace `vite preview` with Nginx static hosting.

---

## Useful Commands

```bash
# Restart services
systemctl restart pos-api pos-web nginx

# View API logs
journalctl -u pos-api -f

# View web logs
journalctl -u pos-web -f

# Test login
curl -s -X POST https://api.thoughtfirst.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thoughtfirst.in","password":"Admin@123"}'

# Test dashboard
TOKEN=$(curl -s -X POST https://api.thoughtfirst.in/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thoughtfirst.in","password":"Admin@123"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl -s https://api.thoughtfirst.in/api/founder/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Database shell
mysql -u pos_user -p pos_db

### 7. Founder-v2 Command Center APIs (Added)
Created new route file `apps/api/routes/founder.js` and mounted at `/api/founder-v2`:
- `GET /api/founder-v2/overview` — platform-wide aggregated metrics
- `GET /api/founder-v2/ranking` — politician performance ranking
- `GET /api/founder-v2/audit` — paginated audit log viewer
- `GET /api/founder-v2/health` — system + AI provider health
- `GET /api/founder-v2/state-map` — state/district politician grouping
- `GET /api/founder-v2/activity` — recent logins and audit activity
- `GET /api/founder-v2/party-summary` — party-wise MP/MLA counts

All endpoints require `super_admin` role.
