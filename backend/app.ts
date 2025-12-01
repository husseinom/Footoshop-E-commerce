import "./database/tables.db.ts"
import { Application, Router } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { send } from "https://deno.land/x/oak@v17.1.4/send.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import authRoute from "./routes/authRoute.ts";
import { validateJWT } from "./middleware/validate.ts";
import { createWebSocketRouter } from "./services/Websockets.ts"; // Import the WebSocket router creator


const app = new Application();

const port = parseInt(Deno.env.get("PORT") ?? "4000");

const options: Deno.ListenOptions = { port };

// if (Deno.args.length >= 3) {
//   options.secure = true;
//   options.cert = await Deno.readTextFile(Deno.args[1]);
//   options.key = await Deno.readTextFile(Deno.args[2]);
//   console.log(`SSL conf ready (use https)`);
// }

console.log(`Oak back server running on port ${options.port}`);

const wsRouter = createWebSocketRouter();

// Create a router for static files
const staticRouter = new Router();

// Serve static files from the frontend directory
staticRouter.get("/(.*)", async (ctx) => {
  const path = ctx.params[0] || "";
  
  // If it's an API request, skip static serving
  if (path.startsWith("api/") || path.startsWith("ws")) {
    return;
  }
  
  try {
    let filePath = path;
    let rootDir = "./frontend";
    
    // Handle assets folder specially (for uploaded product images)
    if (path.startsWith("assets/")) {
      rootDir = "./";
      filePath = path;
    }
    // Handle static folder specially (for frontend static assets)
    else if (path.startsWith("static/")) {
      rootDir = "./frontend";
      filePath = path;
    }
    // Default to main.html for root or directory requests
    else if (!path || path.endsWith("/")) {
      filePath = "html/main.html";
    }
    // If it's a .html file, serve it directly
    else if (path.endsWith(".html")) {
      filePath = `html/${path}`;
    }
    // If no extension, assume it's an HTML page
    else if (!path.includes(".")) {
      filePath = `html/${path}.html`;
    }
    
    await send(ctx, filePath, {
      root: rootDir,
      index: "html/main.html",
    });
  } catch {
    // If file not found, serve main.html (for client-side routing)
    try {
      await send(ctx, "html/main.html", {
        root: "./frontend",
      });
    } catch {
      ctx.response.status = 404;
      ctx.response.body = "Not Found";
    }
  }
});

// Configure CORS for both development and production
const allowedOrigins = [
  "http://localhost:5501",
  "http://127.0.0.1:5501",
  // Fly.io frontend URL
  "https://footoshop-frontend.fly.dev"
];

// If in production, add the production origin
if (Deno.env.get("DENO_DEPLOY") === "true") {
  // You can set this as an environment variable on Fly.io
  const frontendUrl = Deno.env.get("FRONTEND_URL");
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }
}

app.use(oakCors({
  origin: allowedOrigins,
  credentials: true
}))

// API routes first
app.use(authRoute.routes());
app.use(authRoute.allowedMethods())

app.use(wsRouter.routes());
app.use(wsRouter.allowedMethods());

// Static files last (catch-all)
app.use(staticRouter.routes());
app.use(staticRouter.allowedMethods());

Deno.addSignalListener("SIGINT", () => {
    console.log("Shutting down server...");
    Deno.exit(); // Exit the process
  });
  
  await app.listen(options);