import db from "../database/client.db.ts";
import { User, NewUser } from "../types/user.ts";

export async function createUser(user: NewUser): Promise<User> {
  try {
      const result = await db.query(`
          INSERT INTO users (
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

      // Ensure we have a valid result
      const [insertedData] = result;
      if (!insertedData) throw new Error('Failed to insert user');

      const { id, created_at } = insertedData;

      return {
          ...user,
          id,
          password: user.password, // Ensure the password is hashed before storing it
          created_at,
      };
  } catch (error) {
      console.error("Error creating user:", error);
      throw new Error('Error creating user');
  }
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

export async function getUserById(id: number): Promise<User | null> {
    try {
      const result = await db.query(
        `SELECT id, username, password, email, first_name, last_name, 
                address, mobile_number, role, created_at 
         FROM users WHERE id = ?`,
        [id]
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
      console.error("Error in getUserById:", error);
      return null;
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const result = await db.query(`
            SELECT id, username, password, email, first_name, last_name, 
                   address, mobile_number, role, created_at 
            FROM users
            ORDER BY created_at DESC
        `);
        
        if (!result || result.length === 0) {
            return [];
        }
        
        // Map the results to User objects
        return result.map(row => ({
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
        }));
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        return [];
    }
}

// Add this function to delete a user by ID
export async function deleteUserById(id: number): Promise<boolean> {
    try {
        // First check if the user exists
        const user = await getUserById(id);
        if (!user) {
            return false;
        }
        
        // Delete the user
        await db.query("DELETE FROM users WHERE id = ?", [id]);
        console.log(`User with ID ${id} deleted successfully.`);
        return true;
    } catch (error: unknown) {
        console.error(`Error deleting user with ID ${id}:`, error);
        return false;
    }
}
