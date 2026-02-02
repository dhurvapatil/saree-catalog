const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./telegram-bot/.env" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log("Checking 'sarees' table schema...");

    // Querying information_schema is restricted, but we can try to get one record and see keys
    const { data, error } = await supabase.from("sarees").select("*").limit(1);

    if (error) {
        console.error("Error fetching saree:", error);
    } else if (data && data.length > 0) {
        console.log("Columns found in 'sarees' table:");
        console.log(Object.keys(data[0]));
    } else {
        console.log("No sarees found to check schema. Trying to fetch from categories.");
        const { data: catData } = await supabase.from("categories").select("*").limit(1);
        if (catData && catData.length > 0) {
            console.log("Columns found in 'categories' table:");
            console.log(Object.keys(catData[0]));
        }
    }

    // Try to list files in the bucket
    console.log("\n--- Files in 'saree-images' bucket ---");
    const { data: files, error: filesError } = await supabase.storage.from("saree-images").list();
    if (filesError) {
        console.error("Error listing files:", filesError);
    } else {
        console.log("Files found:", files.map(f => f.name));
    }
}

checkSchema();
