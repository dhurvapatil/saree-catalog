"use client";

import { useAuth } from "@/lib/auth-context";
import { LogOut } from "lucide-react";

export default function Navbar() {
    const { signOut } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg text-gray-900 tracking-tight">
                        Saree Catalog
                    </span>
                </div>

                <button
                    onClick={signOut}
                    className="text-gray-500 hover:text-burgundy-600 text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </nav>
    );
}
