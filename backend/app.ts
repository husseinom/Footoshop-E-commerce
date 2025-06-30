import "./database/tables.db.ts"
import { Application} from "https://deno.land/x/oak@v17.1.4/mod.ts";
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

// Configure CORS for both development and production
const allowedOrigins = [
  "http://localhost:5501",
  "http://127.0.0.1:5501",
  // Add your Render frontend URL here after deployment
  // "https://your-frontend-app.onrender.com"
];

// If in production, add the production origin
if (Deno.env.get("DENO_DEPLOY") === "true") {
  // You can set this as an environment variable on Render
  const frontendUrl = Deno.env.get("FRONTEND_URL");
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }
}

app.use(oakCors({
  origin: allowedOrigins,
  credentials: true
}))
app.use(authRoute.routes());
app.use(authRoute.allowedMethods())

app.use(wsRouter.routes());
app.use(wsRouter.allowedMethods());

Deno.addSignalListener("SIGINT", () => {
    console.log("Shutting down server...");
    Deno.exit(); // Exit the process
  });
  
  await app.listen(options);