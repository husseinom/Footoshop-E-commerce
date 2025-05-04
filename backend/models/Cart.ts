import{CartItemDB, CartItem} from "../types/cart.ts";
import db from "../database/client.db.ts";


export async function getCartByUserId(user_id: number): Promise<CartItem[] | null> {
    const result = await db.query(`
        SELECT ci.id, ci.product_id, ci.user_id, ci.quantity, ci.size,
        p.title, p.actual_price, pi.image_path
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
        WHERE ci.user_id = ?
        `, [user_id]);
    if (!result || result.length === 0 || result[0].length === 0) {
        return null;
    }
    const cart: CartItem[]= result.map(([id, product_id, user_id, quantity, size, title, price, image_path]) => ({
        id,
        product_id,
        user_id,
        quantity,
        size,
        product: {
            id: product_id,
            title,
            actual_price: price,
            image_path
        }
    }));
    return cart;
    
}
export async function addToCart(user_id: number, item: CartItemDB): Promise<void> {
    const existingItem = await db.query(`
        SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?`, [user_id, item.product_id, item.size]
    );
    if (existingItem.length > 0) {
        const newQuantity =existingItem[0].quantity + item.quantity;
        await db.query(`
            UPDATE cart_items SET quantity = ? WHERE id = ?`, [newQuantity, existingItem[0].id]
        );
    } else {
        await db.query(`
            INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES (?, ?, ?, ?)`, [user_id, item.product_id, item.quantity, item.size]
        );
    }
}

export async function removeFromCart(user_id: number, product_id:number, size:number): Promise<void> {
    const existingItem = await db.query(`
        SELECT id FROM cart_items WHERE user_id= ? AND product_id = ? AND size = ?`, [user_id, product_id, size]);
    if (existingItem.length > 0) {
        await db.query(`
            DELETE FROM cart_items WHERE id = ? AND user_id = ? AND size = ?`, [existingItem[0].id, user_id, size]
        );
    }
}

export async function UpdateCart(user_id: number, item: CartItemDB): Promise<void> {
    const existingItem = await db.query(`
        SELECT id FROM cart_items WHERE user_id= ? AND product_id = ? AND size = ?`, [user_id, item.product_id, item.size]);
    if (existingItem.length > 0) {
        await db.query(`
            UPDATE cart_items SET quantity= ? AND size = ? WHERE id=? AND user_id = ? AND size= ?`, [item.quantity, item.size, existingItem[0].id, user_id, item.size]
        );
    }
    
}
