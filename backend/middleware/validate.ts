import { JWTPayload, jwtVerify, SignJWT } from "npm:jose@5.9.6";
import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";

const secret = new TextEncoder().encode("b9a1f5e0-3d92-4ebc-abc1-07f2c5e3a3d9");

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    console.log("JWT verified successfully:", payload);
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function validateJWT(ctx: Context, next: () => Promise<unknown>){
    const token = ctx.cookies.get("auth_token");
    ctx.request.headers.get("Authorization")?.replace("Bearer ", "");

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
