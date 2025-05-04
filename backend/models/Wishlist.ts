import db from "../database/client.db.ts";
import { Wishlist, WishlistItem } from "../types/wishlist.ts";

export async function getWishlist(user_id: number): Promise<Wishlist> {
    // Create if doesn't exist
    const [wishlist] = await db.query(`
        INSERT OR IGNORE INTO wishlist (user_id) VALUES (?)
        RETURNING id`, [user_id]
    );
    const wishlist_id = wishlist ? wishlist[0] : (await db.query(`
        SELECT id FROM wishlist WHERE user_id = ?`, [user_id]))[0][0];
    const items = await db.query(`
        SELECT wi.id, wi.product_id, p.title, p.created_price, p.actual_price, p.condition
        FROM wishlist_items wi
        JOIN products p ON wi.product_id = p.id
        WHERE wi.wishlist_id = ?`, [wishlist_id]
    );
    const wishlistItems = items.map((item: any) => ({
        id: item[0],
        product: {
            id: item[1],
            title: item[2],
            created_price: item[3],
            actual_price: item[4],
            condition: item[5]
        },
    }));
    return {
        id: wishlist_id,
        user_id: user_id,
        items: wishlistItems
    };
}

export async function addToWishlist(user_id: number, item: WishlistItem): Promise<Wishlist> {
    const wishlist = await getWishlist(user_id);
    const existingItem = wishlist.items.find((i) => i.product.id === item.product_id);
    if (!existingItem) {
        await db.query(`
            INSERT INTO wishlist_items (wishlist_id, product_id) VALUES (?, ?)`, [wishlist.id, item.product_id]
        );
    }
    return getWishlist(user_id);
}

export async function removeFromWishlist(user_id: number, item: WishlistItem): Promise<Wishlist> {
    const wishlist = await getWishlist(user_id);
    const existingItem = wishlist.items.find((i) => i.product.id === item.product_id);
    if (existingItem) {
        await db.query(`
            DELETE FROM wishlist_items WHERE id = ?`, [existingItem.product.id]
        );
    }
    return getWishlist(user_id);
}