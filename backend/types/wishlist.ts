export interface WishlistItemDB{
    id?:number;
    product_id: number;
    user_id: number;
}

export interface WishlistItem extends WishlistItemDB{ 
    product:{
        id: number;
        title: string;
        actual_price: number;
        image_path: string;
    }
}