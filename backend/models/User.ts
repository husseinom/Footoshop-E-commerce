import db from "../database/client.db.ts";
import { User, NewUser } from "../types/user.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";

export async function createUser(user: NewUser): Promise<User>{
    const hashedPassword = await bcrypt.hash(user.password);
    const result = await db.query(
        `INSERT INTO users (username, password, email, first_name, last_name, address, mobile_number, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id, created_at`,
    [
        user.username,
        hashedPassword,
        user.email,
        user.first_name,
        user.last_name,
        user.address || null,
        user.mobile_number || null,
        user.role || 'user',
    ]
    );
    if (!result || result.length === 0) {
        throw new Error("Failed to create user");
    }

    const {id, created_at} = result[0];
    return {
        ...user,
        password: hashedPassword,
        id,
        created_at: new Date(created_at),
    }

}

export async function getUserByUsername(username: string): Promise<User | null>{
    const result = db.query(
        `Select * from users where username = ?`,
        [username]
    );
    if(result.length === 0){
        return null;
    }
    const user = result[0] as User;
    return user;
}

