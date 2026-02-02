const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchActiveCatalog() {
    try {
        // Fetch sarees with in_stock or out_of_stock status
        const { data: sarees, error: sareesError } = await supabase
            .from("sarees")
            .select("*")
            .in("status", ["in_stock", "out_of_stock"])
            .order("display_order", { ascending: true });

        if (sareesError) {
            console.error("Error fetching sarees:", sareesError);
            return [];
        }

        // Fetch categories
        const { data: categories, error: categoriesError } = await supabase
            .from("categories")
            .select("*");

        if (categoriesError) {
            console.error("Error fetching categories:", categoriesError);
        }

        // Attach category names to sarees
        const categoriesMap = new Map();
        if (categories) {
            categories.forEach((cat) => categoriesMap.set(cat.id, cat.name));
        }

        sarees.forEach((saree) => {
            if (saree.category_id && categoriesMap.has(saree.category_id)) {
                saree.categoryName = categoriesMap.get(saree.category_id);
            } else {
                saree.categoryName = "Uncategorized";
            }
        });

        return sarees || [];
    } catch (error) {
        console.error("Error in fetchActiveCatalog:", error);
        return [];
    }
}

module.exports = fetchActiveCatalog;
