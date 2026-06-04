"use client";

import { useEffect, useState } from "react";
import { CategoryDTO } from "@/app/types/category";
import { CategoryService } from "@/app/api/category";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [selected, setSelected] = useState<CategoryDTO | null>(null);

    const [name, setName] = useState("");
    const [file, setFile] = useState<File | undefined>(undefined);

    const load = () => {
        CategoryService.findAll().then(setCategories);
    };

    useEffect(() => {
        load();
    }, []);

    const reset = () => {
        setSelected(null);
        setName("");
        setFile(undefined);
    };

    const handleSubmit = async () => {
        if (selected) {
            await CategoryService.update({
                id: selected.id,
                name,
                file,
            });
        } else {
            await CategoryService.create({
                name,
                file,
            });
        }

        reset();
        load();
    };

    const handleEdit = (c: CategoryDTO) => {
        setSelected(c);
        setName(c.name);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Category Management
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Create, update and manage product categories
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* FORM */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            {selected ? "Edit Category" : "Create Category"}
                        </h2>

                        <input
                            className="w-full border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none p-2 rounded-lg mb-3 transition"
                            placeholder="Category name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <input
                            type="file"
                            className="w-full text-sm text-gray-600 mb-4"
                            onChange={(e) => setFile(e.target.files?.[0])}
                        />

                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
                        >
                            {selected ? "Update Category" : "Create Category"}
                        </button>

                        {selected && (
                            <button
                                onClick={reset}
                                className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>

                    {/* LIST */}
                    <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">

                        {categories.map((c) => (
                            <div
                                key={c.id}
                                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden"
                            >

                                {c.image && (
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${c.image.replace("\\", "/")}`}
                                        className="w-full h-24 object-cover"
                                    />
                                )}

                                <div className="p-3">
                                    <div className="font-semibold text-gray-800 text-sm">
                                        {c.name}
                                    </div>

                                    <button
                                        onClick={() => handleEdit(c)}
                                        className="mt-2 text-xs text-blue-500 hover:text-blue-700"
                                    >
                                        Edit
                                    </button>
                                </div>

                            </div>
                        ))}

                    </div>

                </div>
            </div>
        </div>
    );
}