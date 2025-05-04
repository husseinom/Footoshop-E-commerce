import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { createUser, getUserByUsername } from "../models/User.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";
import { createJWT } from "../services/authServices.ts";

export async function registerUser(ctx: Context) {
    try {
        const body = await ctx.request.body.json();
        const { username, password, email, first_name, last_name, address, mobile_number } = body;

        console.log(`[REGISTER] Attempting to register user: ${username}`);

        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            ctx.response.status = 409;
            ctx.response.body = { message: "Username already exists" };
            return;
        }
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await createUser({
            username,
            password: hashedPassword,
            email,
            first_name,
            last_name,
            address,
            mobile_number,
            role: 'admin',
        });

        ctx.response.status = 201;
        ctx.response.body = { message: "User created successfully", user: newUser };
        console.log(`[REGISTER] User created: ${username}`);
    } catch (error) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Failed to create user", error: error.message };
    }
}

export async function loginUser(ctx: Context) {
    try {
        const body = await ctx.request.body.json();
        const { username, password } = body;

        console.log(`Login attempt for: ${username}`);
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

        const token = await createJWT(user);
        
        ctx.response.status = 200;
        ctx.response.body = {
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        };
        console.log(`[LOGIN] User logged in: ${username}`);
    } catch (error) {
        console.error("Login error:", error);
        ctx.response.status = 500;
        ctx.response.body = { message: "Internal server error" };
    }
}

// export async function debugUser(ctx: Context) {
//     try {
//         const body = await ctx.request.body.json();
//         const { username } = body;
        
//         const user = await getUserByUsername(username);
//         if (!user) {
//             ctx.response.status = 404;
//             ctx.response.body = { error: "User not found" };
//             return;
//         }
//         const hash = await bcrypt.hash("myTestPassword");
//         const result = await bcrypt.compare("myTestPassword", hash);
//         console.log("Manual test:", result);
        
//         ctx.response.body = {
//             debugInfo: {

//                 username: user.username,
//                 storedHash: user.password,
//                 hashStartsWith: user.password.substring(0, 10) + "...",
//                 hashLength: user.password.length,
//                 createdAt: user.created_at
//             },
//             verification: {
//                 testComparison: await bcrypt.compare("myTestPassword", hash),
//                 hashFormatValid: await bcrypt.compare("ssss",user.password) ? true : false
//             }
//         };

// } catch (error) {
//         ctx.response.status = 500;
//         ctx.response.body = { error: "Debug failed", details: error.message };
//     };
// }