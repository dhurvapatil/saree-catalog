const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./frontend/.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
    // Try checking the other .env file if local is missing service key
    require("dotenv").config({ path: "./telegram-bot/.env" });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Could not find SUPABASE_SERVICE_ROLE_KEY in either env file.");
        process.exit(1);
    }
}

// Re-init with service key for admin rights
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || serviceRoleKey);

async function setupPdfBucket() {
    console.log("Checking/Creating 'catalog-pdfs' bucket...");

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }

    const bucketExists = buckets.find(b => b.name === 'catalog-pdfs');

    if (bucketExists) {
        console.log("'catalog-pdfs' bucket already exists.");

        // Ensure it is public - updated method
        const { error: updateError } = await supabase.storage.updateBucket('catalog-pdfs', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['application/pdf']
        });

        if (updateError) {
            console.error("Error updating bucket to public:", updateError);
        } else {
            console.log("Bucket config updated: Public=true");
        }

    } else {
        const { data, error } = await supabase.storage.createBucket('catalog-pdfs', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['application/pdf']
        });

        if (error) {
            console.error("Error creating bucket:", error);
        } else {
            console.log("Successfully created 'catalog-pdfs' bucket.");
        }
    }
}

setupPdfBucket();
