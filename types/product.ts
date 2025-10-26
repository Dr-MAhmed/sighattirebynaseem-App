export interface ProductImage {
  url: string;
  alt_text?: string;
  is_default?: boolean;
  file?: File; // For temporary file storage during upload
}

export interface ProductVariant {
  id: string;
  attributes: Record<string, string>; // e.g., { "color": "Red", "size": "XL" }
  price?: number; // Override main product price
  sale_price?: number;
  stock_quantity?: number;
  sku?: string;
}

export interface ProductAttributes {
  [key: string]: string[];
}

export interface ProductType {
  productId?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  category_id: string;
  category?: string;
  category_slug?: string;
  subcategory_id?: string;
  subcategory?: string;
  subcategory_slug?: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  has_hijab: boolean; // New field for hijab included status
  sku?: string;
  images: ProductImage[];
  attributes: Record<string, string[]>;
  variants: ProductVariant[];
  has_variants: boolean;
  created_at?: any;
  updated_at?: any;
  secondary_categories?: string[];
  new_arrivals_category_id?: string;
  avg_rating?: number;
  review_count?: number;
  custom_color_input?: string;
  is_best_seller?: boolean;
  sales_count?: number; // Total sales count for the product
  is_exclusive_discount?: boolean; // For exclusive discount label/feature
  save_percent?: number | null; // For Save xyz % label
  discount_expiry?: string; // ISO string for discount/label expiry date and time
}

export interface ReviewType {
  id: string;
  product_id: string;
  user_id?: string; // Made optional since login won't be required
  user_name: string;
  rating: number;
  comment: string;
  review_image?: string; // New field for review image
  created_at: Date;
  updated_at: Date;
}
