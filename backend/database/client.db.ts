import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("footoshop.db");

db.execute(`PRAGMA foreign_keys = ON;`);

try{
    db.query(`Select 1`);
    console.log("Database connection successful.");
}catch(error){
    console.log("Database connection failed:", error);
    
}
window.addEventListener("unload", () => {
    db.close();
    console.log("Database connection closed.");
});
export default db;