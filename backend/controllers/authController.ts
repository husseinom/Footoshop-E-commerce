import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { createUser, getUserByUsername, getAllUsers, deleteUserById } from "../models/User.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";
import { createJWT } from "../services/authServices.ts";
// Import your WebSocket service to access connected users
import { connectedUsers } from "../services/Websockets.ts";

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
            role: 'user',
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
        ctx.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 24, // 1 day
        });
        
        ctx.response.status = 200;
        
        console.log(`[LOGIN] User logged in: ${username}`);
    } catch (error) {
        console.error("Login error:", error);
        ctx.response.status = 500;
        ctx.response.body = { message: "Internal server error" };
    }
}

// Update your function to get connected users from WebSocket service
export async function getAllConnectedUsers(ctx: Context) {
    try {
        // Transform the Map into an array of user objects
        const users = Array.from(connectedUsers.values()).map(user => ({
            userId: user.userId,
            username: user.username,
            isAdmin: user.isAdmin,
            connectionTime: user.connectionTime || new Date()
        }));
        
        ctx.response.status = 200;
        ctx.response.body = users;
    } catch (error) {
        console.error("Error fetching connected users:", error);
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve connected users", error: error.message };
    }
}

// Add a function to get all registered users
export async function getAllRegisteredUsers(ctx: Context) {
    try {
        // Make sure the user is admin
        const user = ctx.state.user;
        if (!user || user.role !== 'admin') {
            ctx.response.status = 403;
            ctx.response.body = { message: "Admin access required" };
            return;
        }
        
        // Get all users from database
        const users = await getAllUsers();
        
        // Don't send password hashes to frontend
        const safeUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            created_at: user.created_at
        }));
        
        ctx.response.status = 200;
        ctx.response.body = safeUsers;
    } catch (error) {
        console.error("Error fetching all users:", error);
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve users", error: error.message };
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

// Add this new controller function
export async function removeUser(ctx: Context) {
    try {
        // Check if user is admin
        const admin = ctx.state.user;
        if (!admin || admin.role !== 'admin') {
            ctx.response.status = 403;
            ctx.response.body = { message: "Admin access required" };
            return;
        }
        
        // Get the user ID from the URL parameter
        const userId = ctx.params.id;
        if (!userId) {
            ctx.response.status = 400;
            ctx.response.body = { message: "User ID is required" };
            return;
        }
        
        // Don't allow admin to delete their own account (safety measure)
        if (Number(userId) === admin.id) {
            ctx.response.status = 400;
            ctx.response.body = { message: "Admin cannot delete their own account" };
            return;
        }
        
        // Delete the user
        const success = await deleteUserById(Number(userId));
        
        if (success) {
            ctx.response.status = 200;
            ctx.response.body = { message: "User deleted successfully" };
            console.log(`[ADMIN] User ${userId} deleted by admin ${admin.name}`);
        } else {
            ctx.response.status = 404;
            ctx.response.body = { message: "User not found or could not be deleted" };
        }
    } catch (error) {
        console.error("Error removing user:", error);
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to delete user", error: error.message };
    }
}

