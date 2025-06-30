# Footoshop Deployment Checklist

## Pre-Deployment
- [ ] Push all code to GitHub repository
- [ ] Ensure all files are committed
- [ ] Test the application locally
- [ ] Verify database is working correctly

## Render Backend Deployment
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Set Start Command to `deno run --allow-net --allow-read --allow-write app.ts`
- [ ] Add environment variables:
  - [ ] PORT=8000
  - [ ] DENO_DEPLOY=true
- [ ] Deploy and verify backend is running

## Render Frontend Deployment  
- [ ] Create new Static Site on Render
- [ ] Connect same GitHub repository
- [ ] Set Root Directory to `frontend`
- [ ] Leave Build Command empty
- [ ] Set Publish Directory to `.`
- [ ] Deploy and verify frontend is accessible

## Post-Deployment Configuration
- [ ] Get backend URL from Render (e.g., https://your-app.onrender.com)
- [ ] Update frontend JavaScript files to use backend URL instead of localhost
- [ ] Update backend CORS settings to include frontend URL
- [ ] Test the full application functionality
- [ ] Verify WebSocket connections work
- [ ] Test user authentication
- [ ] Test cart and wishlist functionality

## Files to Update After Deployment

### Backend (`app.ts`)
```typescript
// Add your frontend URL to allowedOrigins array
const allowedOrigins = [
  "http://localhost:5501",
  "https://your-frontend-app.onrender.com" // Add this line
];
```

### Frontend JavaScript Files
Update API base URL in your frontend files:
- `js/utils.js` (if you have API base URL defined)
- `js/websockets-manager.js` (WebSocket URL)
- Any other files making API calls

Replace `http://localhost:8000` with your Render backend URL.

## Testing Checklist
- [ ] User registration works
- [ ] User login works
- [ ] Product listing loads
- [ ] Cart functionality works
- [ ] Wishlist functionality works
- [ ] Admin panel accessible (if applicable)
- [ ] WebSocket real-time updates work
- [ ] Image uploads work
- [ ] Database operations work

## Troubleshooting
- Check Render logs for backend issues
- Use browser developer tools for frontend issues
- Verify CORS settings if API calls fail
- Check WebSocket connection URLs
- Ensure all environment variables are set correctly
