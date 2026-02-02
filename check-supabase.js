const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./telegram-bot/.env" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSupabase() {
    console.log("Checking Supabase connection...");

    // 1. Check Buckets
    console.log("\n--- Checking Buckets ---");
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
    } else {
        console.log("Buckets found:", buckets.map(b => `${b.name} (Public: ${b.public})`));
        const hasImagesBucket = buckets.find(b => b.name === "saree-images");
        if (!hasImagesBucket) {
            console.log("CRITICAL: 'saree-images' bucket is missing!");
        } else if (!hasImagesBucket.public) {
            console.log("WARNING: 'saree-images' bucket is NOT public!");
        }
    }

    // 2. Check Sarees Table
    console.log("\n--- Checking Sarees (Latest 5) ---");
    const { data: sarees, error: sareesError } = await supabase
        .from("sarees")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

    if (sareesError) {
        console.error("Error fetching sarees:", sareesError);
    } else {
        console.table(sarees.map(s => ({
            id: s.id,
            name: s.name,
            image_url: s.image_url ? (s.image_url.substring(0, 50) + "...") : "NULL",
            status: s.status
        })));
    }

    // 3. Try creating bucket if missing
    const hasImagesBucket = buckets?.find(b => b.name === "saree-images");
    if (!hasImagesBucket) {
        console.log("\n--- Attempting to create 'saree-images' bucket ---");
        const { data, error } = await supabase.storage.createBucket("saree-images", {
            public: true,
            allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
            fileSizeLimit: 5242880 // 5MB
        });
        if (error) {
            console.error("Error creating bucket:", error);
        } else {
            console.log("Bucket 'saree-images' created successfully!", data);
        }
    } else if (!hasImagesBucket.public) {
        console.log("\n--- Attempting to update 'saree-images' bucket to public ---");
        const { data, error } = await supabase.storage.updateBucket("saree-images", {
            public: true
        });
        if (error) {
            console.error("Error updating bucket:", error);
        } else {
            console.log("Bucket 'saree-images' updated to public!", data);
        }
    }
}

checkSupabase();
