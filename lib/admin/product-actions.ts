"use server";

import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  setDoc,
  deleteField,
} from "firebase/firestore";
import type { ProductType } from "@/types/product";
import { ProductImage } from "./image-utils";
import { uploadImage } from "@/lib/cloudinary/cloudinary-utils";
import { revalidateTag } from "next/cache";

async function uploadImageToStorage(
  imageUrl: string,
  productId: string
): Promise<string> {
  try {
    // If it's already a Cloudinary URL, return it
    if (imageUrl.includes("cloudinary.com")) {
      return imageUrl;
    }

    // If it's a base64 string, convert and upload it
    if (imageUrl.startsWith("data:image")) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return await uploadImage(blob, `products/${productId}`);
    }

    // If it's a regular URL, download and upload it
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return await uploadImage(blob, `products/${productId}`);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function createProduct(productData: Partial<ProductType>) {
  try {
    console.log(
      "Creating product with data:",
      JSON.stringify({
        name: productData.name,
        category_id: productData.category_id,
        subcategory_id: productData.subcategory_id,
        is_new_arrival: productData.is_new_arrival,
        has_hijab: productData.has_hijab,
      })
    );

    // Validate required fields
    if (!productData.name) {
      return { success: false, error: "Product name is required" };
    }

    if (!productData.category_id) {
      return { success: false, error: "Category is required" };
    }

    // Normalize subcategory_id to ensure it matches URL format
    if (productData.subcategory_id) {
      // Ensure subcategory_id is properly formatted
      productData.subcategory_id = productData.subcategory_id
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      console.log(`Normalized subcategory_id: ${productData.subcategory_id}`);
    }

    // First, add the product to the products collection without images
    const productWithoutImages = {
      ...productData,
      images: [], // Start with empty images array
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    const productsRef = collection(db, "products");
    const productDocRef = await addDoc(productsRef, productWithoutImages);
    console.log(`Product added with ID: ${productDocRef.id}`);

    // Upload images to Firebase Storage and get their URLs
    let processedImages: any[] = [];
    if (productData.images && productData.images.length > 0) {
      try {
        // Create a Set to track unique image URLs
        const uniqueImageUrls = new Set<string>();

        const allImages = await Promise.all(
          productData.images.map(async (image) => {
            if (uniqueImageUrls.has(image.url)) {
              return null;
            }
            uniqueImageUrls.add(image.url);
            // If it's already a processed URL, keep it as is
            if (image.url.includes("cloudinary.com")) {
              return image;
            }
            // Process new images
            const storageUrl = await uploadImageToStorage(image.url, productDocRef.id);
            return {
              url: storageUrl,
              alt_text: image.alt_text || "Product image",
              is_default: image.is_default || false,
            };
          })
        );
        processedImages = allImages.filter((img): img is ProductImage => img !== null);
      } catch (error) {
        console.error("Error processing images:", error);
        // Continue with product creation even if image processing fails
      }
    }

    // Update the product with the processed image URLs
    const productWithImages = {
      ...productWithoutImages,
      images: processedImages,
    };

    // Create a product object with the product ID for storing in categories
    // Remove serverTimestamp() fields as they can't be used in arrays
    const productForCategory = {
      ...productWithImages,
      productId: productDocRef.id,
      created_at: new Date().toISOString(), // Use ISO string instead of serverTimestamp
      updated_at: new Date().toISOString(), // Use ISO string instead of serverTimestamp
    };

    // Update the product document with the image URLs
    await updateDoc(doc(db, "products", productDocRef.id), {
      images: processedImages,
    });

    // Then, add the product to the categories collection under the appropriate category and subcategory
    if (productData.category_id) {
      const categoryRef = doc(db, "categories", productData.category_id);
      const categoryDoc = await getDoc(categoryRef);

      if (!categoryDoc.exists()) {
        console.error(`Category not found: ${productData.category_id}`);
        // Delete the product since category doesn't exist
        await deleteDoc(doc(db, "products", productDocRef.id));
        return { success: false, error: "Selected category does not exist" };
      }

      console.log(`Category found: ${productData.category_id}`);
      const categoryData = categoryDoc.data();
      const products = categoryData.products || [];

      // Store category slug and name in the product data
      const categorySlug = categoryData.slug;
      const categoryName = categoryData.name;

      // Update the product in the products collection with the category slug and name
      await updateDoc(doc(db, "products", productDocRef.id), {
        category_slug: categorySlug,
        category: categoryName,
      });

      // Also update the product object for categories collection
      productForCategory.category_slug = categorySlug;
      productForCategory.category = categoryName;

      // Add the product to the category's products array
      products.push(productForCategory);

      // Update the category document with the new product
      await updateDoc(categoryRef, {
        products,
        updated_at: serverTimestamp(),
      });
      console.log(`Product added to category: ${productData.category_id}`);

      // If there's a subcategory, also add the product to the subcategory
      if (productData.subcategory_id) {
        const subcategories = categoryData.subcategories || [];
        console.log(
          `Looking for subcategory with slug: ${productData.subcategory_id}`
        );
        console.log(
          `Available subcategories: ${JSON.stringify(
            subcategories.map((s: any) => ({ name: s.name, slug: s.slug }))
          )}`
        );

        // Try to find the subcategory by exact match or normalized match
        let subcategoryIndex = subcategories.findIndex(
          (sub: any) => sub.slug === productData.subcategory_id
        );

        // If not found by exact match, try with normalized slugs
        if (subcategoryIndex === -1) {
          subcategoryIndex = subcategories.findIndex((sub: any) => {
            // Normalize both slugs for comparison
            const normalizedSubSlug = sub.slug
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/&/g, "-");
            const normalizedProductSubSlug = productData
              .subcategory_id!.toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/&/g, "-");
            return normalizedSubSlug === normalizedProductSubSlug;
          });
        }

        if (subcategoryIndex === -1) {
          console.error(`Subcategory not found: ${productData.subcategory_id}`);
          // Delete the product since subcategory doesn't exist
          await deleteDoc(doc(db, "products", productDocRef.id));
          return {
            success: false,
            error: "Selected subcategory does not exist",
          };
        }

        console.log(
          `Subcategory found at index ${subcategoryIndex}: ${subcategories[subcategoryIndex].name}`
        );
        const subcategory = subcategories[subcategoryIndex];
        const subcategoryProducts = subcategory.products || [];

        // Store subcategory slug and name in the product data
        const subcategorySlug = subcategory.slug;
        const subcategoryName = subcategory.name;

        // Update the product in the products collection with the subcategory slug and name
        await updateDoc(doc(db, "products", productDocRef.id), {
          subcategory_slug: subcategorySlug,
          subcategory: subcategoryName,
        });

        // Also update the product object for subcategories collection
        productForCategory.subcategory_slug = subcategorySlug;
        productForCategory.subcategory = subcategoryName;

        subcategoryProducts.push(productForCategory);

        subcategories[subcategoryIndex] = {
          ...subcategory,
          products: subcategoryProducts,
        };

        await updateDoc(categoryRef, {
          subcategories,
          updated_at: serverTimestamp(),
        });
        console.log(
          `Product added to subcategory: ${productData.subcategory_id}`
        );
        revalidateTag("global"); // Revalidate the global cache tag
      }
    }

    // If the product is marked as new arrival, add it to the New Arrivals category
    if (productData.is_new_arrival) {
      console.log("Adding product to New Arrivals category");
      // Use the correct category ID for New Arrivals
      const newArrivalsRef = doc(db, "categories", "new-arrivals");
      const newArrivalsDoc = await getDoc(newArrivalsRef);

      if (!newArrivalsDoc.exists()) {
        console.log("New Arrivals category not found, creating it...");
        // Create the New Arrivals category if it doesn't exist
        await setDoc(newArrivalsRef, {
          name: "New Arrivals",
          slug: "new-arrivals",
          categoryId: "new-arrivals", // Add categoryId field
          description: "Latest products added to our store",
          products: [],
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
        console.log("New Arrivals category created");
      }

      // Get the updated New Arrivals category
      const updatedNewArrivalsDoc = await getDoc(newArrivalsRef);
      const newArrivalsData = updatedNewArrivalsDoc.data();
      const newArrivalsProducts = newArrivalsData?.products || [];

      // Create a copy of the product for New Arrivals category
      const productForNewArrivals = {
        ...productForCategory,
        category_id: "new-arrivals",
        category: "New Arrivals",
        category_slug: "new-arrivals",
        is_new_arrival: true,
        new_arrivals_category_id: "new-arrivals",
      };

      // Add the product to the New Arrivals category
      newArrivalsProducts.push(productForNewArrivals);

      // Update the New Arrivals category
      await updateDoc(newArrivalsRef, {
        products: newArrivalsProducts,
        updated_at: serverTimestamp(),
      });
      console.log(
        "Product added to New Arrivals category with data:",
        JSON.stringify({
          productId: productForNewArrivals.productId,
          name: productForNewArrivals.name,
          category_id: productForNewArrivals.category_id,
          is_new_arrival: productForNewArrivals.is_new_arrival,
        })
      );

      // Also update the product document to mark it as a new arrival
      await updateDoc(doc(db, "products", productDocRef.id), {
        is_new_arrival: true,
        new_arrivals_category_id: "new-arrivals",
        secondary_categories: ["new-arrivals"],
      });
      console.log("Product document updated with New Arrivals flags");
    }

    // After all Firestore updates (just before return)
    revalidateTag("global"); // Cache invalidate for all products

    return { success: true, productId: productDocRef.id };
  } catch (error) {
    console.error("Error creating product:", error);
    // Return more detailed error information
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  productId: string,
  productData: Partial<ProductType>
) {
  try {
    console.log(
      "Starting product update for ID:",
      productId,
      "\nData being sent:",
      JSON.stringify(productData, null, 2)
    );

    // Get existing product data to compare changes
    const productDocRef = doc(db, "products", productId);
    const productDoc = await getDoc(productDocRef);

    if (!productDoc.exists()) {
      console.error("Product not found:", productId);
      return { success: false, error: "Product not found" };
    }

    const currentProductData = productDoc.data() as ProductType;
    console.log(
      "Current product data in database:",
      JSON.stringify(currentProductData, null, 2)
    );

    // Check if category or subcategory has changed
    const categoryChanged =
      productData.category_id &&
      productData.category_id !== currentProductData.category_id;
    const subcategoryChanged =
      productData.subcategory_id &&
      productData.subcategory_id !== currentProductData.subcategory_id;

    console.log("Category changed:", categoryChanged);
    console.log("Subcategory changed:", subcategoryChanged);

    // Normalize subcategory_id if provided
    if (productData.subcategory_id) {
      productData.subcategory_id = productData.subcategory_id
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
    }

    // Handle image updates
    let processedImages = currentProductData.images || [];
    if (productData.images && productData.images.length > 0) {
      try {
        const uniqueImageUrls = new Set<string>();
        const allImages = await Promise.all(
          productData.images.map(async (image) => {
            if (uniqueImageUrls.has(image.url)) {
              return null;
            }
            uniqueImageUrls.add(image.url);
            // If it's already a processed URL, keep it as is
            if (image.url.includes("cloudinary.com")) {
              return image;
            }
            // Process new images
            const storageUrl = await uploadImageToStorage(image.url, productId);
            return {
              url: storageUrl,
              alt_text: image.alt_text || "Product image",
              is_default: image.is_default || false,
            };
          })
        );
        processedImages = allImages.filter((img): img is ProductImage => img !== null);
      } catch (error) {
        console.error("Error processing images:", error);
        // Keep existing images if processing fails
      }
    }

    // Add updated_at timestamp and processed images
    const productWithTimestamp = {
      ...productData,
      images: processedImages,
      updated_at: serverTimestamp(),
    };

    // Handle save_percent field specifically - remove it if null
    if (productData.save_percent === null) {
      productWithTimestamp.save_percent = deleteField() as unknown as number;
    }
    
    // Handle sale_price field - remove it if null or undefined
    if (productData.sale_price === null || productData.sale_price === undefined) {
      productWithTimestamp.sale_price = deleteField() as unknown as number;
    }

    console.log(
      "Updating product with data:",
      JSON.stringify(productWithTimestamp, null, 2)
    );

    // Update the product in products collection
    await updateDoc(productDocRef, productWithTimestamp);
    console.log("Product document updated successfully");

    // Create updated product object for categories (without serverTimestamp)
    const updatedProductForCategories = {
      ...currentProductData,
      ...productData,
      images: processedImages,
      productId,
      updated_at: new Date().toISOString(),
    };

    // Function to update product in category/subcategory arrays
    const updateProductInCategory = async (categoryId: string, isNewArrival = false) => {
      const categoryRef = doc(db, "categories", categoryId);
      const categoryDoc = await getDoc(categoryRef);

      if (!categoryDoc.exists()) {
        console.log(`Category ${categoryId} not found`);
        return;
      }

      const categoryData = categoryDoc.data();
      let products = categoryData.products || [];
      let subcategories = categoryData.subcategories || [];

      // Find and update product in category's products array
      const productIndex = products.findIndex((p: any) => p.productId === productId);
      if (productIndex !== -1) {
        // Update category and subcategory info if needed
        if (!isNewArrival) {
          updatedProductForCategories.category_slug = categoryData.slug;
          updatedProductForCategories.category = categoryData.name;
        }
        
        products[productIndex] = { ...updatedProductForCategories };
        console.log(`Updated product in category ${categoryId} products array`);
      }

      // Update product in subcategory if it exists there
      let subcategoryUpdated = false;
      for (let i = 0; i < subcategories.length; i++) {
        const subcategory = subcategories[i];
        const subcategoryProducts = subcategory.products || [];
        const subProductIndex = subcategoryProducts.findIndex((p: any) => p.productId === productId);
        
        if (subProductIndex !== -1) {
          // Update subcategory info if this is the current subcategory
          if (!isNewArrival && subcategory.slug === currentProductData.subcategory_id) {
            updatedProductForCategories.subcategory_slug = subcategory.slug;
            updatedProductForCategories.subcategory = subcategory.name;
          }
          
          subcategoryProducts[subProductIndex] = { ...updatedProductForCategories };
          subcategories[i] = {
            ...subcategory,
            products: subcategoryProducts,
          };
          subcategoryUpdated = true;
          console.log(`Updated product in subcategory ${subcategory.slug}`);
        }
      }

      // Update the category document
      const updateData: any = {
        products,
        updated_at: serverTimestamp(),
      };

      if (subcategoryUpdated) {
        updateData.subcategories = subcategories;
      }

      await updateDoc(categoryRef, updateData);
      console.log(`Category ${categoryId} updated successfully`);
    };

    // If category or subcategory changed, handle the move
    if (categoryChanged || subcategoryChanged) {
      console.log("Updating category references...");
      
      // Remove from old category/subcategory
      if (currentProductData.category_id) {
        const oldCategoryRef = doc(db, "categories", currentProductData.category_id);
        const oldCategoryDoc = await getDoc(oldCategoryRef);

        if (oldCategoryDoc.exists()) {
          const oldCategoryData = oldCategoryDoc.data();
          let products = oldCategoryData.products || [];
          let subcategories = oldCategoryData.subcategories || [];

          // Remove product from category's products array
          products = products.filter((p: any) => p.productId !== productId);

          // Remove product from old subcategory if it exists
          if (currentProductData.subcategory_id) {
            subcategories = subcategories.map((sub: any) => ({
              ...sub,
              products: (sub.products || []).filter((p: any) => p.productId !== productId)
            }));
          }

          // Update the old category
          await updateDoc(oldCategoryRef, {
            products,
            subcategories,
            updated_at: serverTimestamp(),
          });
          console.log(`Removed product from old category ${currentProductData.category_id}`);
        }
      }

      // Add to new category/subcategory
      if (productData.category_id) {
        const newCategoryRef = doc(db, "categories", productData.category_id);
        const newCategoryDoc = await getDoc(newCategoryRef);

        if (newCategoryDoc.exists()) {
          const newCategoryData = newCategoryDoc.data();
          let products = newCategoryData.products || [];
          let subcategories = newCategoryData.subcategories || [];

          // Update category info in product
          const categorySlug = newCategoryData.slug;
          const categoryName = newCategoryData.name;
          
          await updateDoc(productDocRef, {
            category_slug: categorySlug,
            category: categoryName,
          });

          updatedProductForCategories.category_slug = categorySlug;
          updatedProductForCategories.category = categoryName;

          // Add product to new category
          products.push(updatedProductForCategories);

          // Handle subcategory
          if (productData.subcategory_id) {
            const subcategoryIndex = subcategories.findIndex(
              (sub: any) => sub.slug === productData.subcategory_id
            );

            if (subcategoryIndex !== -1) {
              const subcategory = subcategories[subcategoryIndex];
              const subcategorySlug = subcategory.slug;
              const subcategoryName = subcategory.name;

              // Update subcategory info in product
              await updateDoc(productDocRef, {
                subcategory_slug: subcategorySlug,
                subcategory: subcategoryName,
              });

              updatedProductForCategories.subcategory_slug = subcategorySlug;
              updatedProductForCategories.subcategory = subcategoryName;

              // Add product to subcategory
              const subcategoryProducts = subcategory.products || [];
              subcategoryProducts.push(updatedProductForCategories);
              
              subcategories[subcategoryIndex] = {
                ...subcategory,
                products: subcategoryProducts,
              };
            }
          }

          // Update the new category
          await updateDoc(newCategoryRef, {
            products,
            subcategories,
            updated_at: serverTimestamp(),
          });
          console.log(`Added product to new category ${productData.category_id}`);
        }
      }
    } else {
      // Category/subcategory didn't change, just update the product data in existing locations
      console.log("Category unchanged, updating product data in existing locations...");
      
      // Update in current category
      if (currentProductData.category_id) {
        await updateProductInCategory(currentProductData.category_id);
      }

      // Update in New Arrivals if it's a new arrival
      if (currentProductData.is_new_arrival) {
        await updateProductInCategory("new-arrivals", true);
      }

      // Update in secondary categories
      const secondaryCategories = currentProductData.secondary_categories || [];
      for (const secondaryCategoryId of secondaryCategories) {
        await updateProductInCategory(secondaryCategoryId);
      }
    }

    // Handle New Arrivals status change
    const newArrivalStatusChanged = 
      productData.hasOwnProperty('is_new_arrival') && 
      productData.is_new_arrival !== currentProductData.is_new_arrival;

    if (newArrivalStatusChanged) {
      const newArrivalsRef = doc(db, "categories", "new-arrivals");
      
      if (productData.is_new_arrival) {
        // Add to New Arrivals
        console.log("Adding product to New Arrivals category");
        const newArrivalsDoc = await getDoc(newArrivalsRef);
        
        if (newArrivalsDoc.exists()) {
          const newArrivalsData = newArrivalsDoc.data();
          const products = newArrivalsData.products || [];
          
          const productForNewArrivals = {
            ...updatedProductForCategories,
            is_new_arrival: true,
          };
          
          products.push(productForNewArrivals);
          
          await updateDoc(newArrivalsRef, {
            products,
            updated_at: serverTimestamp(),
          });
          
          // Update product with new arrival flags
          await updateDoc(productDocRef, {
            is_new_arrival: true,
            new_arrivals_category_id: "new-arrivals",
            secondary_categories: ["new-arrivals"],
          });
        }
      } else {
        // Remove from New Arrivals
        console.log("Removing product from New Arrivals category");
        const newArrivalsDoc = await getDoc(newArrivalsRef);
        
        if (newArrivalsDoc.exists()) {
          const newArrivalsData = newArrivalsDoc.data();
          const products = newArrivalsData.products || [];
          
          const updatedProducts = products.filter((p: any) => p.productId !== productId);
          
          await updateDoc(newArrivalsRef, {
            products: updatedProducts,
            updated_at: serverTimestamp(),
          });
          
          // Update product to remove new arrival flags
          await updateDoc(productDocRef, {
            is_new_arrival: false,
            new_arrivals_category_id: null,
            secondary_categories: [],
          });
        }
      }
    }

    console.log("Product update completed successfully");
    revalidateTag("global"); // Cache invalidate for all products

    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    console.log(`Starting deletion process for product ${productId}`);

    // First, get the product data to find its category and subcategory
    const productRef = doc(db, "products", productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      console.log(`Product ${productId} not found in products collection`);
      return { success: false, error: "Product not found" };
    }

    const productData = productDoc.data() as ProductType;
    const categoryId = productData.category_id;
    const subcategoryId = productData.subcategory_id;
    const isNewArrival = productData.is_new_arrival;
    const secondaryCategories = productData.secondary_categories || [];

    console.log(`Product data retrieved:`, {
      categoryId,
      subcategoryId,
      isNewArrival,
      secondaryCategories,
    });

    // Delete the product from the products collection
    await deleteDoc(productRef);
    console.log(`Product ${productId} deleted from products collection`);

    // If the product has a category, remove it from the category's products array
    if (categoryId) {
      console.log(`Removing product from category ${categoryId}`);
      const categoryRef = doc(db, "categories", categoryId);
      const categoryDoc = await getDoc(categoryRef);

      if (categoryDoc.exists()) {
        const categoryData = categoryDoc.data();
        const products = categoryData.products || [];

        // Remove the product from the category's products array
        const updatedProducts = products.filter(
          (p: any) => p.productId !== productId
        );
        console.log(
          `Category products before: ${products.length}, after: ${updatedProducts.length}`
        );

        // Update the category document
        await updateDoc(categoryRef, {
          products: updatedProducts,
          updated_at: serverTimestamp(),
        });
        console.log(`Category ${categoryId} updated successfully`);

        // If the product was in a subcategory, remove it from there too
        if (subcategoryId) {
          console.log(`Removing product from subcategory ${subcategoryId}`);
          const subcategories = categoryData.subcategories || [];
          const subcategoryIndex = subcategories.findIndex(
            (sub: any) => sub.slug === subcategoryId
          );

          if (subcategoryIndex !== -1) {
            const subcategory = subcategories[subcategoryIndex];
            const subcategoryProducts = subcategory.products || [];

            // Remove the product from the subcategory's products array
            const updatedSubcategoryProducts = subcategoryProducts.filter(
              (p: any) => p.productId !== productId
            );
            console.log(
              `Subcategory products before: ${subcategoryProducts.length}, after: ${updatedSubcategoryProducts.length}`
            );

            // Update the subcategory
            subcategories[subcategoryIndex] = {
              ...subcategory,
              products: updatedSubcategoryProducts,
            };

            // Update the category document with the modified subcategories
            await updateDoc(categoryRef, {
              subcategories,
              updated_at: serverTimestamp(),
            });
            console.log(`Subcategory ${subcategoryId} updated successfully`);
          } else {
            console.log(
              `Subcategory ${subcategoryId} not found in category ${categoryId}`
            );
          }
        }
      } else {
        console.log(`Category ${categoryId} not found`);
      }
    }

    // If the product is in new arrivals, remove it from there
    if (isNewArrival) {
      console.log("Removing product from new arrivals");
      const newArrivalsRef = doc(db, "categories", "new-arrivals");
      const newArrivalsDoc = await getDoc(newArrivalsRef);

      if (newArrivalsDoc.exists()) {
        const newArrivalsData = newArrivalsDoc.data();
        const products = newArrivalsData.products || [];

        // Remove the product from new arrivals
        const updatedProducts = products.filter(
          (p: any) => p.productId !== productId
        );
        console.log(
          `New arrivals products before: ${products.length}, after: ${updatedProducts.length}`
        );

        await updateDoc(newArrivalsRef, {
          products: updatedProducts,
          updated_at: serverTimestamp(),
        });
        console.log("New arrivals updated successfully");
      } else {
        console.log("New arrivals category not found");
      }
    }

    // Remove from any secondary categories
    for (const secondaryCategoryId of secondaryCategories) {
      console.log(
        `Removing product from secondary category ${secondaryCategoryId}`
      );
      const secondaryCategoryRef = doc(db, "categories", secondaryCategoryId);
      const secondaryCategoryDoc = await getDoc(secondaryCategoryRef);

      if (secondaryCategoryDoc.exists()) {
        const secondaryCategoryData = secondaryCategoryDoc.data();
        const products = secondaryCategoryData.products || [];

        // Remove the product from the secondary category
        const updatedProducts = products.filter(
          (p: any) => p.productId !== productId
        );
        console.log(
          `Secondary category products before: ${products.length}, after: ${updatedProducts.length}`
        );

        await updateDoc(secondaryCategoryRef, {
          products: updatedProducts,
          updated_at: serverTimestamp(),
        });
        console.log(
          `Secondary category ${secondaryCategoryId} updated successfully`
        );
      } else {
        console.log(`Secondary category ${secondaryCategoryId} not found`);
      }
    }

    console.log(`Product ${productId} deletion completed successfully`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  } finally {
    revalidateTag("global"); // Revalidate the global cache tag after deletion
  }
}