"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Saree, SareeCategory } from "@/lib/supabase";
import { Camera, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

interface SareeCardProps {
    saree: Saree;
    categories: SareeCategory[];
    onStatusChange: (sareeId: string, newStatus: string) => void;
    onDelete: (sareeId: string) => void;
    onEdit: (saree: Saree) => void;
}

export default function SareeCard({
    saree,
    categories,
    onStatusChange,
    onDelete,
    onEdit,
}: SareeCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: saree.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const categoryName = categories.find((c) => c.id === saree.category_id)?.name || "Uncategorized";

    const handleDeleteClick = () => {
        if (confirm("Are you sure you want to delete this saree? This cannot be undone.")) {
            onDelete(saree.id);
        }
    };

    const getStatusBadge = () => {
        switch (saree.status) {
            case "in_stock":
                return (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-wide">
                        In Stock
                    </span>
                );
            case "out_of_stock":
                return (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-gray-500 text-white text-[10px] font-semibold uppercase tracking-wide">
                        Out of Stock
                    </span>
                );
            case "removed":
                return (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-100 text-red-500 text-[10px] font-semibold uppercase tracking-wide line-through">
                        Removed
                    </span>
                );
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-grab active:cursor-grabbing flex flex-col sm:flex-row ${isDragging ? "opacity-60 shadow-lg" : ""
                }`}
        >
            {/* Image Area */}
            <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden group bg-gray-100 border-r border-gray-100">
                {saree.image_url ? (
                    <Image
                        src={saree.image_url}
                        alt={saree.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Camera size={24} className="mb-1" />
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}

                {/* Status Badge */}
                {getStatusBadge()}

                {/* Action Icons */}
                <div className="absolute top-2 left-2 flex gap-1.5 sm:flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(saree);
                        }}
                        className="w-7 h-7 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center transition-colors text-gray-700"
                    >
                        <Pencil size={12} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick();
                        }}
                        className="w-7 h-7 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors text-gray-700"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 mr-2">
                            {saree.name}
                        </h3>
                        <div className="flex flex-col items-end">
                            <span className="text-lg font-bold text-gray-900">
                                ₹{Math.floor(saree.price).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                    {saree.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                            {saree.description}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {categoryName && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded text-[10px] font-semibold uppercase tracking-wider">
                                {categoryName}
                            </span>
                        )}
                        {saree.fabric && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded text-[10px] font-semibold">
                                {saree.fabric}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100">
                    <select
                        value={saree.status}
                        onChange={(e) => {
                            e.stopPropagation();
                            onStatusChange(saree.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white border border-gray-300 rounded-md py-1.5 px-2 text-xs font-medium text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 focus:outline-none transition-all cursor-pointer hover:border-gray-400"
                    >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="removed">Removed</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
