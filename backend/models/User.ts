import db from "../database/client.db.ts";
import { User, NewUser } from "../types/user.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";

export async function createUser(user: NewUser): Promise<User> {
    
    // Insert and get back id/created_at
    const result = await db.query(
      `INSERT INTO users (
        username, password, email, first_name, last_name, 
        address, mobile_number, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id, created_at`,
      [
        user.username,
        user.password,
        user.email,
        user.first_name,
        user.last_name,
        user.address || null,
        user.mobile_number || null,
        user.role || 'user',
      ]
    );
  
    // Properly handle the nested array result
    const [insertedData] = result; // Gets [6, "2025-04-23 01:36:44"]
    const [id, created_at] = insertedData;
  
    // Format the timestamp properly for Date constructor
    const formattedDate = created_at.replace(' ', 'T') + 'Z'; // "2025-04-23T01:36:44Z"
  
    return {
      ...user,
      id,
      password: user.password,
      created_at: new Date(formattedDate), // Now valid
    };
  }
export async function getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await db.query(
        `SELECT id, username, password, email, first_name, last_name, 
                address, mobile_number, role, created_at 
         FROM users WHERE username = ?`,
        [username]
      );
    
      if (!result || result.length === 0 || result[0].length === 0) {
        return null;
      }
  
      // Extract the first row from the result
      const row = result[0];
      
      // Map the array positions to user properties
      return {
        id: row[0],
        username: row[1],
        password: row[2],
        email: row[3],
        first_name: row[4],
        last_name: row[5],
        address: row[6],
        mobile_number: row[7],
        role: row[8],
        created_at: new Date(row[9])
      };
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return null;
    }
}

export async function deleteUsers(): Promise<void> {
    try {
        await db.query("DELETE FROM users");
        console.log("All users deleted successfully.");
    } catch (error: unknown) {
        console.error("Error deleting users:", error);
    }
}
