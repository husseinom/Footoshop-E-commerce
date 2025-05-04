import db from "../database/client.db.ts";
import {Category, NewCategory} from "../types/category.ts"

export async function getGenderCategoriesDB(): Promise<Category[]>{
    const result = await db.queryEntries(`
        SELECT * FROM categories WHERE is_gender = TRUE `
    );
    console.log("Gender Categories from DB:", result);
    // Add a return statement for valid results
    return result;

}

export async function getTypeCategoriesDB(): Promise<Category[]>{
    const result = await db.queryEntries(`
        SELECT * FROM categories WHERE is_gender = FALSE `
    );
    console.log("Type Categories from DB:", result);
    // Add a return statement for valid results
    return result

}

export async function createCategory(name: string, slug: string, is_gender: boolean): Promise<void> {
    const genderValue = is_gender ? 1 : 0; // Convert to 1 or 0 based on boolean
    await db.queryEntries(`
        INSERT INTO categories (name, slug, is_gender)
        VALUES ('${name}', '${slug}', ${genderValue});
    `);
}

export async function getAllCategories(): Promise<Category>{
    const result = await db.query(`
        SELECT * FROM categories `
    );
    // Add a return statement for valid results
    return result.map((row:any) =>({
        id: row[0],
        name: row[1],
        slug: row[2],
        is_gender: row[3],
    }))

}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const result = await db.query(
        `SELECT id, name, slug, is_gender 
         FROM categories WHERE slug = ?`,
        [slug]
      );
    
      if (!result || result.length === 0 || result[0].length === 0) {
        return null;
      }
  
      // Extract the first row from the result
      const row = result[0];
      
      // Map the array positions to user properties
      return {
        id: row[0],
        name: row[1],
        slug: row[2],
        is_gender: row[3],
      };
    } catch (error) {
      console.error("Error in getCategoryBySlug:", error);
      return null;
    }
}