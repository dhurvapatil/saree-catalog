const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./frontend/.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing frontend Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
    console.log("Testing upload with anon key...");
    const fileName = `test_${Date.now()}.txt`;
    const fileContent = "Hello Supabase Storage";
    const { data, error } = await supabase.storage
        .from("saree-images")
        .upload(fileName, fileContent, {
            contentType: "text/plain"
        });

    if (error) {
        console.error("Upload failed with anon key:", error);
    } else {
        console.log("Upload successful with anon key!", data);
    }
}

testUpload();
