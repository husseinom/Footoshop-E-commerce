import { Context } from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { createCategory, getAllCategories, getGenderCategoriesDB, getTypeCategoriesDB, getCategoryBySlug } from "../models/Category.ts";

export async function AddCategory(ctx: Context){
    try{
        const body = await ctx.request.body.json();
        const {name, slug, is_gender}= body;

        console.log(`[ADDING] Attempting to add category: ${slug}`);

        const existingCategory = await getCategoryBySlug(slug);
        if (existingCategory) {
            ctx.response.status = 409;
            ctx.response.body = { message: "Category already exists" };
            return;
        }
        const isGender = is_gender === 'true' || is_gender === true;
        const newCategory= await createCategory(
            name,
            slug,
            isGender,
        );

        ctx.response.status = 201;
        ctx.response.body = { message: "Category created successfully", category: newCategory };
        console.log(`[ADDED] Category added: ${slug}`);
    }catch (error) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Failed to add category", error: error.message };
    }
}

export async function filterCategories(ctx: Context) {
    try {
        const gender_categories = await getGenderCategoriesDB();
        const type_categories = await getTypeCategoriesDB();

        ctx.response.status = 200;
        ctx.response.body = { 
            gender_categories,
            type_categories
        };
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve categories", error: error.message };
    }
}
