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
            title TEXT NOT NULL,
            gender_category_id INTEGER NOT NULL,
            type_category_id INTEGER NOT NULL,
            created_price DECIMAL(10,2) NOT NULL,
            actual_price DECIMAL(10,2) NOT NULL,
            condition TEXT CHECK (condition IN ('new', 'used')) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_available BOOLEAN DEFAULT TRUE,
            is_approved BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (gender_category_id) REFERENCES categories(id) ON DELETE CASCADE,
            FOREIGN KEY (type_category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
    `);
    console.log("Products table created or already exists.");

    console.log("Attempting to create product_variants table...");
    db.execute(`
        CREATE TABLE IF NOT EXISTS product_variants(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            size DECIMAL(3,1) NOT NULL,
            quantity INTEGER NOT NULL CHECK (quantity >= 0),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            UNIQUE (product_id, size)
        );`);
    console.log("Product variants table created or already exists.");
    
    console.log("Attempting to create product_images table...");
    db.execute(`CREATE TABLE IF NOT EXISTS product_images(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_path TEXT NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE );`);
    console.log("Product images table created or already exists.");

    db.execute(`CREATE TABLE IF NOT EXISTS cart_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        size DECIMAL(3,1) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE (user_id, product_id, size) );`);

    console.log("Cart items table created or already exists.");

    db.execute(`CREATE TABLE IF NOT EXISTS wishlist_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE (user_id, product_id) );`);
    console.log("Wishlist items table created or already exists.");

    console.log("Attempting to create categories table...");
    db.execute(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE,
            is_gender BOOLEAN DEFAULT FALSE
        );
    `);
    console.log("Categories table created or already exists.");

    console.log("Attempting to create orders table...");
    db.execute(`CREATE TABLE IF NOT EXISTS orders(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_id INTEGER NOT NULL,
        status TEXT CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        shipment_address TEXT NOT NULL,
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE );`);
    console.log("Orders table created or already exists.");
    

    console.log("Attempting to create order_items table...");
    db.execute(`CREATE TABLE IF NOT EXISTS order_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        variant_id INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        item_status TEXT CHECK (item_status IN ('pending', 'shipped', 'delivered', 'cancelled')) NOT NULL,
        price_at_purchase DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (order_id, product_id) );`);


    console.log("Order items table created or already exists.");
} catch (error) {
    console.error("Error in tables.db.ts:", error);
}


