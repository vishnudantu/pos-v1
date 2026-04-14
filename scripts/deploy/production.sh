#!/bin/bash

# NETHRA POS-v1 Production Deployment Script
# Deploys from main branch to production with mandatory snapshot

echo "🚀 Starting PRODUCTION deployment..."
echo "⚠️  This will affect live site: thoughtfirst.in"

# Require confirmation
read -p "Have you tested on staging? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled. Test on staging first."
    exit 1
fi

# Create mandatory snapshot
echo "📸 Creating MANDATORY pre-deployment snapshot..."
/root/pos-v1/scripts/backup/snapshot.sh

# Checkout main branch
echo "📦 Checking out main branch..."
cd /root/pos-v1
git checkout main
git pull origin main

# Build for production
echo "🔨 Building for production..."
npm install
npm run build

# Backup current production
echo "📦 Backing up current production..."
cp -r /var/www/thoughtfirst-frontend /var/www/thoughtfirst-frontend.backup.$(date +%Y%m%d-%H%M)

# Deploy new build
echo "📦 Deploying new build..."
cp -r /root/pos-v1/dist/* /var/www/thoughtfirst-frontend/
chown -R www-data:www-data /var/www/thoughtfirst-frontend/

# Reload nginx
echo "🔄 Reloading nginx..."
nginx -t && systemctl reload nginx

# Restart API
echo "🔄 Restarting API..."
pm2 restart thoughtfirst-api --update-env

# Verify deployment
echo "✅ Verifying deployment..."
sleep 5
curl -s -o /dev/null -w "%{http_code}" https://thoughtfirst.in

echo ""
echo "✅ PRODUCTION DEPLOYMENT COMPLETE!"
echo "🌐 URL: https://thoughtfirst.in"
echo "📝 Snapshot saved at: /root/backups/"
echo "🔙 Rollback: cp -r /var/www/thoughtfirst-frontend.backup.* /var/www/thoughtfirst-frontend/"
