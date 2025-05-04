import {Router} from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { registerUser, loginUser } from "../controllers/authController.ts";
import { getMyCart, addCartItem, removeCartItem } from "../controllers/mainControllers.ts";
import { validateJWT, validateAdmin } from "../middleware/validate.ts";
import { newProduct, AllProductsAdmin, AllProductsUsers, DeleteProducts, getLatestProducts } from "../controllers/ProductsControllers.ts";
import { AddCategory, filterCategories} from "../controllers/CategoryControllers.ts";

const router = new Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/category",validateJWT, AddCategory)
// router.post("/debug-user", debugUser);
router.get("/cart", validateJWT,getMyCart); // Assuming you have a cart in the state
router.post("/cart", validateJWT,addCartItem); // Update cart in state
// router.delete("/cart/items", validateJWT,removeCartItem); // Remove cart in state
router.get("/category",filterCategories);
router.post("/products", validateJWT, newProduct); // Create product in state
router.get("/products", validateJWT, AllProductsAdmin); // Get all products in state
router.delete("/products/:id", validateJWT, DeleteProducts);
router.get("/products/latest", getLatestProducts);


export default router;