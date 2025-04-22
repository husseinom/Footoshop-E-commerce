import db from "./client.db.ts";


db.execute(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        address TEXT, --Optional, can be NULL if not provided
        mobile_number INTEGER, --Optional, can be NULL if not provided
        role TEXT DEFAULT 'user', CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);
db.execute(`
    CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    size DECIMAL(3,1) NOT NULL,
    condition TEXT NOT NULL,
    category TEXT NOT NULL,
    images TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

db.execute(`
    CREATE TABLE IF NOT EXIST categories(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    );
    `);


