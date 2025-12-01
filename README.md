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

## ⚙️ Setup (Locally)

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


#### Troubleshooting

- **Build Failures:** Ensure all file paths are correct and Deno has proper permissions
- **CORS Issues:** Verify your frontend URL is included in the CORS origin list
- **WebSocket Issues:** Ensure WebSocket URLs point to the correct deployed backend
- **Database Issues:** Check file permissions and paths for SQLite database
