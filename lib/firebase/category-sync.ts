import { addCategory, updateCategory, getCategoryBySlug } from "./firestore";

/**
 * Categories data from the site header
 * This serves as a single source of truth for categories
 */
export const categoriesData = [
  {
    categoryId: "new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    isActive: true,
    description: "Our latest collection of new arrivals",
  },
  {
    categoryId: "abayas",
    name: "Abayas",
    slug: "abayas",
    isActive: true,
    description: "Our collection of elegant abayas",
    subcategories: [
      { name: "Casual / Daily Wear", slug: "casual-daily-wear" },
      { name: "Formal", slug: "formal" },
      { name: "Occasion / Wedding", slug: "occasion-wedding" },
      { name: "Umrah & Eid", slug: "umrah-eid" },
      { name: "Calligraphy", slug: "calligraphy" },
    ],
  },
  {
    categoryId: "modest-maxi-dresses",
    name: "Modest Maxi & Dresses",
    slug: "modest-maxi-dresses",
    isActive: true,
    description: "Modest maxi dress collection",
    subcategories: [
      { name: "Casual", slug: "casual" },
      { name: "Formal", slug: "formal" },
    ],
  },
  {
    categoryId: "prayer-namaz-chadar",
    name: "Prayer / Namaz Chadar",
    slug: "prayer-namaz-chadar",
    isActive: true,
    description: "Prayer and Namaz Chadar collection",
  },
  {
    categoryId: "irani-chadar",
    name: "Irani Chadar",
    slug: "irani-chadar",
    isActive: true,
    description: "Beautiful Irani Chadar collection",
  },
  {
    categoryId: "hijabs",
    name: "Hijabs",
    slug: "hijabs",
    isActive: true,
    description: "Our collection of beautiful hijabs",
  },
  {
    categoryId: "essentials",
    name: "Essentials",
    slug: "essentials",
    isActive: true,
    description: "Essential items for your wardrobe",
  },
];

/**
 * Syncs the categories data to Firestore
 * Will create new categories if they don't exist or update existing ones
 */
export const syncCategoriesToFirestore = async (): Promise<void> => {
  try {
    console.log("Starting to sync categories to Firestore...");

    for (const category of categoriesData) {
      // Check if the category already exists
      const existingCategory = await getCategoryBySlug(category.slug);

      if (existingCategory) {
        console.log(`Updating existing category: ${category.name}`);
        // Update the existing category
        await updateCategory(existingCategory.categoryId, {
          name: category.name,
          slug: category.slug,
          isActive: category.isActive,
          description: category.description,
          subcategories: category.subcategories || [],
        });
      } else {
        console.log(`Adding new category: ${category.name}`);
        // Add as a new category
        const categoryId = await addCategory({
          name: category.name,
          slug: category.slug,
          isActive: category.isActive,
          description: category.description || `${category.name} collection`,
          subcategories: category.subcategories || [],
          products: [],
        });
        console.log(`Added category with ID: ${categoryId}`);
      }
    }

    console.log("Categories sync completed successfully");
  } catch (error) {
    console.error("Error syncing categories to Firestore:", error);
  }
};

/**
 * Run sync categories from client-side code
 * Can be called from admin dashboard or during setup
 */
export const runCategorySync = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await syncCategoriesToFirestore();
    return { success: true, message: "Categories successfully synchronized" };
  } catch (error) {
    console.error("Error running category sync:", error);
    return {
      success: false,
      message: `Failed to sync categories: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};
