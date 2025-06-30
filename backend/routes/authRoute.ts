import {Router} from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { registerUser, loginUser, getAllConnectedUsers, getAllRegisteredUsers, removeUser } from "../controllers/authController.ts";
import { getMyCart, addCartItem, removeCartItem, getMyWishlist, addWishlistItem, removeWishlistItem, updateCartItemController } from "../controllers/mainControllers.ts";
import { validateJWT, validateAdmin } from "../middleware/validate.ts";
import { newProduct, AllProductsAdmin, AllProductsUsers, DeleteProducts, getLatestProducts, getSingleProduct, getProductsByGender, getProductsByType, filterProducts } from "../controllers/ProductsControllers.ts";
import { AddCategory, filterCategories} from "../controllers/CategoryControllers.ts";

const router = new Router();

// Sign in / Register
router.post("/register", registerUser);
router.post("/login", loginUser);
// router.post("/debug-user", debugUser);

//Websockets
router.get("/me", validateJWT, (ctx) => {
  const user = ctx.state.user;
  ctx.response.status = 200;
  ctx.response.body = {
    id: user.id,
    username: user.name,
    role: user.role
  };
});

// Cart 
router.get("/cart", validateJWT,getMyCart); // Assuming you have a cart in the state
router.post("/cart", validateJWT,addCartItem); // Update cart in state
router.delete("/cart", validateJWT,removeCartItem); // Remove cart in state
router.put("/cart/update", validateJWT, updateCartItemController); // Add this new route to update cart item quantity

// Wishlist
router.get("/wishlist", validateJWT,getMyWishlist); // Assuming you have a cart in the state
router.post("/wishlist", validateJWT,addWishlistItem); // Update cart in state
router.delete("/wishlist", validateJWT,removeWishlistItem); // Remove cart in state

// Categories
router.get("/category",filterCategories);

// Admin panel
router.get("/admin", validateAdmin);
router.post("/category", validateAdmin, AddCategory);
router.post("/products", validateAdmin, newProduct); // Create product in state
router.get("/products", validateAdmin, AllProductsAdmin); // Get all products in state
router.get("/admin/users", validateAdmin, getAllRegisteredUsers); // Get all registered users
router.get("/admin/connected-users", validateAdmin, getAllConnectedUsers); // Get connected users
router.delete("/admin/users/:id", validateAdmin, removeUser); // Delete a user by ID

// Products 
router.get("/product/:id", getSingleProduct); // Get single product in state
router.get("/allproducts", AllProductsUsers); // Get all products in state
router.get("/products/gender", getProductsByGender);
router.get("/products/type", getProductsByType);
router.get("/products/filter", filterProducts);

router.delete("/products/:id", validateJWT, DeleteProducts);
router.get("/products/latest", getLatestProducts);


export default router;