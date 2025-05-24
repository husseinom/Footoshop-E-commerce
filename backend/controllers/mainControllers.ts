import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { addToCart, removeFromCart, UpdateCart, getCartByUserId, getProductStockForSize } from "../models/Cart.ts";
import { addToWishlist, removeFromWishlist, getWishlistByUserId} from "../models/Wishlist.ts";

export async function getMyCart(ctx: Context) {
    try {
        const userId = Number(ctx.state.user.id); 
        console.log("User ID:", userId); // Debugging line
        const cart = await getCartByUserId(userId); // Assuming user ID is in state
        console.log("Cart:", cart); // Debugging line
        ctx.response.status = 200;
        ctx.response.body = { cart };
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve cart", error: error.message };
    }
}
export async function addCartItem(ctx:Context){
    try{
        const userId = Number(ctx.state.user.id);
        const body = await ctx.request.body.json();
        const {product_id, quantity, size}=body
        console.log("request body",body) 
        
        if(!product_id || !quantity || !size){
            ctx.response.status = 400;
            ctx.response.body = {message: "Missing required fields"};
            return;
        }
        
        // Check stock availability before adding
        const availableStock = await getProductStockForSize(product_id, size);
        console.log(`Available stock for product ${product_id}, size ${size}: ${availableStock}`);
        
        if (quantity > availableStock) {
            ctx.response.status = 400;
            ctx.response.body = { 
                message: "Not enough stock available", 
                availableStock 
            };
            return;
        }
        
        const CartItem = {
            user_id: userId,
            product_id,
            quantity,
            size,
        }
        await addToCart(userId, CartItem);
        const updatedCart= await getCartByUserId(userId);
        ctx.response.status = 201;
        ctx.response.body={ message: "Item added successfully",
            cart: updatedCart
        }
    }catch(error){
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to add item to cart", error: error.message };
    }
}

export async function removeCartItem(ctx: Context) {
    try {
        const userId = Number(ctx.state.user.id);
        const body = await ctx.request.body.json();
        console.log("request body", body);
        const {productId, size}= body;
        console.log(productId, size);
        if(!productId || !size){
            ctx.response.status = 400;
            ctx.response.body = {message: "Missing required fields"};
            return;
        }

        const updatedCart = await removeFromCart(userId, productId, size);
        ctx.response.status = 200;
        ctx.response.body = updatedCart ;
        console.log("Item removed successfully");
    }catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to remove item from cart", error: error.message };

    }

}

export async function getMyWishlist(ctx: Context) {
    try {
        const userId = Number(ctx.state.user.id); 
        console.log("User ID:", userId); // Debugging line
        const wishlist = await getWishlistByUserId(userId); // Assuming user ID is in state
        console.log("Wishlist:", wishlist); // Debugging line
        ctx.response.status = 200;
        ctx.response.body = { wishlist };
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve wishlist", error: error.message };
    }
}
export async function addWishlistItem(ctx:Context){
    try{
        const userId = Number(ctx.state.user.id);
        const body = await ctx.request.body.json();
        const {product_id}=body
        console.log("request body",body) 
        if(!product_id){
            ctx.response.status = 400;
            ctx.response.body = {message: "Missing required fields"};
            return;
        }
        const WishlistItem = {
            user_id: userId,
            product_id,
            
        }
        await addToWishlist(userId, WishlistItem);
        const updatedWishlist= await getWishlistByUserId(userId);
        ctx.response.status = 201;
        ctx.response.body={ message: "Item added successfully",
            wishlist: updatedWishlist
        }
    }catch(error){
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to add item to wishlist", error: error.message };
    }
}

export async function removeWishlistItem(ctx: Context) {
    try {
        const userId = Number(ctx.state.user.id);
        const body = await ctx.request.body.json();
        console.log("request body", body);
        const {productId}= body;
        console.log(productId);
        if(!productId){
            ctx.response.status = 400;
            ctx.response.body = {message: "Missing required fields"};
            return;
        }

        const updatedWishlist = await removeFromWishlist(userId, productId);
        ctx.response.status = 200;
        console.log(ctx.response.status);
        ctx.response.body = updatedWishlist ;
        console.log("Item removed successfully");
    }catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to remove item from wishlist", error: error.message };

    }

}

export async function updateCartItemController(ctx: Context) {
  try {
    const userId = Number(ctx.state.user.id);
    const body = await ctx.request.body.json();
    const { productId, size, quantity } = body;
    
    console.log("Updating cart item:", { productId, size, quantity, userId });
    
    if (!productId || !size || !quantity) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Missing required fields" };
      return;
    }

    // Validate quantity is a positive integer
    if (!Number.isInteger(quantity) || quantity < 1) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Quantity must be a positive integer" };
      return;
    }

    // Use the fixed function to check stock availability
    const availableStock = await getProductStockForSize(productId, size);
    console.log(`Available stock for product ${productId}, size ${size}: ${availableStock}`);
    
    if (availableStock === undefined || availableStock === null) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Product size not available" };
      return;
    }
    
    if (quantity > availableStock) {
      ctx.response.status = 400;
      ctx.response.body = { 
        message: "Not enough stock available", 
        availableStock 
      };
      return;
    }

    // Use your existing UpdateCart function
    const updatedCart = await UpdateCart(userId, {
        product_id: productId,
        user_id: userId,
        quantity,
        size
    });

    ctx.response.status = 200;
    ctx.response.body = { 
      message: "Cart updated successfully", 
      cart: updatedCart 
    };
    
  } catch (error) {
    console.error("Error updating cart item:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to update cart", error: error.message };
  }
}
