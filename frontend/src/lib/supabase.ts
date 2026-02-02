import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SareeCategory {
    id: string;
    name: string;
    created_at: string;
}

export interface Saree {
    id: string;
    name: string;
    price: number;
    description: string;
    category_id: string | null;
    category?: SareeCategory;
    image_url: string | null;
    fabric: string | null;
    occasion: string | null;
    work_type: string | null;
    color_family: string | null;
    status: "in_stock" | "out_of_stock" | "removed";
    display_order: number;
    created_at: string;
    updated_at: string;
}
