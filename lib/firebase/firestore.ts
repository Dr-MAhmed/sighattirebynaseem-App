"use server";
import type { ProductType } from "@/types/product";
import type { CategoryType, SubCategoryType } from "@/types/category";
import { db } from "./config";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { unstable_cache } from "next/cache";

// Helper function to convert Firestore document to ProductType
const convertToProductType = (doc: any): ProductType => {
  const data = typeof doc.data === "function" ? doc.data() : doc;
  function toISOStringSafe(val: any) {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (val instanceof Date) return val.toISOString();
    if (val.toDate && typeof val.toDate === "function") return val.toDate().toISOString();
    if (typeof val.seconds === "number" && typeof val.nanoseconds === "number") {
      return new Date(val.seconds * 1000 + Math.floor(val.nanoseconds / 1e6)).toISOString();
    }
    return "";
  }
  
  // Handle sale_price properly - only set if it's a valid number greater than 0
  const salePrice = data.sale_price;
  const validSalePrice = (typeof salePrice === 'number' && salePrice > 0) ? salePrice : undefined;
  
  return {
    productId: doc.id || data.productId || "",
    name: data.name || "",
    slug: data.slug || "",
    price: data.price || 0,
    sale_price: validSalePrice,
    description: data.description,
    images: data.images || [],
    avg_rating: data.avg_rating,
    review_count: data.review_count,
    attributes: data.attributes || {},
    variants: data.variants || [],
    has_variants: data.has_variants || false,
    stock_quantity: data.stock_quantity,
    category_id: data.category_id,
    is_featured: data.is_featured || false,
    is_active: data.is_active ?? true,
    is_new_arrival: data.is_new_arrival || false,
    is_best_seller: data.is_best_seller || false,
    has_hijab: data.has_hijab || false,
    sku: data.sku,
    sales_count: data.sales_count,
    created_at: toISOStringSafe(data.created_at),
    updated_at: toISOStringSafe(data.updated_at),
    is_exclusive_discount: data.is_exclusive_discount || false,
    save_percent: data.save_percent,
    discount_expiry: toISOStringSafe(data.discount_expiry),
  };
};

const convertToCategoryType = (doc: any): CategoryType => {
  const data = doc.data();
  return {
    categoryId: doc.id,
    name: data.name || "",
    slug: data.slug || "",
    description: data.description,
    image: data.image,
    isActive: data.isActive ?? true,
    subcategories: data.subcategories || [],
  };
};

export const getFeaturedProducts = unstable_cache(
  async (limitCount = 4): Promise<ProductType[]> => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("is_featured", "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToProductType).slice(0, limitCount);
  },
  undefined,
  { revalidate: 24 * 60 * 60, tags: ["global"] }
);

export const getNewArrivals = unstable_cache(
  async (limitCount = 4): Promise<ProductType[]> => {
    const productsRef = collection(db, "products");

    // Create two queries - one for category_id and one for is_new_arrival
    const categoryQuery = query(
      productsRef,
      where("category_id", "==", "new-arrivals"),
      where("is_active", "==", true)
    );

    const newArrivalQuery = query(
      productsRef,
      where("is_new_arrival", "==", true),
      where("is_active", "==", true)
    );

    // Execute both queries
    const [categorySnapshot, newArrivalSnapshot] = await Promise.all([
      getDocs(categoryQuery),
      getDocs(newArrivalQuery),
    ]);

    // Combine results and remove duplicates
    const allProducts = new Set();
    const products: ProductType[] = [];

    // Add products from category query
    categorySnapshot.docs.forEach((doc) => {
      const product = convertToProductType(doc);
      if (!allProducts.has(product.productId)) {
        allProducts.add(product.productId);
        products.push(product);
      }
    });

    // Add products from new arrival query
    newArrivalSnapshot.docs.forEach((doc) => {
      const product = convertToProductType(doc);
      if (!allProducts.has(product.productId)) {
        allProducts.add(product.productId);
        products.push(product);
      }
    });

    return products.slice(0, limitCount);
  },
  undefined,
  { revalidate: 24 * 60 * 60, tags: ["global"] }
);

export const getBestSellers = unstable_cache(
  async (limitCount = 4): Promise<ProductType[]> => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("is_best_seller", "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToProductType).slice(0, limitCount);
  },
  undefined,
  { revalidate: 24 * 60 * 60, tags: ["global"] }
);

