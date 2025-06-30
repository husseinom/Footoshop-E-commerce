# 🛒 Real-Time Footoshop-E-commerce

This project is a full-stack e-commerce web application where users can browse products, manage their cart, wishlist and receive **real-time stock updates**. It uses **Deno** with **Oak** for tthe server and **SQLite** for the database on the backend, and **vanilla JavaScript** on the frontend for maximum flexibility and performance.

##  Features

-  User Authentication (Register/Login)
-  Product listing with variant selection (e.g., sizes)
-  Cart and Wishlist functionality
-  Image and variant upload support
-  Stock alert when 10 or fewer items remain
-  Backend written in modern TypeScript using Deno

##  Tech Stack

### Backend
- [Deno](https://deno.land/)
- [Oak](https://deno.land/x/oak)
- [SQLite](https://deno.land/x/sqlite)
- [bcrypt](https://deno.land/x/bcrypt)
- WebSockets for live connection tracking

### Frontend
- **Vanilla JavaScript (ES6+)**
- HTML/CSS 
- WebSocket client for real-time updates
- RESTFUL API communication

## 📁 Project Structure
```
Footoshop-E-commerce/
├── README.md
├── backend/
│   ├── app.ts
│   ├── deno.json
│   ├── deno.lock
│   ├── footoshop.db
│   ├── assets/
│   │   └── [product images]
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── CategoryControllers.ts
│   │   ├── mainControllers.ts
│   │   └── ProductsControllers.ts
│   ├── database/
│   │   ├── client.db.ts
│   │   └── tables.db.ts
│   ├── middleware/
│   │   └── validate.ts
│   ├── models/
│   │   ├── Admin.ts
│   │   ├── Cart.ts
│   │   ├── Category.ts
│   │   ├── Product.ts
│   │   ├── User.ts
│   │   └── Wishlist.ts
│   ├── routes/
│   │   └── authRoute.ts
│   ├── services/
│   │   ├── authServices.ts
│   │   └── Websockets.ts
│   └── types/
│       ├── cart.ts
│       ├── category.ts
│       ├── product.ts
│       ├── user.ts
│       └── wishlist.ts
└── frontend/
    ├── assets/
    │   ├── headers_img/
    │   │   ├── header.png
    │   │   └── headeropt.png
    │   ├── icons_img/
    │   │   ├── basketball.png
    │   │   ├── football.jpg
    │   │   ├── lifestyle.jpg
    │   │   ├── running.png
    │   │   ├── sneakers.png
    │   │   └── tennis.png
    │   └── products_img/
    │       ├── product-1.png
    │       ├── product-2.png
    │       ├── product-3.png
    │       └── product-4.png
    ├── css/
    │   ├── admin.css
    │   ├── login.css
    │   └── main.css
    ├── html/
    │   ├── admin.html
    │   ├── allproducts.html
    │   ├── cart.html
    │   ├── categoriesAdmin.html
    │   ├── login.html
    │   ├── main.html
    │   ├── productsAdmin.html
    │   ├── singleproduct.html
    │   ├── usersAdmin.html
    │   └── wishlist.html
    └── js/
        ├── admin.js
        ├── allproducts.js
        ├── cart.js
        ├── login.js
        ├── main.js
        ├── singleproduct.js
        ├── utils.js
        ├── websockets-manager.js
        └── wishlist.js
```

## ⚙️ Setup

### Backend

1. Install Deno: https://deno.land/manual/getting_started/installation
2. Navigate to the backend:
   ```bash
   cd backend
   ```
3. Run the back server: deno run --allow-net --allow-read --allow-write app.ts 4000

 ### Frontend
 Use Live server extension on VSCode or go to http://localhost:5501/frontend/html/main.html

 or to login before go to: http://localhost:5501/frontend/html/login.html

 N.B : Make sure the frontend JS connects correctly to the backend WebSocket server (adjust hostname/port if needed).

 ## TO DO IN THE FUTURE

 -Add procceed to checkout functionnalities and orders

 -Add sell option for users based on admin validation

 -Use WebSockets for real time stock update in case of multi-users trying to pass orders

## 🚀 Deployment

### Deploying to Render

This project can be deployed to Render with the following steps:

#### Prerequisites
1. Create a [Render account](https://render.com/)
2. Push your code to a GitHub repository
3. Ensure your code is committed and pushed to the main branch

#### Backend Deployment Steps

1. **Create a Web Service on Render:**
   - Go to your Render dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your repository and branch

2. **Configure the Service:**
   ```
   Name: footoshop-backend
   Environment: Docker
   Region: Choose your preferred region
   Branch: main
   Root Directory: backend
   ```

3. **Build & Start Commands:**
   ```
   Build Command: (leave empty)
   Start Command: deno run --allow-net --allow-read --allow-write app.ts
   ```

4. **Environment Variables:**
   Set the following environment variables in Render:
   ```
   PORT=8000
   DENO_DEPLOY=true
   ```

5. **Advanced Settings:**
   - Auto-Deploy: Yes
   - Health Check Path: `/` (optional)

#### Frontend Deployment Steps

1. **Create a Static Site on Render:**
   - Click "New" → "Static Site"
   - Connect the same GitHub repository
   - Select your repository and branch

2. **Configure the Static Site:**
   ```
   Name: footoshop-frontend
   Root Directory: frontend
   Build Command: (leave empty)
   Publish Directory: .
   ```

3. **Update Frontend Configuration:**
   After backend deployment, update your frontend JavaScript files to use the Render backend URL instead of localhost.

#### Post-Deployment Configuration

1. **Update CORS Settings:**
   Update your backend's CORS configuration in `app.ts` to include your frontend Render URL:
   ```typescript
   app.use(oakCors({
     origin: ["https://your-frontend-url.onrender.com", "http://localhost:5501"],
     credentials: true
   }))
   ```

2. **Update WebSocket Connections:**
   Update your frontend WebSocket connections to use the deployed backend URL.

3. **Database Considerations:**
   - SQLite database will persist on the deployed server
   - For production, consider migrating to PostgreSQL for better scalability
   - Render offers managed PostgreSQL databases

#### Troubleshooting

- **Build Failures:** Ensure all file paths are correct and Deno has proper permissions
- **CORS Issues:** Verify your frontend URL is included in the CORS origin list
- **WebSocket Issues:** Ensure WebSocket URLs point to the correct deployed backend
- **Database Issues:** Check file permissions and paths for SQLite database

#### Production Recommendations

1. **Environment Variables:** Use environment variables for sensitive data
2. **Database Migration:** Consider PostgreSQL for production
3. **SSL/HTTPS:** Render provides automatic SSL certificates
4. **Monitoring:** Use Render's built-in monitoring and logging
5. **Custom Domain:** Configure a custom domain for professional appearance