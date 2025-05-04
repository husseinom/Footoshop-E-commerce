import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { addToCart, removeFromCart, UpdateCart, getCartByUserId } from "../models/Cart.ts";

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
        const {product_id, size}= body;
        if(!product_id || !size){
            ctx.response.status = 400;
            ctx.response.body = {message: "Missing required fields"};
            return;
        }

        await removeFromCart(userId, product_id, size);
        ctx.response.status = 200;
        ctx.response.body = { message: "Item removed successfully" };
    }catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to remove item from cart", error: error.message };

    }

}
// à changer
export async function updateCart(ctx: Context) {
    try {
        const userId = Number(ctx.state.user.id); // Assuming user ID is passed in the URL
        const itemId = Number(ctx.params.item_id); // Assuming item ID is passed in the URL
        const body = await ctx.request.body.json();
        const { action, quantity } = body; // Assuming action and quantity are passed in the request body
        if (!action || (action !== "remove" && !quantity)) {
            ctx.response.status = 400;
            ctx.response.body = { message: "Missing required fields" };
            return;
        }
        const cart = await getCart(ctx.state.userId); // Assuming user ID is in state
        if (action === "increment" || action === "decrement") {
            const item = cart.items.find((i) => i.product.id === itemId);
            if (item) {
                const cartItem = {
                    product_id: item.product.id,
                    user_id: userId,
                    quantity: quantity,
                    size: item.size,
                };
                if (action === "increment" || action === "decrement") {
                    await UpdateCart(userId, cartItem); // Update cart in database
                    ctx.response.status = 200;
                    ctx.response.body = { 
                        message: `Quantity of item ${item.product.title} changed, Cart updated successfully`,
                        cart: ctx.state.cart 
        };
                } else if (action === "remove") {
                    await removeFromCart(userId, cartItem); // Remove item from cart in database
                    ctx.response.status = 200;
                    ctx.response.body = { 
                        message: `${item.product.title} removed, Cart updated successfully`,
                        cart: ctx.state.cart 
                    };
                }
                else if (action === "add") {
                    await addToCart(userId, cartItem); // Add item to cart in database
                    ctx.response.status = 200;
                    ctx.response.body = { 
                        message: `${item.product.title} added, Cart updated successfully`,
                        cart: ctx.state.cart 
                    };
                }
            }
        
        }
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { 
            message: "Failed to update cart", 
            error: error.message 
        };
    }
}
