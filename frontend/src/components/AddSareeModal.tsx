"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import type { SareeCategory } from "@/lib/supabase";
import { X, UploadCloud, Loader } from "lucide-react";

interface AddSareeModalProps {
    categories: SareeCategory[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddSareeModal({
    categories,
    onClose,
    onSuccess,
}: AddSareeModalProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [fabric, setFabric] = useState("");
    const [occasion, setOccasion] = useState("");
    const [workType, setWorkType] = useState("");
    const [colorFamily, setColorFamily] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors: { name?: string; price?: string } = {};
        if (!name.trim()) {
            newErrors.name = "Name is required";
        }
        if (!price || parseFloat(price) <= 0) {
            newErrors.price = "Please enter a valid price";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            let imageUrl = null;
            setUploadError(null);

            // Upload image if selected
            if (imageFile) {
                const fileName = `${Date.now()}_${imageFile.name}`;
                console.log("Uploading image to Supabase storage:", fileName);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("saree-images")
                    .upload(fileName, imageFile);

                if (uploadError) {
                    console.error("Image upload error detail:", uploadError);
                    const errorMessage = uploadError.message || JSON.stringify(uploadError) || "Unknown upload error";
                    setUploadError(`Failed to upload image: ${errorMessage}`);
                    setLoading(false);
                    return;
                }

                console.log("Image uploaded successfully:", uploadData);
                const { data } = supabase.storage
                    .from("saree-images")
                    .getPublicUrl(fileName);
                imageUrl = data.publicUrl;
                console.log("Image public URL:", imageUrl);
            }

            // Get max display_order
            const { data: maxOrderData } = await supabase
                .from("sarees")
                .select("display_order")
                .order("display_order", { ascending: false })
                .limit(1);

            const displayOrder = maxOrderData && maxOrderData.length > 0
                ? maxOrderData[0].display_order + 1
                : 0;

            // Insert saree
            await supabase.from("sarees").insert({
                name: name.trim(),
                price: parseFloat(price),
                description: description.trim(),
                category_id: categoryId || null,
                image_url: imageUrl,
                fabric: fabric || null,
                occasion: occasion || null,
                work_type: workType || null,
                color_family: colorFamily || null,
                status: "in_stock",
                display_order: displayOrder,
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error adding saree:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal-in border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                        Add New Item
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Royal Banarasi Silk"
                            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-all placeholder-gray-400 text-gray-900"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="w-full bg-white border border-gray-300 rounded-md py-2 pl-8 pr-3 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-all placeholder-gray-400 text-gray-900 font-medium"
                            />
                        </div>
                        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief details about material, style, etc."
                            rows={3}
                            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-all resize-none placeholder-gray-400 text-gray-900"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Category
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-all text-gray-900"
                        >
                            <option value="" disabled>
                                {categories.length === 0 ? "No categories yet" : "Select a category"}
                            </option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Product Image
                        </label>
                        <div
                            className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 py-8 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all group"
                            onClick={() => document.getElementById("image-upload")?.click()}
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-contain rounded-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage();
                                        }}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-sm bg-white/90 shadow-sm hover:bg-white flex items-center justify-center border border-gray-200"
                                    >
                                        <X size={16} className="text-gray-600" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <UploadCloud size={24} className="text-gray-400 mb-2 group-hover:text-gray-600 transition-colors" />
                                    <p className="text-sm text-gray-500 font-medium">Click to upload</p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (max 5MB)</p>
                                </div>
                            )}
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                        {uploadError && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <span>⚠️</span> {uploadError}
                            </p>
                        )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Fabric */}
                        <div>
                            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Fabric
                            </label>
                            <select
                                value={fabric}
                                onChange={(e) => setFabric(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-all text-gray-900"
                            >
                                <option value="" disabled>Select fabric</option>
                                <option value="Silk">Silk</option>
                                <option value="Cotton">Cotton</option>
                                <option value="Georgette">Georgette</option>
                                <option value="Chiffon">Chiffon</option>
                                <option value="Net">Net</option>
                                <option value="Crepe">Crepe</option>
                                <option value="Linen">Linen</option>
                                <option value="Polyester">Polyester</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Work Type
                            </label>
                            <select
                                value={workType}
                                onChange={(e) => setWorkType(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-all text-gray-900"
                            >
                                <option value="" disabled>Select type</option>
                                <option value="Zari">Zari</option>
                                <option value="Embroidery">Embroidery</option>
                                <option value="Block Print">Block Print</option>
                                <option value="Hand-Painted">Hand-Painted</option>
                                <option value="Digital Print">Digital Print</option>
                                <option value="Plain">Plain</option>
                                <option value="Bandhani">Bandhani</option>
                                <option value="Ikkat">Ikkat</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            {loading ? <Loader size={16} className="animate-spin" /> : "Save Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
