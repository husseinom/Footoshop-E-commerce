import { ProductPayload, ProductCreatePayload } from "../types/product.ts";
import db from "../database/client.db.ts";

export async function createProduct(product: ProductCreatePayload): Promise<ProductPayload> {
    try{// Insert and get back id/created_at
    const result = await db.query(
      `INSERT INTO products (
        seller_id, title, created_price, actual_price,
        condition, gender_category_id, type_category_id, description, is_available, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id, created_at`,[
        product.seller_id,
        product.title,
        product.created_price,
        product.actual_price ,
        product.condition,
        product.gender_category_id,
        product.type_category_id,
        product.description || null,
        product.is_available || true,
        product.is_approved || false,
        ]);
        console.log("Insert result:", result);

        const productid = result[0][0];
        const created_at = result[0][1];

        for (const image of product.images) {
            await db.query(
                `INSERT INTO product_images (product_id, image_path, display_order, is_primary) VALUES (?, ?, ?, ?)`,
                [productid, image.image_path, image.display_order, image.is_primary]
            );
        }
        for (const variant of product.variants) {
            await db.query(
                `INSERT INTO product_variants (product_id, size, quantity) VALUES (?, ?, ?)`,
                [productid, variant.size, variant.quantity]
            );
        }
        return {
            ...product,
            id: productid,
            created_at, 
        };
    }catch(error){
        console.error("Error creating product:", error);
        throw new Error('Error creating product');
    }
}

export async function createProductOrAddVariant(product: ProductCreatePayload): Promise<ProductPayload | { message: string }> {
    try {
      // If product_id exists, check if it exists in the product_variants table
      if (product.product_id) {
        // Check if product_id exists in the product_variants table
        const productVariants = await db.queryEntries(
          "SELECT * FROM product_variants WHERE product_id = ?",
          [product.product_id]
        );
  
        if (productVariants.length > 0) {
          // Add the variant to the existing product (single variant)
          const variant = product.variants[0]; // Only one variant
          await db.query(
            `INSERT INTO product_variants (product_id, size, quantity) VALUES (?, ?, ?)`,
            [product.product_id, variant.size, variant.quantity]
          );
          return { message: "Variant added to existing product" };
        } else {
          // Invalid product_id, treat as new product
          return await createProduct(product);
        }
      } else {
        // No product_id provided, treat as new product
        return await createProduct(product);
      }
    } catch (error) {
      console.error("Error processing product:", error);
      throw new Error('Error processing product');
    }
  }
  

export async function getProductbyGenderCategory(gender_category_id: number): Promise<ProductPayload[]> {
    const result = await db.query(
        `SELECT 
         p.id, p.seller_id, p.title, p.created_price, p.actual_price,
         p.condition, p.gender_category_id, p.type_category_id,
         p.description, p.created_at, p.updated_at,
         u.username as seller_username
        FROM products p
        JOIN users u ON p.seller_id = u.id
        WHERE p.gender_category_id = ? AND p.is_approved = TRUE AND p.is_available = TRUE
        ORDER BY p.created_at DESC`,[gender_category_id]
    );
    return result.map((row: any) => ({
      id: row[0],
      seller_id: row[1],
      title: row[2],
      created_price: row[3],
      actual_price: row[4],
      condition: row[5],
      gender_category_id: row[6],
      type_category_id: row[7],
      description: row[8],
      created_at: new Date(row[9]),
      updated_at: row[10] ? new Date(row[10]) : undefined,
    }));
}
export async function getProductbyTypeCategory(type_category_id: number): Promise<ProductPayload[]> {
    const result = await db.query(
        `SELECT 
         p.id, p.seller_id, p.title, p.base_price, p.current_price,
         p.condition, p.gender_category_id, p.type_category_id,
         p.description, p.created_at, p.updated_at,
         u.username as seller_username
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.type_category_id = ? AND p.is_approved = TRUE AND p.is_available = TRUE
       ORDER BY p.created_at DESC`,[type_category_id]
    );
    return result.map((row: any) => ({
        id: row[0],
        seller_id: row[1],
        title: row[2],
        base_price: row[3],
        current_price: row[4],
        condition: row[5],
        gender_category_id: row[6],
        type_category_id: row[7],
        description: row[8],
        created_at: new Date(row[9]),
        updated_at: row[10] ? new Date(row[10]) : undefined,
      }));
}

