// cart_service.ts
import { CartItemDB, CartItem } from "../types/cart.ts";
import db from "../database/client.db.ts";

export async function getCartByUserId(user_id: number): Promise<CartItem[] | null> {
    const result = await db.queryEntries(`
        SELECT ci.id, ci.product_id, ci.user_id, ci.quantity, ci.size,
        p.title, p.actual_price, pi.image_path
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
        WHERE ci.user_id = ?
    `, [user_id]);

    if (!result || result.length === 0) {
        return null;
    }

    const cart: CartItem[] = result.map((row) => ({
        id: row.id,
        product_id: row.product_id,
        user_id: row.user_id,
        quantity: row.quantity,
        size: row.size,
        product: {
            id: row.product_id,
            title: row.title,
            actual_price: row.actual_price,
            image_path: row.image_path
        }
    }));
    
    return cart;
}

export async function addToCart(user_id: number, item: CartItemDB): Promise<void> {
    const existingItem = await db.queryEntries(`
        SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?`,
        [user_id, item.product_id, item.size]);

    if (existingItem.length > 0) {
        const newQuantity = existingItem[0].quantity + item.quantity;
        await db.queryEntries(`
            UPDATE cart_items SET quantity = ? WHERE id = ?`,
            [newQuantity, existingItem[0].id]);
    } else {
        await db.queryEntries(`
            INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)`,
            [user_id, item.product_id, item.quantity, item.size]);
    }
}

export async function removeFromCart(user_id: number, product_id: number, size: number): Promise<void> {
    const existingItem = await db.queryEntries(`
        SELECT id FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?`,
        [user_id, product_id, size]);

    if (existingItem.length > 0) {
        await db.queryEntries(`
            DELETE FROM cart_items WHERE id = ? AND user_id = ? AND size = ?`,
            [existingItem[0].id, user_id, size]);
    }
}

export async function UpdateCart(user_id: number, item: CartItemDB): Promise<CartItem[] | null> {
    try {
        console.log("UpdateCart called with:", { user_id, item });

        const existingItem = await db.queryEntries(`
            SELECT id FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?`,
            [user_id, item.product_id, item.size]);

        console.log("Existing item query result:", existingItem);

        if (existingItem.length > 0) {
            const id = existingItem[0].id;

            await db.queryEntries(`
                UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?`,
                [item.quantity, id, user_id]);

            console.log("Update query executed");

            const updatedRow = await db.queryEntries(`SELECT quantity FROM cart_items WHERE id = ?`, [id]);
            console.log("Quantity in DB after update:", updatedRow);

            const updatedCart = await getCartByUserId(user_id);
            console.log("Updated cart:", updatedCart);

            return updatedCart;
        } else {
            throw new Error("Cart item not found");
        }
    } catch (error) {
        console.error("Error in UpdateCart:", error);
        throw error;
    }
}

export async function getProductStockForSize(productId: number, size: number): Promise<number> {
    try {
        console.log(`Checking stock for product ${productId}, size ${size}`);

        const result = await db.queryEntries(`
            SELECT quantity 
            FROM product_variants 
            WHERE product_id = ? AND size = ?
        `, [productId, size]);

        console.log("Stock query result:", result);

        if (!result || result.length === 0) {
            console.log("No stock found, returning 0");
            return 0;
        }

        const stockQuantity = Number(result[0].quantity);
        console.log(`Found stock quantity: ${stockQuantity}`);

        return stockQuantity;
    } catch (error) {
        console.error("Error checking product stock:", error);
        throw new Error(`Failed to check product stock: ${error.message}`);
    }
}
