export interface SubCategoryType {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  products?: any[];
}

export interface CategoryType {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  parentCategory?: string;
  subcategories?: SubCategoryType[];
  products?: any[];
}