export const getProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductType | null> => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return convertToProductType(querySnapshot.docs[0]);
    }
    return null;
  },
  undefined,
  { revalidate: 24 * 60 * 60, tags: ["global"] }
);

export const getProductsByCategory = async (
  categorySlug: string,
  limitCount = 20,
  refresh = false
): Promise<ProductType[]> => {
  try {
    console.log("getProductsByCategory: Starting with slug:", categorySlug);

    // Normalize the slug using the same logic as getCategoryBySlug
    let normalizedSlug = categorySlug;
    if (categorySlug === "abaya") normalizedSlug = "abayas";
    if (categorySlug === "hijab") normalizedSlug = "hijabs";
    if (categorySlug === "essential") normalizedSlug = "essentials";
    if (categorySlug === "dress") normalizedSlug = "dresses";
    if (categorySlug === "irani") normalizedSlug = "irani-chadar";
    if (categorySlug === "chadar" || categorySlug === "chador")
      normalizedSlug = "irani-chadar";
    if (categorySlug === "prayer" || categorySlug === "namaz")
      normalizedSlug = "prayer-namaz-chadar";
    if (categorySlug === "maxi" || categorySlug === "modest")
      normalizedSlug = "modest-maxi-dresses";

    console.log("getProductsByCategory: Normalized slug:", normalizedSlug);

    // First, find the category by slug
    const categoriesRef = collection(db, "categories");
    const categoryQuery = query(
      categoriesRef,
      where("slug", "==", normalizedSlug)
    );
    console.log("getProductsByCategory: Executing category query...");
    const categorySnapshot = await getDocs(categoryQuery);

    if (categorySnapshot.empty) {
      console.warn(
        `getProductsByCategory: Category "${normalizedSlug}" not found`
      );
      return [];
    }

    // Get the category document
    const categoryDoc = categorySnapshot.docs[0];
    const categoryId = categoryDoc.id;
    console.log("getProductsByCategory: Found category ID:", categoryId);

    // Get products from the products collection with matching category_id
    const productsRef = collection(db, "products");
    const productsQuery = query(
      productsRef,
      where("category_id", "==", categoryId),
      where("is_active", "==", true)
    );
    console.log("getProductsByCategory: Executing products query...");
    const productsSnapshot = await getDocs(productsQuery);

    if (productsSnapshot.empty) {
      console.warn(
        `getProductsByCategory: No products found for category "${normalizedSlug}"`
      );
      return [];
    }

    console.log(
      `getProductsByCategory: Found ${productsSnapshot.size} products`
    );

    // Convert products and remove duplicates using a Map with trimmed product name as key
    const productMap = new Map();
    productsSnapshot.docs.forEach((doc) => {
      const product = convertToProductType(doc);
      if (!productMap.has(product.name.trim())) {
        productMap.set(product.name.trim(), product);
      }
    });

    const uniqueProducts = Array.from(productMap.values());
    console.log(
      "getProductsByCategory: Converted and deduplicated products:",
      uniqueProducts.length
    );

    return uniqueProducts.slice(0, limitCount);
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    throw error; // Re-throw the error to handle it in the component
  }
};

export const getAllProducts = unstable_cache(
  async (limitCount = 100): Promise<ProductType[]> => {
    try {
      console.log("Fetching all products...");
      const productsRef = collection(db, "products");
      const querySnapshot = await getDocs(productsRef);

      if (!querySnapshot || querySnapshot.empty) {
        console.log("No products found");
        return [];
      }

      const products = querySnapshot.docs
        .map((doc) => {
          try {
            return convertToProductType(doc);
          } catch (error) {
            console.error(`Error converting product ${doc.id}:`, error);
            return null;
          }
        })
        .filter((product): product is ProductType => product !== null);

      console.log(`Successfully fetched ${products.length} products`);
      return products.slice(0, limitCount);
    } catch (error) {
      console.error("Error fetching all products:", error);
      // Return empty array instead of throwing to prevent server errors
      return [];
    }
  },
  undefined,
  { revalidate: 60, tags: ["global", "products"] } // Cache for 1 minute temporarily
);

