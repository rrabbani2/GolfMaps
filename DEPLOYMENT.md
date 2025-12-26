# Deployment Guide

## Overview

This guide covers deploying GolfMaps to an Amazon Linux EC2 instance. You can use FileZilla (SFTP) to upload files, but you'll also need to build and run the application on the server.

## Prerequisites

- Amazon Linux EC2 instance running
- SSH access to your EC2 instance
- FileZilla or another SFTP client installed
- Domain name (optional, or use EC2 public IP)

## Step 1: Prepare Your Local Project

1. **Build the project locally to test:**
   ```bash
   npm run build
   ```

2. **Create a deployment package (optional):**
   ```bash
   # Create a tarball excluding node_modules
   tar --exclude='node_modules' --exclude='.next' --exclude='.git' \
       -czf golfmaps-deploy.tar.gz .
   ```

## Step 2: Set Up EC2 Instance

### Connect via SSH:
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### Install Node.js (using NVM):
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version
npm --version
```

### Install PM2 (Process Manager):
```bash
npm install -g pm2
```

### Install NGINX:
```bash
sudo yum update -y
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 3: Upload Files Using FileZilla

1. **Open FileZilla**
2. **Connect to your EC2 instance:**
   - Host: `sftp://your-ec2-ip` or `sftp://your-domain.com`
   - Username: `ec2-user` (or your EC2 username)
   - Password: Leave blank (use key file)
   - Port: 22
   - Protocol: SFTP
   - Key file: Select your `.pem` file in FileZilla settings

3. **Create project directory on server:**
   - Navigate to `/home/ec2-user/` (or `/home/ubuntu/` on Ubuntu)
   - Create folder: `golfmaps`

4. **Upload project files:**
   - Upload all files EXCEPT:
     - `node_modules/` (don't upload this)
     - `.next/` (will be built on server)
     - `.git/` (optional)
     - `.env.local` (you'll create this on server)
   
   **Files to upload:**
   - All source files (`app/`, `components/`, `lib/`, `styles/`, etc.)
   - Configuration files (`package.json`, `tsconfig.json`, `next.config.mjs`, etc.)
   - `supabase/` folder

## Step 4: Set Up on Server

### SSH into your server and navigate to project:
```bash
cd ~/golfmaps
```

### Install dependencies:
```bash
npm install --production
```

### Create `.env.local` file:
```bash
nano .env.local
```

Add your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
WEATHER_API_KEY=your_weather_api_key
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

Save and exit (Ctrl+X, then Y, then Enter).

### Build the application:
```bash
npm run build
```

This will create the `.next/` folder with optimized production files.

## Step 5: Start Application with PM2

```bash
# Start the application
pm2 start npm --name "golfmaps" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
# Follow the instructions it prints
```

### PM2 Useful Commands:
```bash
pm2 list              # View running processes
pm2 logs golfmaps     # View logs
pm2 restart golfmaps  # Restart app
pm2 stop golfmaps     # Stop app
pm2 delete golfmaps   # Remove from PM2
```

## Step 6: Configure NGINX

### Create NGINX configuration:
```bash
sudo nano /etc/nginx/conf.d/golfmaps.conf
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your EC2 public IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Test and reload NGINX:
```bash
# Test configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx
```

## Step 7: Configure Firewall (Security Group)

In AWS Console, ensure your EC2 Security Group allows:
- **Inbound:** Port 80 (HTTP) from `0.0.0.0/0`
- **Inbound:** Port 443 (HTTPS) from `0.0.0.0/0` (if using SSL)
- **Inbound:** Port 22 (SSH) from your IP only

## Step 8: Verify Deployment

1. Visit `http://your-ec2-ip` or `http://your-domain.com`
2. Check that the map loads
3. Test authentication
4. Verify all features work

## Troubleshooting

### Application won't start:
```bash
# Check PM2 logs
pm2 logs golfmaps

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Restart PM2
pm2 restart golfmaps
```

### NGINX 502 Bad Gateway:
- Verify app is running: `pm2 list`
- Check app logs: `pm2 logs golfmaps`
- Verify NGINX config: `sudo nginx -t`

### Environment variables not working:
- Ensure `.env.local` exists in project root
- Restart PM2 after changing env vars: `pm2 restart golfmaps`

### Build errors:
```bash
# Clear and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## Updating the Application

When you make changes:

1. **Upload changed files via FileZilla**
2. **SSH into server:**
   ```bash
   cd ~/golfmaps
   ```
3. **Pull changes (if using git) or rebuild:**
   ```bash
   npm install  # if package.json changed
   npm run build
   pm2 restart golfmaps
   ```

## Optional: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## Summary

**FileZilla is used for:**
- ✅ Uploading source code files
- ✅ Transferring configuration files
- ✅ Updating files after changes

**But you still need to:**
- ✅ Build the application on the server (`npm run build`)
- ✅ Install dependencies (`npm install`)
- ✅ Run the server (PM2)
- ✅ Configure NGINX as reverse proxy

FileZilla is just the file transfer tool - the actual deployment requires building and running the Node.js application on your EC2 instance.

