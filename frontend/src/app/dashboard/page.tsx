"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import type { Saree, SareeCategory } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import CatalogGrid from "@/components/CatalogGrid";
import AddSareeModal from "@/components/AddSareeModal";
import EditSareeModal from "@/components/EditSareeModal";
import CategoryManager from "@/components/CategoryManager";
import { Plus, Tag, Download, Save } from "lucide-react";

export default function DashboardPage() {
    const { session, loading: authLoading } = useAuth();
    const router = useRouter();
    const [sarees, setSarees] = useState<Saree[]>([]);
    const [categories, setCategories] = useState<SareeCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingSaree, setEditingSaree] = useState<Saree | null>(null);

    useEffect(() => {
        if (!authLoading && !session) {
            router.push("/login");
        }
    }, [session, authLoading, router]);

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session]);

    const fetchData = async () => {
        setLoading(true);

        // Fetch sarees
        const { data: sareesData } = await supabase
            .from("sarees")
            .select("*")
            .order("display_order", { ascending: true });

        // Fetch categories
        const { data: categoriesData } = await supabase
            .from("categories")
            .select("*")
            .order("name", { ascending: true });

        setSarees(sareesData || []);
        setCategories(categoriesData || []);
        setLoading(false);
    };

    const handleStatusChange = async (sareeId: string, newStatus: string) => {
        await supabase
            .from("sarees")
            .update({ status: newStatus })
            .eq("id", sareeId);

        fetchData();
    };

    const handleDelete = async (sareeId: string) => {
        await supabase
            .from("sarees")
            .update({ status: "removed" })
            .eq("id", sareeId);

        fetchData();
    };

    const handleEdit = (saree: Saree) => {
        setEditingSaree(saree);
        setShowEditModal(true);
    };

    const [generatingPdf, setGeneratingPdf] = useState(false);

    const handleGeneratePDF = async (action: 'download' | 'upload') => {
        setGeneratingPdf(true);
        try {
            // Dynamically import the generator to avoid SSR issues with jspdf
            const { generateCatalogPDF } = await import("@/lib/pdfGenerator");
            const activeItems = sarees.filter(s => s.status !== 'removed');

            const pdfBlob = await generateCatalogPDF(activeItems, categories);

            if (action === 'download') {
                const url = window.URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `saree-catalog-${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                // Upload to Supabase using Standard Storage API
                const fileName = 'latest_catalog.pdf';
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

                const { data, error } = await supabase.storage
                    .from('catalog-pdfs')
                    .upload(fileName, file, {
                        upsert: true,
                        contentType: 'application/pdf'
                    });

                if (error) {
                    console.error("Upload error:", error);
                    alert("Failed to save PDF to cloud: " + error.message);
                } else {
                    const { data: publicUrl } = supabase.storage
                        .from('catalog-pdfs')
                        .getPublicUrl(fileName);

                    alert(`Catalog Saved! Client Link:\n${publicUrl.publicUrl}`);
                }
            }
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("An error occurred while generating the PDF.");
        } finally {
            setGeneratingPdf(false);
        }
    };

    if (authLoading || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-400 text-sm animate-pulse">Loading workspace...</div>
            </div>
        );
    }

    const activeSarees = sarees.filter(s => s.status !== "removed");
    const inStockCount = activeSarees.filter(s => s.status === "in_stock").length;
    const outOfStockCount = activeSarees.filter(s => s.status === "out_of_stock").length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            Catalog
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your boutique inventory</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handleGeneratePDF('download')}
                            disabled={generatingPdf}
                            className={`flex items-center gap-2 bg-white text-gray-700 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm font-medium ${generatingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Download size={16} className="text-gray-500" />
                            <span>{generatingPdf ? 'Generating...' : 'Download PDF'}</span>
                        </button>
                        <button
                            onClick={() => handleGeneratePDF('upload')}
                            disabled={generatingPdf}
                            className={`flex items-center gap-2 bg-white text-gray-700 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm font-medium ${generatingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save size={16} className="text-gray-500" />
                            <span>Save to Cloud</span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>
                        <button
                            onClick={() => setShowCategoryModal(true)}
                            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm font-medium"
                        >
                            <Tag size={16} className="text-gray-500" />
                            <span>Categories</span>
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-gray-900 text-white border border-transparent rounded-md px-4 py-2 hover:bg-gray-800 transition-all shadow-sm text-sm font-medium"
                        >
                            <Plus size={16} />
                            <span>Add Item</span>
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Inventory</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900">{activeSarees.length}</p>
                            <span className="text-sm text-gray-500">items</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Available</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900">{inStockCount}</p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-medium text-emerald-700">In Stock</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Unlisted / Sold</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900">{outOfStockCount}</p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                <span className="text-xs font-medium text-gray-600">Out of Stock</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex shadow-sm">
                        <button
                            onClick={() => setStatusFilter("all")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === "all"
                                ? "bg-gray-100 text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter("in_stock")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === "in_stock"
                                ? "bg-emerald-50 text-emerald-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            In Stock
                        </button>
                        <button
                            onClick={() => setStatusFilter("out_of_stock")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === "out_of_stock"
                                ? "bg-gray-100 text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Out of Stock
                        </button>
                    </div>

                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-700 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-shadow cursor-pointer min-w-[200px]"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Catalog Grid */}
                <CatalogGrid
                    sarees={sarees}
                    statusFilter={statusFilter}
                    categoryFilter={categoryFilter}
                    categories={categories}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddSareeModal
                    categories={categories}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={fetchData}
                />
            )}

            {showEditModal && editingSaree && (
                <EditSareeModal
                    saree={editingSaree}
                    categories={categories}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingSaree(null);
                    }}
                    onSuccess={fetchData}
                />
            )}

            {showCategoryModal && (
                <CategoryManager
                    categories={categories}
                    onClose={() => setShowCategoryModal(false)}
                    onUpdate={fetchData}
                />
            )}
        </div>
    );
}
