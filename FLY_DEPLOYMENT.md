# Fly.io Deployment Guide for Footoshop

## Prerequisites
1. Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
2. Sign up for Fly.io account
3. Login: `flyctl auth login`

## Backend Deployment

1. Navigate to project root:
   ```bash
   cd /path/to/Footoshop-E-commerce
   ```

2. Deploy backend:
   ```bash
   flyctl launch --copy-config --name footoshop-backend
   flyctl deploy
   ```

3. Your backend will be available at: `https://footoshop-backend.fly.dev`

## Frontend Deployment

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Deploy frontend:
   ```bash
   flyctl launch --copy-config --name footoshop-frontend
   flyctl deploy
   ```

3. Your frontend will be available at: `https://footoshop-frontend.fly.dev`

## Post-Deployment

1. Update backend CORS settings to include your frontend URL
2. Test all functionality
3. Monitor logs: `flyctl logs`

## Important Notes

- Free tier includes 3 shared-cpu-1x 256mb VMs
- SQLite database persists on the VM
- Apps sleep after inactivity (free tier)
- HTTPS is automatic

## Troubleshooting

- Check logs: `flyctl logs`
- SSH into app: `flyctl ssh console`
- Monitor status: `flyctl status`
