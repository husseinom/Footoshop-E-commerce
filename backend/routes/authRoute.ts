import {Router} from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { registerUser, loginUser } from "../controllers/authController.ts";


const router = new Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.post("/debug-user", debugUser);


export default router;