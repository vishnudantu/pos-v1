# POS v1 Deployment Summary

## Services Running

1. **API Service**
   - Port: 3002
   - Status: ✅ Running
   - systemd service: pos-api
   - Direct access: http://localhost:3002 or http://5.189.147.105:3002
   - Health check: http://localhost:3002/api/health

2. **Web Service**
   - Port: 4173 (vite preview default)
   - Status: ✅ Running
   - systemd service: pos-web
   - Direct access: http://localhost:4173 or http://5.189.147.105:4173

## Nginx Configuration

- API: http://api.pos.local/ or http://localhost/ (with Host header) → http://localhost:3002
- Web: http://pos.local/ or http://localhost/ (with Host header) → http://localhost:4173

## Next Steps

1. Update nginx configuration with your actual domain names
2. Point your domain names to this server's IP address (5.189.147.105)
3. Set up SSL certificates using Let's Encrypt
4. Configure the database connection in the .env file
5. Set up proper security measures

## Useful Commands

- Check service status: `systemctl status pos-api` and `systemctl status pos-web`
- View logs: `journalctl -u pos-api -f` and `journalctl -u pos-web -f`
- Restart services: `systemctl restart pos-api` and `systemctl restart pos-web`
- Check ports: `netstat -tulpn | grep -E "(3002|4173)"`
- Test nginx: `nginx -t`

## Server IP
5.189.147.105
