"use client";

import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { supabase } from "@/lib/supabase";
import type { Saree, SareeCategory } from "@/lib/supabase";
import SareeCard from "./SareeCard";
import { Inbox } from "lucide-react";

interface CatalogGridProps {
    sarees: Saree[];
    statusFilter: "all" | "in_stock" | "out_of_stock";
    categoryFilter: string;
    categories: SareeCategory[];
    onStatusChange: (sareeId: string, newStatus: string) => void;
    onDelete: (sareeId: string) => void;
    onEdit: (saree: Saree) => void;
}

export default function CatalogGrid({
    sarees,
    statusFilter,
    categoryFilter,
    categories,
    onStatusChange,
    onDelete,
    onEdit,
}: CatalogGridProps) {
    // Filter sarees
    let filteredSarees = sarees.filter((s) => s.status !== "removed");

    if (statusFilter !== "all") {
        filteredSarees = filteredSarees.filter((s) => s.status === statusFilter);
    }

    if (categoryFilter !== "all") {
        filteredSarees = filteredSarees.filter((s) => s.category_id === categoryFilter);
    }

    const [items, setItems] = useState(filteredSarees);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);

            // Update display_order in database
            for (let i = 0; i < newItems.length; i++) {
                await supabase
                    .from("sarees")
                    .update({ display_order: i })
                    .eq("id", newItems[i].id);
            }
        }
    };

    // Update items when filters change
    if (JSON.stringify(filteredSarees.map(s => s.id)) !== JSON.stringify(items.map(s => s.id))) {
        setItems(filteredSarees);
    }

    if (filteredSarees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Inbox size={64} className="text-burgundy-300 mb-4" />
                <h3 className="font-display text-xl text-burgundy-500 mb-2">No sarees found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters or add a new saree</p>
            </div>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((s) => s.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl mx-auto">
                    {items.map((saree, index) => (
                        <div
                            key={saree.id}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 60}ms` }}
                        >
                            <SareeCard
                                saree={saree}
                                categories={categories}
                                onStatusChange={onStatusChange}
                                onDelete={onDelete}
                                onEdit={onEdit}
                            />
                        </div>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
