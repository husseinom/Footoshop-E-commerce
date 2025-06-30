export interface Product {
  id: number;
  seller_id: number;
  title: string;
  created_price: number;
  actual_price: number; // Assuming this is a decimal value
  condition: 'new' | 'used' ; // Assuming these are the only conditions
  gender_category_id: number; // Assuming this is a foreign key to a categories table
  type_category_id: number; // Assuming this is a foreign key to a categories table
  description?: string; // Optional, can be NULL if not provided
  created_at: Date; // Timestamp
  updated_at?: Date; // Optional, can be NULL if not provided
  is_available: boolean;
  is_approved: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size: number; // Assuming size is a decimal value
  quantity: number; // Assuming quantity is an integer value
}
export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string; // Assuming this is a URL or path to the image
  display_order: number; // Assuming this is an integer value
  is_primary: boolean; // Assuming this is a boolean value
}
export type ProductPayload ={
  id: number;
  seller_id: number;
  title: string;
  created_price: number;
  actual_price?: number; // Assuming this is a decimal value
  condition: 'new' | 'used' ; // Assuming these are the only conditions
  gender_category_id: number; // Assuming this is a foreign key to a categories table
  type_category_id: number; // Assuming this is a foreign key to a categories table
  images: Array<{
    image_path: string; // Assuming this is a URL or path to the image
    display_order: number; // Assuming this is an integer value
    is_primary: boolean; // Assuming this is a boolean value
  }>
  variants: Array<{
    size: number; // Assuming size is a decimal value
    quantity: number; // Assuming quantity is an integer value
  }>;
  description?: string; // Optional, can be NULL if not provided
  created_at: Date; // Timestamp
  updated_at?: Date; // Optional, can be NULL if not provided
  is_available: boolean;
  is_approved: boolean;

}
export type ProductCreatePayload = Omit<ProductPayload, 'id' | 'created_at' | 'updated_at'> & {
  product_id?: number;
}; ;
