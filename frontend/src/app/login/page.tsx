"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle, Loader } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(false);
        setLoading(true);

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
            setError(true);
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    const handleInputChange = () => {
        if (error) setError(false);
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel - Decorative */}
            <div className="relative bg-burgundy-500 lg:w-[60%] h-48 lg:h-screen flex items-center justify-center overflow-hidden">
                {/* Decorative Paisley SVG */}
                <svg
                    className="absolute bottom-0 left-0 w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] opacity-10"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M100 20C100 20 140 40 140 80C140 120 120 140 100 140C80 140 60 120 60 80C60 60 70 50 80 50C90 50 95 55 95 65C95 75 90 80 85 80C80 80 75 75 75 70C75 65 77 63 80 63"
                        stroke="#C9A227"
                        strokeWidth="2"
                        fill="none"
                    />
                    <circle cx="100" cy="80" r="30" stroke="#C9A227" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <circle cx="100" cy="80" r="45" stroke="#C9A227" strokeWidth="1" fill="none" opacity="0.4" />
                    <path
                        d="M85 65 Q90 60 95 65 T105 65"
                        stroke="#C9A227"
                        strokeWidth="1.5"
                        fill="none"
                        opacity="0.5"
                    />
                </svg>

                {/* Welcome Message */}
                <div className="relative z-10 text-center lg:text-left px-8 lg:px-16">
                    <h1 className="text-white font-display text-3xl lg:text-5xl italic mb-3">
                        Welcome Back
                    </h1>
                    <p className="text-white/60 font-body text-sm lg:text-base">
                        Manage your saree catalog with ease
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="bg-cream-100 lg:w-[40%] flex items-center justify-center px-6 py-12 lg:py-0">
                <div className="w-full max-w-md">
                    {/* Logo Area */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-12 h-12 rounded-full bg-burgundy-500 flex items-center justify-center text-white font-display text-xl font-semibold">
                            SC
                        </div>
                        <div className="ml-3 font-display text-burgundy-500 text-xl font-semibold">
                            Saree Catalog
                        </div>
                    </div>

                    {/* Decorative Line */}
                    <div className="flex justify-center mb-3">
                        <div className="w-12 h-0.5 bg-gold-500"></div>
                    </div>

                    {/* Tagline */}
                    <p className="text-center text-gold-600 text-xs mb-8">
                        Manage your collection
                    </p>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label className="block mb-1.5 text-xs uppercase tracking-widest text-burgundy-500 font-medium">
                                EMAIL
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    handleInputChange();
                                }}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-body placeholder:text-gray-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-300 focus:outline-none transition-all"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block mb-1.5 text-xs uppercase tracking-widest text-burgundy-500 font-medium">
                                PASSWORD
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    handleInputChange();
                                }}
                                placeholder="••••••••"
                                required
                                className="w-full bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-body placeholder:text-gray-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-300 focus:outline-none transition-all"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <span>Invalid email or password. Please try again.</span>
                            </div>
                        )}

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-burgundy-500 text-white font-body font-medium text-sm rounded-lg py-3 hover:bg-burgundy-600 active:scale-[0.97] disabled:bg-burgundy-400 transition-all flex items-center justify-center"
                        >
                            {loading ? <Loader size={18} className="animate-spin" /> : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
