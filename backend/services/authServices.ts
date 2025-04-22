import{getUserByUsername} from "../models/User.ts";
import{User} from "../types/user.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";
import {signJWT} from "npm:jose@5.9.6";


export async function validateCredentials(
    username: string, 
    password: string
): Promise<User> {
    const user = await getUserByUsername(username);
    if (!user) throw new Error("Invalid username or password");
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid username or password");
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
}

const secret = new TextEncoder().encode("b9a1f5e0-3d92-4ebc-abc1-07f2c5e3a3d9");

export async function createJWT(user: User): Promise<string> {
    const jwt = await new signJWT({ name: user.username, id: user.id })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2h")
        .sign(secret);
    return jwt;
}