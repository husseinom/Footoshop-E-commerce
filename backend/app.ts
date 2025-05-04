import "./database/tables.db.ts"
import { Application} from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import authRoute from "./routes/authRoute.ts";
import { validateJWT } from "./middleware/validate.ts";

const app = new Application();

if (Deno.args.length < 1) {
  console.log(`Usage: $ deno run --allow-net server.ts PORT [CERT_PATH KEY_PATH]`);
  Deno.exit();
}

const options = {port: Deno.args[0]}

if (Deno.args.length >= 3) {
  options.secure = true;
  options.cert = await Deno.readTextFile(Deno.args[1]);
  options.key = await Deno.readTextFile(Deno.args[2]);
  console.log(`SSL conf ready (use https)`);
}

console.log(`Oak back server running on port ${options.port}`);


app.use(oakCors({
  origin: "http://localhost:5501",
  credentials: true
}))
app.use(authRoute.routes());
app.use(authRoute.allowedMethods())
Deno.addSignalListener("SIGINT", () => {
    console.log("Shutting down server...");
    Deno.exit(); // Exit the process
  });
  
  await app.listen(options);