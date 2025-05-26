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
├───.vscode
│

├───backend

│───assets
│   
├───controllers
│   
├───database
│   
├───middleware
│   
├───models
│   
├───routes
│   
├───services
│   
└───types

└───frontend

    ├───assets
    │   ├───headers_img
    │   ├───icons_img
    │   └───products_img
    ├───css
    ├───html
    │   └───.vscode
    └───js

## ⚙️ Setup

### Backend

1. Install Deno: https://deno.land/manual/getting_started/installation
2. Navigate to the backend:
   ```bash
   cd backend
3. Run the back server: deno run --allow-net --allow-read --allow-write app.ts 4000

 ### Frontend
 Use Live server extension on VSCode or go to http://localhost:5501/frontend/html/main.html

 or to login before go to: http://localhost:5501/frontend/html/login.html

 N.B : Make sure the frontend JS connects correctly to the backend WebSocket server (adjust hostname/port if needed).

 ## TO DO IN THE FUTURE

 -Add procceed to checkout functionnalities and orders

 -Add sell option for users based on admin validation

 -Use WebSockets for real time stock update in case of multi-users trying to pass orders