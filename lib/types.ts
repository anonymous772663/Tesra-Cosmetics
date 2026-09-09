export type ProductCategory =
  | "lashes"
  | "concealer"
  | "lip_liner"
  | "eye_liner"
  | "blender"
  | "lash_glue";

export interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  images: string[];
  shades: string[] | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  role: "customer" | "admin";
  profile_completed: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  shade?: string;
}

export interface SiteSettings {
  id: string;
  primary_color: string;
  accent_color: string;
  announcement_banner: string | null;
  hero_heading: string;
  hero_subheading: string;
}

// Minimal Supabase Database typing (extend with generated types in production
// via `supabase gen types typescript` once the project is linked).
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at">;
        Update: Partial<Omit<Product, "id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "created_at">>;
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Omit<SiteSettings, "id">;
        Update: Partial<Omit<SiteSettings, "id">>;
      };
    };
  };
}
