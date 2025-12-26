# 🚀 EC2 Deployment Guide for GolfMaps

This guide provides step-by-step instructions for deploying GolfMaps on AWS EC2 with Nginx and PM2.

## Prerequisites

- AWS EC2 instance (Amazon Linux 2023 recommended)
- Node.js 20+ installed
- Git installed
- SSH access to EC2 instance

## Step 1: Initial Server Setup

### Connect to EC2
```bash
ssh -i ~/.ssh/your-key.pem ec2-user@your-ec2-ip
```

### Install Node.js 20
```bash
sudo yum remove nodejs -y
sudo yum install -y nodejs20 npm20
node --version  # Should show v20.x.x
npm --version
```

### Install Git (if not already installed)
```bash
sudo yum install git -y
```

### Install PM2 globally
```bash
sudo npm install -g pm2
```

### Install Nginx
```bash
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Step 2: Clone and Setup Project

```bash
cd ~
git clone <your-repo-url> golfmaps
cd golfmaps
```

### Install dependencies
```bash
rm -rf node_modules .next
npm install
```

### Create `.env.local` file
```bash
nano .env.local
```

Add all required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
WEATHER_API_KEY=your_weather_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

Save and exit (Ctrl+X, Y, Enter)

## Step 3: Build the Application

```bash
npm run build
```

Verify the build succeeded - you should see:
```
✓ Compiled successfully
```

## Step 4: Configure PM2

### Update ecosystem.config.js
Edit `ecosystem.config.js` and update the `cwd` path to match your project location:
```javascript
cwd: '/home/ec2-user/golfmaps',  // Update this
```

### Create logs directory
```bash
mkdir -p logs
```

### Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the instructions it prints to enable auto-start on boot
```

### Verify PM2 is running
```bash
pm2 list
pm2 logs golfmaps  # View logs
```

## Step 5: Configure Nginx

### Copy Nginx configuration
```bash
sudo cp nginx.conf.example /etc/nginx/conf.d/golfmaps.conf
```

### Edit the configuration
```bash
sudo nano /etc/nginx/conf.d/golfmaps.conf
```

Update:
- `server_name` with your domain or EC2 public IP
- Verify `proxy_pass` points to `http://localhost:3000`

### Test Nginx configuration
```bash
sudo nginx -t
```

### Reload Nginx
```bash
sudo systemctl reload nginx
```

## Step 6: Configure AWS Security Group

Ensure your EC2 security group allows:
- **Inbound HTTP (port 80)** from `0.0.0.0/0`
- **Inbound HTTPS (port 443)** if using SSL (optional)
- **Inbound SSH (port 22)** from your IP

## Step 7: Verify Deployment

### Check health endpoint
```bash
curl http://localhost:3000/api/health
```

Or from your browser:
```
http://your-ec2-ip/api/health
```

### Check PM2 status
```bash
pm2 status
pm2 logs golfmaps --lines 50
```

### Check Nginx status
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/golfmaps-error.log
```

## Troubleshooting

### API Routes Not Working

1. **Check environment variables:**
   ```bash
   cd ~/golfmaps
   node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
   ```

2. **Check PM2 logs:**
   ```bash
   pm2 logs golfmaps --err
   ```

3. **Check API health:**
   ```bash
   curl http://localhost:3000/api/health
   ```

4. **Test Supabase connection:**
   ```bash
   curl http://localhost:3000/api/courses
   ```

5. **Check Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/golfmaps-error.log
   ```

### No Course Markers Appearing

1. **Verify courses exist in database:**
   - Check Supabase dashboard
   - Run seed script if needed

2. **Check browser console:**
   - Open browser DevTools
   - Look for errors in Console tab
   - Check Network tab for failed API requests

3. **Verify Mapbox token:**
   - Check `.env.local` has `NEXT_PUBLIC_MAPBOX_TOKEN`
   - Verify token is valid in Mapbox dashboard

### Weather/Busyness Not Loading

1. **Check API keys:**
   ```bash
   grep WEATHER_API_KEY .env.local
   grep GOOGLE_PLACES_API_KEY .env.local
   ```

2. **Test API endpoints directly:**
   ```bash
   # Get a course ID first
   curl http://localhost:3000/api/courses | jq '.[0].id'
   
   # Test weather (replace COURSE_ID)
   curl "http://localhost:3000/api/weather?courseId=COURSE_ID"
   
   # Test busyness
   curl "http://localhost:3000/api/busyness?courseId=COURSE_ID"
   ```

3. **Check external API access:**
   - Verify EC2 security group allows outbound HTTPS
   - Test API keys are valid

### PM2 Issues

**Restart application:**
```bash
pm2 restart golfmaps
```

**Stop application:**
```bash
pm2 stop golfmaps
```

**Delete and restart:**
```bash
pm2 delete golfmaps
pm2 start ecosystem.config.js
```

**View detailed logs:**
```bash
pm2 logs golfmaps --lines 100
```

### Nginx Issues

**Test configuration:**
```bash
sudo nginx -t
```

**Reload configuration:**
```bash
sudo systemctl reload nginx
```

**Restart Nginx:**
```bash
sudo systemctl restart nginx
```

**Check error logs:**
```bash
sudo tail -50 /var/log/nginx/golfmaps-error.log
```

## Updating the Application

When you make changes:

1. **Pull latest code:**
   ```bash
   cd ~/golfmaps
   git pull
   ```

2. **Install new dependencies (if any):**
   ```bash
   npm install
   ```

3. **Rebuild:**
   ```bash
   npm run build
   ```

4. **Restart PM2:**
   ```bash
   pm2 restart golfmaps
   ```

5. **Verify:**
   ```bash
   pm2 logs golfmaps --lines 20
   curl http://localhost:3000/api/health
   ```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit  # Real-time monitoring dashboard
pm2 status # Quick status check
```

### Health Check Script
Create a simple monitoring script:
```bash
#!/bin/bash
# health-check.sh
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ $response -eq 200 ]; then
    echo "✓ Application is healthy"
else
    echo "✗ Application returned status: $response"
    pm2 restart golfmaps
fi
```

## Security Considerations

1. **Firewall:** Consider using `ufw` or `firewalld` to restrict access
2. **SSL/TLS:** Set up Let's Encrypt for HTTPS
3. **Environment Variables:** Never commit `.env.local` to git
4. **Updates:** Keep Node.js and system packages updated

## Next Steps

- Set up SSL/TLS with Let's Encrypt
- Configure domain name DNS
- Set up automated backups
- Configure CloudWatch monitoring
- Set up log rotation

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs golfmaps`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/golfmaps-error.log`
3. Check health endpoint: `curl http://localhost:3000/api/health`
4. Review this troubleshooting guide

