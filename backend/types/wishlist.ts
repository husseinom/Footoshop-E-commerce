import { ProductPayload } from "./product.ts";

export interface WishlistItem {
  id?: number;
  product_id: number;
  user_id: number;
}

export interface Wishlist{
    id:number;
    user_id:number;
    items: Array<{
        product: ProductPayload;
    }>;
}