export async function findByBothCategory(gender_category_id: number, type_category_id: number): Promise<ProductPayload[]> {
    const result = await db.query(
        `SELECT 
         p.id, p.seller_id, p.title, p.created_price, p.actual_price,
         p.condition, p.gender_category_id, p.type_category_id,
         p.description, p.created_at, p.updated_at,
         u.username as seller_username
       FROM products p
       JOIN users u ON p.seller_id = u.id
       WHERE p.type_category_id = ? AND p.gender_category_id = ? AND p.is_approved = TRUE AND p.is_available = TRUE
       ORDER BY p.created_at DESC`,[type_category_id, gender_category_id]
    );
    return result.map((row: any) => ({
        id: row[0],
        seller_id: row[1],
        title: row[2],
        created_price: row[3],
        actual_price: row[4],
        condition: row[5],
        gender_category_id: row[6],
        type_category_id: row[7],
        description: row[8],
        created_at: new Date(row[9]),
        updated_at: row[10] ? new Date(row[10]) : undefined,
      }));
}

export async function getAllProductsAdmin():Promise<ProductPayload[]> {
    const result = await db.query(
        `SELECT * FROM products ORDER BY created_at DESC`
    );
    return result.map((row: any) => ({
        id: row[0],
        seller_id: row[1],
        title: row[2],
        created_price: row[5],
        actual_price: row[6],
        condition: row[7],
        gender_category_id: row[3],
        type_category_id: row[4],
        description: row[8],
        created_at: new Date(row[9]),
        updated_at: row[10] ? new Date(row[10]) : undefined,
        is_available: row[11],
        is_approved: row[12]
      }));
}

export async function getAllProductsUser():Promise<ProductPayload[]> {
    const result = await db.query(
        `SELECT * FROM products WHERE is_approved = TRUE AND is_available = TRUE ORDER BY created_at DESC`
    );
    return result.map((row: any) => ({
        id: row[0],
        seller_id: row[1],
        title: row[2],
        created_price: row[3],
        actual_price: row[4],
        condition: row[5],
        gender_category_id: row[6],
        type_category_id: row[7],
        description: row[8],
        created_at: new Date(row[9]),
        updated_at: row[10] ? new Date(row[10]) : undefined,
      }));
}

export async function getProductBytitle(title: string): Promise<ProductPayload | null> {
    const result = await db.query(
        `SELECT * FROM products WHERE title = ? AND is_approved = TRUE AND is_available = TRUE`,[title]
    );
    if (!result || result.length === 0 || result[0].length === 0) {
        return null;
      }
      const row = result[0];
      return result.map((row: any) => ({
        id: row[0],
        seller_id: row[1],
        title: row[2],
        created_price: row[3],
        actual_price: row[4],
        condition: row[5],
        gender_category_id: row[6],
        type_category_id: row[7],
        description: row[8],
        created_at: new Date(row[9]),
        updated_at: row[10] ? new Date(row[10]) : undefined,
      }));
}

export async function deleteProductById(productId:number): Promise<void>{
    try{
        await db.queryEntries(`
            DELETE FROM products WHERE id = ?`,[productId]);
    }catch (error) {
        console.error("Error in deleteProductById:", error);
    }
}

export async function getLatestProductsWithImage(limit: number = 10) {
    const products = db.queryEntries<{
      id: number;
      title: string;
      actual_price: number;
      image_path: string | null;
    }>(`
      SELECT p.id, p.title, p.actual_price, pi.image_path
      FROM products p
      LEFT JOIN product_images pi
        ON pi.product_id = p.id AND pi.is_primary = 1
      WHERE p.is_approved = 1 AND p.is_available = 1
      ORDER BY p.created_at DESC
      LIMIT ?
    `, [limit]);
  
    return products;
}


