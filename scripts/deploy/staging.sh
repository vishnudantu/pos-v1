#!/bin/bash

# NETHRA POS-v1 Staging Deployment Script
# Deploys from develop branch to staging environment

echo "🚀 Starting staging deployment..."

# Create snapshot before deployment
echo "📸 Creating pre-deployment snapshot..."
/root/pos-v1/scripts/backup/snapshot.sh

# Build the application
echo "🔨 Building application..."
cd /root/pos-v1
npm install
npm run build

# Copy to staging directory (separate from production)
echo "📦 Deploying to staging..."
STAGING_DIR="/var/www/thoughtfirst-staging"
mkdir -p ${STAGING_DIR}
cp -r /root/pos-v1/apps/web/dist/* ${STAGING_DIR}/

# Set permissions
chown -R www-data:www-data ${STAGING_DIR}

# Create staging nginx config
cat > /etc/nginx/sites-available/thoughtfirst-staging << 'ENDNGINX'
server {
    listen 80;
    server_name staging.thoughtfirst.in;
    
    root /var/www/thoughtfirst-staging;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3003;  # Different port for staging API
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
ENDNGINX

# Enable staging site
ln -sf /etc/nginx/sites-available/thoughtfirst-staging /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "✅ Staging deployed successfully!"
echo "🌐 URL: http://staging.thoughtfirst.in"
echo "📝 Don't forget to test before production deploy!"
