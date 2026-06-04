"use client";

import {CategoryService} from "@/app/api/category";
import {useEffect, useState} from "react";
import {CategoryDTO} from "@/app/types/category";

export default function CategoryPage() {
    const [categories, setCategories] = useState<CategoryDTO[]>([]);

    useEffect(() => {
        CategoryService.findAll().then(setCategories);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full h-150 bg-gray-200 rounded-2xl mb-8 shadow-sm flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  Placeholder section
                </span>
            </div>

            {/* GRID */}
            <div className="flex justify-center">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                    {categories.map((c) => (
                        <div
                            key={c.id}
                            className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-md hover:shadow-2xl transition duration-300"
                        >
                            {c.image && (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${c.image.replace(/\\/g, "/")}`}
                                    className="w-full h-64 object-cover rounded-2xl"
                                />
                            )}

                            <div className="text-xl font-bold text-gray-900 mt-5">
                                {c.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}