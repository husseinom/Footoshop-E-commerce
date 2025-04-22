import { createUser, getUserByUsername } from "../models/User";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";

export async function registerUser(ctx:any){
    const { username, password, email, first_name, last_name, address, mobile_number } = await ctx.request.body().value;
    const user = await getUserByUsername(username);
    if (user) {
        ctx.response.status = 409;
        ctx.response.body = { message: "Username already exists" };
        return;
    }
    try{
        const hashedPassword = await bcrypt.hash(password);
        const newUser = await createUser({
            username,
            password: hashedPassword,
            email,
            first_name,
            last_name,
            address,
            mobile_number,
            role: 'user', // Default role added
        });
        ctx.response.status = 201;
        ctx.response.body = { message: "User created successfully", user: newUser };
    }catch (error) {
        ctx.response.status=400;
        ctx.response.body = { message: "Failed to create user", error: error.message };
    }
}

export async function loginUser(ctx:any){
    const { username, password } = await ctx.request.body().value;
    const user = await getUserByUsername(username);
    if (!user) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Invalid username or password" };
        return;
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Invalid username or password" };
        return;
    }
    const { password: _, ...userWithoutPassword } = user;
    ctx.response.status = 200;
    ctx.response.body = { message: "Login successful", user: userWithoutPassword };
}

    