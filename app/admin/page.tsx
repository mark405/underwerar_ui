"use client";

import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">

            <div className="w-full max-w-3xl">

                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Admin Panel
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                    {/* Categories */}
                    <button
                        onClick={() => router.push("/admin/categories")}
                        className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition"
                    >
                        <div className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                            Categories
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Manage product categories
                        </p>
                    </button>

                    {/* Filters */}
                    <button
                        onClick={() => router.push("/admin/filters")}
                        className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition"
                    >
                        <div className="text-lg font-semibold text-gray-800 group-hover:text-green-600">
                            Filters
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Sizes, colors, attributes
                        </p>
                    </button>

                    {/* Products */}
                    <button
                        onClick={() => router.push("/admin/products")}
                        className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition"
                    >
                        <div className="text-lg font-semibold text-gray-800 group-hover:text-purple-600">
                            Products
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Manage catalog items
                        </p>
                    </button>

                </div>
            </div>
        </div>
    );
}