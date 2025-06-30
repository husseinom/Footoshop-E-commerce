import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("footoshop.db");

db.execute(`PRAGMA foreign_keys = ON;`);
console.log("Database connection initialized successfully.");


Deno.addSignalListener("SIGINT", () => {
    db.close();
    console.log("Database connection closed.");
});


export default db;