"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SareeCategory } from "@/lib/supabase";
import { X, Trash2 } from "lucide-react";

interface CategoryManagerProps {
    categories: SareeCategory[];
    onClose: () => void;
    onUpdate: () => void;
}

export default function CategoryManager({
    categories,
    onClose,
    onUpdate,
}: CategoryManagerProps) {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [error, setError] = useState("");

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            return;
        }

        setError("");

        const { error: insertError } = await supabase
            .from("categories")
            .insert({ name: newCategoryName.trim() });

        if (insertError) {
            if (insertError.code === "23505") {
                setError("A category with this name already exists");
            } else {
                setError("Failed to add category");
            }
        } else {
            setNewCategoryName("");
            onUpdate();
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (
            confirm(
                "Delete this category? Sarees in this category will become uncategorized."
            )
        ) {
            await supabase.from("categories").delete().eq("id", categoryId);
            onUpdate();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAddCategory();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-modal-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <h2 className="font-display text-xl font-semibold text-burgundy-500">
                        Manage Categories
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-burgundy-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Category List */}
                <div className="px-6 pb-4">
                    {categories.length > 0 ? (
                        <div className="space-y-0">
                            {categories.map((category, index) => (
                                <div
                                    key={category.id}
                                    className={`flex items-center justify-between py-2.5 ${index !== categories.length - 1 ? "border-b border-gray-100" : ""
                                        }`}
                                >
                                    <span className="text-sm text-gray-800">{category.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic text-center py-4">
                            No categories yet. Add one below.
                        </p>
                    )}
                </div>

                {/* Add New Category */}
                <div className="px-6 pb-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => {
                                setNewCategoryName(e.target.value);
                                setError("");
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g. Silk Sarees"
                            className="flex-1 bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-300 focus:outline-none transition-all"
                        />
                        <button
                            onClick={handleAddCategory}
                            className="px-4 py-2 bg-burgundy-500 text-white rounded-lg text-sm hover:bg-burgundy-600 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-burgundy-300 text-burgundy-500 rounded-lg text-sm hover:bg-burgundy-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
