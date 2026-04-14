#!/bin/bash

# NETHRA POS-v1 Automated Snapshot Script
# Creates timestamped backup before major changes

TIMESTAMP=$(date +%Y%m%d-%H%M)
DB_NAME="thoughtfirst"
TEMP_DIR="/root/tmp/snapshot-${TIMESTAMP}"
BACKUP_DIR="/root/backups"

echo "🔍 Creating snapshot at ${TIMESTAMP}..."

# Create temp directory
mkdir -p ${TEMP_DIR}

# Check disk space first
DISK_USAGE=$(df /root | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "⚠️  WARNING: Disk usage at ${DISK_USAGE}%. Cleaning old backups..."
    # Keep only last 2 snapshots
    cd ${BACKUP_DIR} && ls -t snapshot-*.tar.gz 2>/dev/null | tail -n +3 | xargs rm -f
    echo "✅ Cleaned old snapshots"
fi

# Backup database
echo "📦 Backing up database..."
cat > ${TEMP_DIR}/.my.cnf << EOF
[client]
user=thoughtfirst
password=Q4Mz2s7Y[bAs777
EOF
chmod 600 ${TEMP_DIR}/.my.cnf
mysqldump --defaults-file=${TEMP_DIR}/.my.cnf ${DB_NAME} > ${TEMP_DIR}/database-backup.sql
rm -f ${TEMP_DIR}/.my.cnf

# Verify database backup
if [ -s ${TEMP_DIR}/database-backup.sql ]; then
    echo "✅ Database backup successful ($(du -h ${TEMP_DIR}/database-backup.sql | cut -f1))"
else
    echo "⚠️  Database backup is empty!"
fi

# Backup production frontend
echo "📦 Backing up production frontend..."
cp -r /var/www/thoughtfirst-frontend ${TEMP_DIR}/production-frontend

# Backup server code (exclude node_modules)
echo "📦 Backing up server code..."
mkdir -p ${TEMP_DIR}/server-working
rsync -a --exclude='node_modules' --exclude='*.log' /root/server/ ${TEMP_DIR}/server-working/

# Backup web app code (exclude node_modules, dist, .git)
echo "📦 Backing up web app code..."
mkdir -p ${TEMP_DIR}/nethra-thought-working
rsync -a --exclude='node_modules' --exclude='dist' --exclude='.git' --exclude='*.log' /root/nethra-thought/ ${TEMP_DIR}/nethra-thought-working/

# Get git status
GIT_LOG=$(cd /root/pos-v1 && git log --oneline -1)
GIT_BRANCH=$(cd /root/pos-v1 && git branch --show-current)

# Create SNAPSHOT.md
echo "📦 Creating snapshot documentation..."
cat > ${TEMP_DIR}/SNAPSHOT.md << EOF
# NETHRA POS-v1 Snapshot

## Timestamp: ${TIMESTAMP}
## Date: $(date +%Y-%m-%d)
## Time: $(date +%H:%M:%S)

## Git Status
${GIT_LOG}

## Branch: ${GIT_BRANCH}

## Files Backed Up:
$(ls -lah ${TEMP_DIR}/)

## Database Size:
$(du -h ${TEMP_DIR}/database-backup.sql)

## Disk Usage:
$(df -h /root | tail -1)

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
tar -czf ${BACKUP_DIR}/snapshot-${TIMESTAMP}.tar.gz -C ${TEMP_DIR} .
rm -rf ${TEMP_DIR}

echo "✅ Snapshot created: ${BACKUP_DIR}/snapshot-${TIMESTAMP}.tar.gz"
echo "📍 Location: ${BACKUP_DIR}/"
echo "💾 Size: $(du -h ${BACKUP_DIR}/snapshot-${TIMESTAMP}.tar.gz | cut -f1)"
