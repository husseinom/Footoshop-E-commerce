import db from "../database/client.db.ts";
import { WishlistItem, WishlistItemDB } from "../types/wishlist.ts";

export async function getWishlistByUserId(user_id: number): Promise<WishlistItem[] | null> {
    const result = await db.query(`
        SELECT wi.id, wi.product_id, wi.user_id, 
        p.title, p.actual_price, pi.image_path
        FROM wishlist_items wi
        JOIN products p ON wi.product_id = p.id
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
        WHERE wi.user_id = ?
        `, [user_id]);
    if (!result || result.length === 0 || result[0].length === 0) {
        return null;
    }
    const wishlist: WishlistItem[]= result.map(([id, product_id, user_id,title, price, image_path]) => ({
        id,
        product_id,
        user_id,
        product: {
            id: product_id,
            title,
            actual_price: price,
            image_path
        }
    }));
    return wishlist;
    
}
export async function addToWishlist(user_id: number, item: WishlistItemDB): Promise<void> {
        await db.query(`
            INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)`, [user_id, item.product_id]
        );
    
}

export async function removeFromWishlist(user_id: number, product_id:number): Promise<void> {
    const existingItem = await db.queryEntries(`
        SELECT id FROM wishlist_items WHERE user_id= ? AND product_id = ?`, [user_id, product_id]);
    if (existingItem.length > 0) {
        await db.queryEntries(`
            DELETE FROM wishlist_items WHERE id = ? AND user_id = ?`, [existingItem[0].id, user_id]
        );
    }
}