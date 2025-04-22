export interface Product {
  id: number;
  seller_id: number;
  seller_username: string;
  title: string;
  price: number;
  size: number;
  condition: 'new' | 'used' | 'good condition'; // Assuming these are the only conditions
  category: string;
  images: string[]; // Assuming this is an array of image URLs or paths
  quantity: number; // Default is 1
  description?: string; // Optional, can be NULL if not provided
  created_at: Date; // Timestamp
  updated_at?: Date; // Optional, can be NULL if not provided
}

export type CreateProductPayload = Omit<Product, 'id' | 'created_at'>;
