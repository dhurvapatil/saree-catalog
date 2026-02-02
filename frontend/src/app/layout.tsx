import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "@/styles/globals.css";

export const metadata: Metadata = {
    title: "Saree Catalog Manager",
    description: "Manage your saree catalog with ease",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-50 font-body">
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
