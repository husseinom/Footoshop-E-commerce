import { JWTPayload, jwtVerify} from "npm:jose@5.9.6";
import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";

const secret = new TextEncoder().encode("b9a1f5e0-3d92-4ebc-abc1-07f2c5e3a3d9");

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    console.log("Token received in verifyJWT:", token);
    const { payload } = await jwtVerify(token, secret,{
        clockTolerance: 31536000
    });
    console.log("JWT verified successfully:", payload);
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function validateJWT(ctx: Context, next: () => Promise<unknown>){
    console.log("Middleware reached");
    let token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "").trim()
    || await ctx.cookies.get("auth_token");
    console.log("Authorization token in validateJWT:", token);
    
    if(!token){
        ctx.response.status = 401;
        ctx.response.body = {message: "Unauthorized, No token provided !"};
        return;
    }
    const payload = await verifyJWT(token);
    if(!payload){
        ctx.response.status = 401;
        ctx.response.body = {message: "Unauthorized, Invalid token !"};
        return;
    }
    ctx.state.user = payload;
    await next();
}

export async function validateAdmin(ctx: Context, next: () => Promise<unknown>){
    let token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "").trim()
    || await ctx.cookies.get("auth_token");
    console.log(token)
    
    if(!token){
        ctx.response.status = 401;
        ctx.response.body = {message: "Unauthorized, No token provided !"};
        return;
    }
    const payload = await verifyJWT(token);
    if(!payload){
        ctx.response.status = 401;
        ctx.response.body = {message: "Unauthorized, Invalid token !"};
        return;
    }
    console.log("Payload role in validateAdmin:", payload);
    if(payload.name !== "omar11"){
        ctx.response.status = 403;
        ctx.response.body = {message: "Access denied, Admins only !"};
        return;
    }
    else{
        ctx.response.status = 200;
        ctx.response.body = {message: "Access granted, Admins only !"};
        console.log("Admin access granted");
    }
    ctx.state.user = payload;
    await next();
}