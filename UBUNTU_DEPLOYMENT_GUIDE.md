# Ubuntu Server Deployment & Setup Guide for Node.js Application

A complete step-by-step guide to setting up a fresh Ubuntu server and hosting your Node.js application from GitHub with PM2, Nginx reverse proxy, and SSL.

---

## 1. Connect to Ubuntu Server
From your local machine (Terminal / PowerShell):
```bash
ssh root@YOUR_SERVER_IP
```

---

## 2. Update System & Install Core Packages
Run package updates and install essential build tools (needed for native modules like `bcrypt`):
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ufw
```

---

## 3. Install Node.js (v20 LTS) & PM2
```bash
# Setup NodeSource repository for Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify versions
node -v
npm -v

# Install PM2 globally (Process Manager to keep app running 24/7)
sudo npm install -g pm2
```

---

## 4. Install & Setup MongoDB (Compatible with all VPS / Cloud CPUs)
`signal=ILL (core-dump)` occurs when a VPS CPU lacks newer AVX instruction flags required by MongoDB 5.0+. Running MongoDB 4.4 or MongoDB via Docker resolves this completely.

### Option A: Install via Docker (Recommended, Fast & Reliable)
```bash
# 1. Remove failed package
sudo apt purge -y mongodb-org*
sudo rm -f /etc/apt/sources.list.d/mongodb-org-*.list

# 2. Install Docker
sudo apt install -y docker.io

# 3. Start Docker and enable on boot
sudo systemctl start docker
sudo systemctl enable docker

# 4. Run MongoDB container with automatic restart and persistent data storage
sudo docker run -d \
  --name mongodb \
  --restart always \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:4.4

# 5. Check if MongoDB container is running
sudo docker ps
```

---

### Option B: Native MongoDB 4.4 (No Docker)
If you prefer native packages without Docker:
```bash
# 1. Remove MongoDB 8
sudo apt purge -y mongodb-org*
sudo rm -f /etc/apt/sources.list.d/mongodb-org-*.list

# 2. Import MongoDB 4.4 GPG key and repo
curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-4.4.gpg \
   --dearmor --yes

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-4.4.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list

sudo apt update
sudo apt install -y mongodb-org=4.4.29 mongodb-org-server=4.4.29 mongodb-org-shell=4.4.29 mongodb-org-mongos=4.4.29 mongodb-org-tools=4.4.29

sudo systemctl daemon-reload
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

---

## 5. Clone GitHub Project
```bash
# Create and navigate to web root directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
git clone https://github.com/SherSinghDev/Post_Dashboard.git

# Enter project directory
cd Post_Dashboard
```

---

## 6. Install Dependencies & Setup Environment Variables
```bash
# Install production dependencies
npm install --production

# Create and edit .env file
nano .env
```
*Paste your environment variables into `.env`:*
```env
RAZORPAY_KEY_ID=rzp_live_SOGFR6WMAl7Acl
RAZORPAY_KEY_SECRET=jLJLcASdgLVZvdVcVmWtb67y
# Add your other environment variables if any
```
*(Press `Ctrl + O` and `Enter` to save, then `Ctrl + X` to exit nano)*

---

## 7. Start Application with PM2
```bash
# Start your application
pm2 start src/index.js --name "post-dashboard"

# Save PM2 state
pm2 save

# Setup PM2 startup script on system reboot (run the generated command shown in terminal output)
pm2 startup
```

### Useful PM2 Management Commands:
- `pm2 status` — Check status of running apps
- `pm2 logs post-dashboard` — View live application logs
- `pm2 restart post-dashboard` — Restart application
- `pm2 stop post-dashboard` — Stop application

---

## 8. Setup Nginx Reverse Proxy
Install Nginx to forward standard web traffic (Port 80/443) to your Node.js application (Port 3200):
```bash
# Install Nginx
sudo apt install -y nginx

# Create a custom Nginx configuration file
sudo nano /etc/nginx/sites-available/bsrfindia
```

*Paste the following configuration:*
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name bsrfindia.com www.bsrfindia.com;

    location / {
        proxy_pass http://127.0.0.1:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

*Enable the site and reload Nginx:*
```bash
# Enable the new configuration
sudo ln -s /etc/nginx/sites-available/bsrfindia /etc/nginx/sites-enabled/

# Remove default site configuration
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration for errors
sudo nginx -t

# Restart Nginx service
sudo systemctl restart nginx
```

---

## 9. Setup Firewall (UFW)
```bash
# Allow SSH, HTTP and HTTPS traffic
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 10. Point DNS Records to Server IP (203.57.85.105)
Log in to your Domain Registrar (GoDaddy, Namecheap, Cloudflare, Hostinger, etc.) and add/edit the following **DNS Records**:

| Type | Host / Name | Value / Points to | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (or leave empty) | `203.57.85.105` | Auto / 300 |
| **A** (or CNAME) | `www` | `203.57.85.105` (or `bsrfindia.com`) | Auto / 300 |

*(Wait 2–5 minutes for DNS propagation before running Certbot)*

---

## 11. Install Free SSL Certificate (HTTPS via Certbot)
Once your DNS is pointed to `203.57.85.105`, secure your site with HTTPS:
```bash
# Install Certbot & Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Request and install SSL certificate automatically
sudo certbot --nginx -d bsrfindia.com -d www.bsrfindia.com
```
*Follow the prompts on screen (enter your email, accept terms `Y`). Certbot will automatically update Nginx for HTTPS and handle automatic renewals!*

---

## 12. Future Deployments / Updates Workflow
Whenever you push changes to GitHub, run these commands to update your live server:
```bash
cd /var/www/Post_Dashboard
git pull origin main
npm install --production
pm2 reload post-dashboard
```

---

---

## 14. Connect MongoDB Compass via SSH Tunnel (Secure & Recommended)
You don't need to expose port 27017 to the public internet. Connect securely using an SSH tunnel:

1. Open **MongoDB Compass** on your local machine.
2. Click **Add new connection** / **Edit connection string**.
3. Set the URI to:
   ```text
   mongodb://127.0.0.1:27017/parceldb
   ```
4. Click on **Advanced Connection Options** tab.
5. Go to the **Proxy/SSH** tab:
   - **SSH Tunnel Method:** Select `SSH with Password` (or `SSH with Identity File/Key`)
   - **SSH Hostname:** `203.57.85.105`
   - **SSH Port:** `22`
   - **SSH Username:** `root`
   - **SSH Password:** *(Your server root password)*
6. Click **Save & Connect**.
