import{Context} from "https://deno.land/x/oak@v17.1.4/mod.ts";
import { createProductOrAddVariant, getAllProductsAdmin, getAllProductsUser, getProductBytitle, getProductbyGenderCategory, getProductbyTypeCategory, deleteProductById, getLatestProductsWithImage, getProductById, getProductsFiltred  } from "../models/Product.ts";
import { ProductCreatePayload } from "../types/product.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";; // To join paths safely
export async function newProduct(ctx: Context){
    console.log("reached newUser");
    try {
        // Step 1: Parse the incoming JSON payload (for the product details)
        const formData = await ctx.request.body.formData();
        console.log("FormData received:", formData);
        const productDataString = formData.get("product") as string;
        console.log("Product data (string):", productDataString);
        const productData: ProductCreatePayload = JSON.parse(productDataString);
        console.log("Parsed Product Data:", productData);
        
        const images: File[] = formData.getAll("images") as File[];
        console.log("Images received:", images);
        // Step 2: Handle image uploads
        const savedImages :{image_path:string,display_order:number, is_primary:boolean} []= [];
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const ext = file.name?.split('.').pop();
          const uniqueFilename = `${productData.seller_id}-${Date.now()}-${i}.${ext}`;
          console.log(`Saving image: ${file.name} as ${uniqueFilename}`);
    
          // Use `join` to safely create the path
          const savePath = join(Deno.cwd(), "assets", uniqueFilename);
          console.log("Save path for the image:", savePath);
          const relativePath=join("assets", uniqueFilename); 
          // Save the uploaded file to the disk
          const fileData = await file.arrayBuffer(); // Read the uploaded temp file
          console.log("File data read:", fileData);
          await Deno.writeFile(savePath, new Uint8Array(fileData)); // Write the file to the assets directory
          console.log(`Image saved successfully to ${relativePath}`);
          // Push image data (path, order, primary flag) to savedImages
          savedImages.push({
            image_path: relativePath, // Relative path for front-end access
            display_order: i,
            is_primary: i === 0, // Make the first image the primary one
          });
        }
    
        // Step 3: Prepare the product data object
        productData.images = savedImages;
        console.log("Updated Product Data with Image Paths:", productData);
    
        // Step 4: Call the model function to save the product
        const createdProduct = await createProductOrAddVariant(productData);
    
        // Respond with the created product
        ctx.response.status = 201;
        ctx.response.body = {createdProduct};
        console.log("Product Created Successfully !")
    
      } catch (err) {
        console.error("Error handling product creation:", err);
        ctx.response.status = 500;
        ctx.response.body = { message: "Error creating product" };
    }
}


export async function AllProductsUsers(ctx: Context) {
    try {
        const products = await getAllProductsUser();
        ctx.response.status = 200;
        ctx.response.body = products ;
        console.log("Products: ", products);
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve products", error: error.message };
    }
}

export async function AllProductsAdmin(ctx:Context){
    try{
        const products = await getAllProductsAdmin();
        ctx.response.state = 200;
        ctx.response.body = {products};
    }catch(error){
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve products", error: error.message };

    }
}

export async function DeleteProducts(ctx: Context){
    try{
        const id = ctx.params.id;
        await deleteProductById(id);
        ctx.response.status = 200;
        ctx.response.body={message: "Product Successfully Deleted"};
    }catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to delete product", error: error.message };
    }
}
export async function getSingleProduct(ctx: Context){
    try{
        const ProductId= ctx.params.id;
        const product = await getProductById(ProductId);
        console.log("Product :", product);
        ctx.response.status = 200;
        ctx.response.body = product;
    }catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve product", error: error.message };
    }
}

export async function getLatestProducts(ctx: Context) {
    try {
      const url = new URL(ctx.request.url);
      console.log(`got url ${url.pathname}`);
      const limit = Number(url.searchParams.get("limit")) || 10;
  
      const products = await getLatestProductsWithImage(limit);
  
      ctx.response.status = 200;
      ctx.response.body = products;
      console.log("Successfully");
    } catch (err) {
      console.error("Failed to fetch latest products:", err);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal Server Error" };
    }
}
export async function getProductsByGender(ctx: Context) {
    try {
      const url = new URL(ctx.request.url);
      console.log(`got url ${url.pathname}`);
      const GenderId = Number(url.searchParams.get("CategoryId"));
      const products = await getProductbyGenderCategory(GenderId);
      ctx.response.status = 200;
      console.log("Products categories : ", products);
      ctx.response.body = products;
    }catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve products", error: error.message };
    }

}

export async function getProductsByType(ctx: Context) {
    try {
      const url = new URL(ctx.request.url);
      console.log(`got url ${url.pathname}`);
      const TypeId = Number(url.searchParams.get("TypeId"));
      const products = await getProductbyTypeCategory(TypeId);
      ctx.response.status = 200;
      console.log("Products categories : ", products);
      ctx.response.body = products;
    }catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve products", error: error.message };
    }

}

export async function filterProducts(ctx: Context){
    try{
        const url = new URL(ctx.request.url);
        console.log(`got url ${url.pathname}`);
        const genderId = url.searchParams.getAll("categories").map(Number);
        console.log("genderId", genderId);
        const typeId = url.searchParams.getAll("subCategories").map(Number);
        console.log("typeId", typeId);
        const minPrice = Number(url.searchParams.get("priceMin"));
        console.log("minPrice", minPrice);
        const maxPrice = Number(url.searchParams.get("priceMax"));
        console.log("maxPrice", maxPrice);
        const minSize = Number(url.searchParams.get("sizeMin"));
        console.log("minSize", minSize);
        const maxSize = Number(url.searchParams.get("sizeMax"));
        console.log("maxSize", maxSize);

        const products = await getProductsFiltred(genderId, typeId, minPrice, maxPrice, minSize, maxSize);
        console.log("Products categories : ", products);
        ctx.response.status = 200;
        ctx.response.body = products;
    }catch (error) {
        ctx.response.status = 500;
        ctx.response.body = { message: "Failed to retrieve products", error: error.message };
    }
}



