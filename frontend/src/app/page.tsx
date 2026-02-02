"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
    const { session, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (session) {
                router.push("/dashboard");
            } else {
                router.push("/login");
            }
        }
    }, [session, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-burgundy-500 text-lg animate-pulse">Loading...</div>
        </div>
    );
}