export const getCategories = unstable_cache(
  async (): Promise<CategoryType[]> => {
    const categoriesRef = collection(db, "categories");
    const querySnapshot = await getDocs(categoriesRef);
    const data = await Promise.all(
      querySnapshot.docs.map(convertToCategoryType)
    );
    return data;
  },
  undefined,
  { revalidate: 24 * 60 * 60, tags: ["global"] }
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<CategoryType | null> => {
    try {
      console.log(`getCategoryBySlug: Processing slug "${slug}"`);

      // Normalize the slug to handle variations (singular/plural)
      let normalizedSlug = slug;

      // Handle common variations (singular/plural forms)
      if (slug === "abaya") normalizedSlug = "abayas";
      if (slug === "hijab") normalizedSlug = "hijabs";
      if (slug === "essential") normalizedSlug = "essentials";
      if (slug === "dress") normalizedSlug = "dresses";
      if (slug === "irani") normalizedSlug = "irani-chadar";
      if (slug === "chadar" || slug === "chador")
        normalizedSlug = "irani-chadar";
      if (slug === "prayer" || slug === "namaz")
        normalizedSlug = "prayer-namaz-chadar";
      if (slug === "maxi" || slug === "modest")
        normalizedSlug = "modest-maxi-dresses";

      console.log(
        `getCategoryBySlug: Normalized slug "${slug}" to "${normalizedSlug}"`
      );

      // Define common category structures
      const defaultCategories: Record<
        string,
        Omit<CategoryType, "categoryId">
      > = {
        hijabs: {
          name: "Hijabs",
          slug: "hijabs",
          description: "Our collection of beautiful hijabs",
          isActive: true,
          subcategories: [],
          products: [],
        },
        abayas: {
          name: "Abayas",
          slug: "abayas",
          description: "Our collection of elegant abayas",
          isActive: true,
          subcategories: [
            { name: "Casual / Daily Wear", slug: "casual-daily-wear" },
            { name: "Formal", slug: "formal" },
            { name: "Occasion / Wedding", slug: "occasion-wedding" },
            { name: "Umrah & Eid", slug: "umrah-eid" },
            { name: "Calligraphy", slug: "calligraphy" },
          ],
          products: [],
        },
        essentials: {
          name: "Essentials",
          slug: "essentials",
          description: "Essential items for your wardrobe",
          isActive: true,
          subcategories: [],
          products: [],
        },
        "irani-chadar": {
          name: "Irani Chadar",
          slug: "irani-chadar",
          description: "Beautiful Irani Chadar collection",
          isActive: true,
          subcategories: [],
          products: [],
        },
        "prayer-namaz-chadar": {
          name: "Prayer / Namaz Chadar",
          slug: "prayer-namaz-chadar",
          description: "Prayer and Namaz Chadar collection",
          isActive: true,
          subcategories: [],
          products: [],
        },
        "modest-maxi-dresses": {
          name: "Modest Maxi & Dresses",
          slug: "modest-maxi-dresses",
          description: "Modest maxi dress collection",
          isActive: true,
          subcategories: [
            { name: "Casual", slug: "casual" },
            { name: "Formal", slug: "formal" },
          ],
          products: [],
        },
      };

      // Handle categories that might be missing from database
      if (defaultCategories[normalizedSlug]) {
        console.log(
          `getCategoryBySlug: Found "${normalizedSlug}" in defaultCategories`
        );

        // Try to find the category first
        const categoriesRef = collection(db, "categories");
        const q = query(categoriesRef, where("slug", "==", normalizedSlug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log(
            `getCategoryBySlug: Category "${normalizedSlug}" not found in database, creating it`
          );
          // Category doesn't exist in database, create it
          const defaultCategory = defaultCategories[normalizedSlug];
          const docRef = await addDoc(collection(db, "categories"), {
            ...defaultCategory,
            created_at: new Date(),
            updated_at: new Date(),
          });

          console.log(
            `getCategoryBySlug: Created category with ID "${docRef.id}"`
          );

          // Return the newly created category
          return {
            categoryId: docRef.id,
            ...defaultCategory,
          };
        } else {
          console.log(
            `getCategoryBySlug: Category "${normalizedSlug}" found in database`
          );
          const categoryDoc = querySnapshot.docs[0];
          const categoryData = categoryDoc.data();
          return {
            categoryId: categoryDoc.id,
            name: categoryData.name || "",
            slug: categoryData.slug || "",
            description: categoryData.description,
            image: categoryData.image,
            isActive: categoryData.isActive ?? true,
            subcategories: categoryData.subcategories || [],
            products: categoryData.products || [],
          };
        }
      } else {
        console.log(
          `getCategoryBySlug: "${normalizedSlug}" not found in defaultCategories, checking database`
        );
      }

      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, where("slug", "==", normalizedSlug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const categoryDoc = querySnapshot.docs[0];
        const categoryData = categoryDoc.data();
        return {
          categoryId: categoryDoc.id,
          name: categoryData.name || "",
          slug: categoryData.slug || "",
          description: categoryData.description,
          image: categoryData.image,
          isActive: categoryData.isActive ?? true,
          subcategories: categoryData.subcategories || [],
          products: categoryData.products || [],
        };
      }

      // If not found, try fetching from categories array with manual lookup
      // This ensures that hardcoded categories also work
      console.log(
        `Category with slug '${normalizedSlug}' not found in database, checking hardcoded categories.`
      );

      // Get all categories in case it's not in the database
      const allCategoriesSnapshot = await getDocs(categoriesRef);
      const allCategories = allCategoriesSnapshot.docs.map((doc) => ({
        categoryId: doc.id,
        ...(doc.data() as any),
      }));

      // Look for matching category
      const category = allCategories.find(
        (cat: any) => cat.slug?.toLowerCase() === normalizedSlug.toLowerCase()
      );

      if (category) {
        return {
          categoryId: category.categoryId,
          name: category.name || "",
          slug: category.slug || "",
          description: category.description,
          image: category.image,
          isActive: category.isActive ?? true,
          subcategories: category.subcategories || [],
          products: category.products || [],
        };
      }

      // If category is still not found, create a default one for common categories
      if (defaultCategories[normalizedSlug]) {
        console.log(
          `getCategoryBySlug: Creating default ${normalizedSlug} category as fallback`
        );
        // Create the category in the database
        const defaultCategory = defaultCategories[normalizedSlug];
        const docRef = await addDoc(collection(db, "categories"), {
          ...defaultCategory,
          created_at: new Date(),
          updated_at: new Date(),
        });

        console.log(
          `getCategoryBySlug: Created fallback category with ID "${docRef.id}"`
        );

        return {
          categoryId: docRef.id,
          ...defaultCategory,
        };
      }

      console.log(
        `getCategoryBySlug: No category found for "${slug}" / "${normalizedSlug}"`
      );
      return null;
    } catch (error) {
      console.error(`Error fetching category by slug '${slug}':`, error);
      return null;
    }
  },
  undefined,
  { revalidate: 24 * 60 * 60, tags: ["global"] }
);
export const addNewsletterSubscription = async (email: string) => {
  const newsletterRef = collection(db, "newsletter_subscriptions");
  await addDoc(newsletterRef, {
    email,
    subscribed_at: new Date(),
  });
  return true;
};

export const addCustomRequest = async (requestData: {
  user_id: string;
  contact_email: string;
  contact_phone: string;
  request_details: string;
  attached_files?: string[];
}) => {
  const requestsRef = collection(db, "custom_requests");
  await addDoc(requestsRef, {
    ...requestData,
    status: "pending",
    created_at: new Date(),
  });
  return true;
};

export const searchProducts = async (
  queryStr: string,
  limitCount = 20
): Promise<ProductType[]> => {
  const productsRef = collection(db, "products");
  const querySnapshot = await getDocs(productsRef);
  const products = querySnapshot.docs.map(convertToProductType);
  const searchResults = products.filter(
    (product) =>
      product.name.toLowerCase().includes(queryStr.toLowerCase()) ||
      product.description?.toLowerCase().includes(queryStr.toLowerCase())
  );
  return searchResults.slice(0, limitCount);
};

export const addCategory = async (
  category: Omit<CategoryType, "categoryId">
): Promise<string> => {
  const categoriesRef = collection(db, "categories");
  const docRef = await addDoc(categoriesRef, {
    ...category,
    created_at: new Date(),
    updated_at: new Date(),
  });
  return docRef.id;
};

export const updateCategory = async (
  categoryId: string,
  category: Partial<CategoryType>
): Promise<void> => {
  const categoryRef = doc(db, "categories", categoryId);
  await updateDoc(categoryRef, {
    ...category,
    updated_at: new Date(),
  });
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const categoryRef = doc(db, "categories", categoryId);
  await deleteDoc(categoryRef);
};

export const addSubCategory = async (
  categoryId: string,
  subcategory: SubCategoryType
): Promise<void> => {
  const categoryRef = doc(db, "categories", categoryId);
  const category = await getCategoryBySlug(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  const updatedSubcategories = [...(category.subcategories || []), subcategory];

  await updateDoc(categoryRef, {
    subcategories: updatedSubcategories,
    updated_at: new Date(),
  });
};

export const updateSubCategory = async (
  categoryId: string,
  subcategorySlug: string,
  updatedSubcategory: Partial<SubCategoryType>
): Promise<void> => {
  const categoryRef = doc(db, "categories", categoryId);
  const category = await getCategoryBySlug(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  const updatedSubcategories = (category.subcategories || []).map((subcat) =>
    subcat.slug === subcategorySlug
      ? { ...subcat, ...updatedSubcategory }
      : subcat
  );

  await updateDoc(categoryRef, {
    subcategories: updatedSubcategories,
    updated_at: new Date(),
  });
};

export const deleteSubCategory = async (
  categoryId: string,
  subcategorySlug: string
): Promise<void> => {
  const categoryRef = doc(db, "categories", categoryId);
  const category = await getCategoryBySlug(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  const updatedSubcategories = (category.subcategories || []).filter(
    (subcat) => subcat.slug !== subcategorySlug
  );

  await updateDoc(categoryRef, {
    subcategories: updatedSubcategories,
    updated_at: new Date(),
  });
};

export const getProductsBySubCategory = async (
  categorySlug: string,
  subcategorySlug: string,
  limitCount = 20
): Promise<ProductType[]> => {
  try {
    console.log(
      `getProductsBySubCategory: Getting products for category "${categorySlug}" and subcategory "${subcategorySlug}"`
    );

    // Normalize the category slug
    let normalizedCategorySlug = categorySlug;
    if (categorySlug === "abaya") normalizedCategorySlug = "abayas";
    if (categorySlug === "hijab") normalizedCategorySlug = "hijabs";
    if (categorySlug === "essential") normalizedCategorySlug = "essentials";
    if (categorySlug === "dress") normalizedCategorySlug = "dresses";
    if (categorySlug === "irani") normalizedCategorySlug = "irani-chadar";
    if (categorySlug === "chadar" || categorySlug === "chador")
      normalizedCategorySlug = "irani-chadar";
    if (categorySlug === "prayer" || categorySlug === "namaz")
      normalizedCategorySlug = "prayer-namaz-chadar";
    if (categorySlug === "maxi" || categorySlug === "modest")
      normalizedCategorySlug = "modest-maxi-dresses";

    // Normalize subcategory slug
    let normalizedSubcategorySlug = subcategorySlug;
    // Replace spaces with hyphens and handle special characters
    normalizedSubcategorySlug = normalizedSubcategorySlug
      .replace(/\s+/g, "-")
      .replace(/&/g, "-");

    // Handle special subcategory cases for abayas category
    if (normalizedCategorySlug === "abayas") {
      // Special case: "umrah & eid" may appear as "umrah-eid" in URL
      if (
        subcategorySlug === "umrah-eid" ||
        subcategorySlug === "umrah-&-eid" ||
        subcategorySlug === "umrah & eid"
      ) {
        normalizedSubcategorySlug = "umrah-eid";
      }
    }

    console.log(
      `getProductsBySubCategory: Normalized category slug "${categorySlug}" to "${normalizedCategorySlug}"`
    );
    console.log(
      `getProductsBySubCategory: Normalized subcategory slug "${subcategorySlug}" to "${normalizedSubcategorySlug}"`
    );

    // First, find the category by slug
    const categoriesRef = collection(db, "categories");
    const categoryQuery = query(
      categoriesRef,
      where("slug", "==", normalizedCategorySlug)
    );
    const categorySnapshot = await getDocs(categoryQuery);

    if (categorySnapshot.empty) {
      console.log(
        `getProductsBySubCategory: Category "${normalizedCategorySlug}" not found`
      );
      return [];
    }

    // Get the category document and find the subcategory
    const categoryDoc = categorySnapshot.docs[0];
    const categoryData = categoryDoc.data();
    const subcategories = categoryData.subcategories || [];

    console.log(
      `getProductsBySubCategory: Found category "${categoryData.name}" with ${subcategories.length} subcategories`
    );

    // Debug all subcategories
    if (subcategories.length > 0) {
      console.log(
        `Available subcategories: ${JSON.stringify(
          subcategories.map((s: any) => s.slug)
        )}`
      );
    }

    // Try to find subcategory with exact match first
    let subcategory = subcategories.find(
      (sub: any) => sub.slug === subcategorySlug
    );

    // If not found by exact match, try with normalized slug
    if (!subcategory) {
      subcategory = subcategories.find((sub: any) => {
        // Normalize the subcategory slug from database
        const normDbSlug = sub.slug
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/&/g, "-");
        return normDbSlug === normalizedSubcategorySlug;
      });
    }

    // If still not found, try a loose match
    if (!subcategory) {
      subcategory = subcategories.find((sub: any) => {
        const normDbSlug = sub.slug
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/&/g, "-");
        const normUrlSlug = normalizedSubcategorySlug.toLowerCase();
        return (
          normDbSlug.includes(normUrlSlug) || normUrlSlug.includes(normDbSlug)
        );
      });
    }

    if (!subcategory) {
      console.log(
        `getProductsBySubCategory: Subcategory "${subcategorySlug}" not found in category "${normalizedCategorySlug}"`
      );

      // Try checking products collection anyway
      console.log(
        `getProductsBySubCategory: Trying products collection directly`
      );

      const productsRef = collection(db, "products");
      const productsQuery = query(
        productsRef,
        where("category_id", "==", categoryDoc.id)
      );
      const productsSnapshot = await getDocs(productsQuery);

      if (!productsSnapshot.empty) {
        // Filter products with the matching subcategory_id
        const allProducts = productsSnapshot.docs.map(convertToProductType);
        const matchingProducts = allProducts.filter((product) => {
          if (!product.subcategory_id) return false;

          // Normalize product's subcategory_id for comparison
          const normProductSubcat = product.subcategory_id
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/&/g, "-");
          return normProductSubcat === normalizedSubcategorySlug;
        });

        if (matchingProducts.length > 0) {
          console.log(
            `getProductsBySubCategory: Found ${matchingProducts.length} products by category_id and subcategory_id through direct collection query`
          );
          return matchingProducts.slice(0, limitCount);
        }
      }

      return [];
    }

    // First try to get products from the subcategory array
    const subcategoryProducts = subcategory.products || [];

    if (subcategoryProducts.length > 0) {
      console.log(
        `getProductsBySubCategory: Found ${subcategoryProducts.length} products in subcategory "${subcategory.slug}"`
      );
      return subcategoryProducts
        .map(convertToProductType)
        .slice(0, limitCount);
    }

    // If no products found in subcategory array, try to find products in the products collection
    console.log(
      `getProductsBySubCategory: No products in subcategory array, checking products collection`
    );

    const productsRef = collection(db, "products");
    // Try with both the original subcategory slug and the normalized one
    const productsQueries = [
      query(
        productsRef,
        where("category_id", "==", categoryDoc.id),
        where("subcategory_id", "==", subcategory.slug)
      ),
      query(
        productsRef,
        where("category_id", "==", categoryDoc.id),
        where("subcategory_id", "==", normalizedSubcategorySlug)
      ),
      query(
        productsRef,
        where("category_id", "==", categoryDoc.id),
        where("subcategory_id", "==", subcategorySlug)
      ),
    ];

    let productResults: ProductType[] = [];

    // Try all queries
    for (const productsQuery of productsQueries) {
      const productsSnapshot = await getDocs(productsQuery);

      if (!productsSnapshot.empty) {
        productResults = productsSnapshot.docs.map(convertToProductType);
        console.log(
          `getProductsBySubCategory: Found ${productResults.length} products by category_id and subcategory_id`
        );
        break; // Stop once we find products
      }
    }

    if (productResults.length > 0) {
      return productResults.slice(0, limitCount);
    }

    console.log(
      `getProductsBySubCategory: No products found for subcategory "${subcategory.slug}"`
    );
    return [];
  } catch (error) {
    console.error(
      `Error fetching products by subcategory: category=${categorySlug}, subcategory=${subcategorySlug}`,
      error
    );
    return [];
  }
};
