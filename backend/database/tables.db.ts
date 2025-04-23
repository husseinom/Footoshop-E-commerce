import db from "./client.db.ts";

try {
    console.log("Attempting to create users table...");
    db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            address TEXT, -- Optional, can be NULL if not provided
            mobile_number INTEGER, -- Optional, can be NULL if not provided
            role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("Users table created or already exists.");

    console.log("Attempting to create products table...");
    db.execute(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seller_id INTEGER NOT NULL,
            seller_username TEXT NOT NULL,
            title TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            size DECIMAL(3,1) NOT NULL,
            condition TEXT NOT NULL,
            category TEXT NOT NULL,
            images TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES users(id),
            FOREIGN KEY (seller_username) REFERENCES users(username)
        );
    `);
    console.log("Products table created or already exists.");

    console.log("Attempting to create categories table...");
    db.execute(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE
        );
    `);
    console.log("Categories table created or already exists.");
} catch (error) {
    console.error("Error in tables.db.ts:", error);
}


