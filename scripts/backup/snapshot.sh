#!/bin/bash

# NETHRA POS-v1 Automated Snapshot Script
# Creates timestamped backup before major changes

TIMESTAMP=$(date +%Y%m%d-%H%M)
BACKUP_DIR="/root/backups/snapshot-${TIMESTAMP}"
DB_USER="thoughtfirst"
DB_PASS="Q4Mz2s7Y[bAs777"
DB_NAME="thoughtfirst"

echo "🔍 Creating snapshot at ${TIMESTAMP}..."

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup database
echo "📦 Backing up database..."
mysqldump -u ${DB_USER} -p'${DB_PASS}' ${DB_NAME} > ${BACKUP_DIR}/database-backup.sql

# Backup production frontend
echo "📦 Backing up production frontend..."
cp -r /var/www/thoughtfirst-frontend ${BACKUP_DIR}/production-frontend

# Backup server code
echo "📦 Backing up server code..."
cp -r /root/server ${BACKUP_DIR}/server-working

# Backup web app code
echo "📦 Backing up web app code..."
cp -r /root/nethra-thought ${BACKUP_DIR}/nethra-thought-working

# Create SNAPSHOT.md
echo "📦 Creating snapshot documentation..."
cat > ${BACKUP_DIR}/SNAPSHOT.md << EOF
# NETHRA POS-v1 Snapshot

## Timestamp: ${TIMESTAMP}
## Date: $(date +%Y-%m-%d)
## Time: $(date +%H:%M:%S)

## Git Status
$(cd /root/pos-v1 && git log --oneline -1)

## Branch: $(cd /root/pos-v1 && git branch --show-current)

## Files Backed Up:
$(ls -lah ${BACKUP_DIR}/)

## Database Size:
$(du -h ${BACKUP_DIR}/database-backup.sql)

## Reason for Snapshot:
[Fill this in before running]

## Changed By:
[Fill this in]

## Tested:
- [ ] Login works
- [ ] Dashboard loads
- [ ] API responds
- [ ] No errors in logs

EOF

# Compress backup
echo "📦 Compressing backup..."
tar -czf ${BACKUP_DIR}.tar.gz -C /root/backups snapshot-${TIMESTAMP}
rm -rf ${BACKUP_DIR}

echo "✅ Snapshot created: ${BACKUP_DIR}.tar.gz"
echo "📍 Location: /root/backups/"
