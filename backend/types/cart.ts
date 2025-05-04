export interface CartItemDB{
    id?:number;
    product_id: number;
    user_id: number;
    quantity: number;
    size: number;
}

export interface CartItem extends CartItemDB{ 
    product:{
        id: number;
        title: string;
        actual_price: number;
        image_path: string;
    }
}
