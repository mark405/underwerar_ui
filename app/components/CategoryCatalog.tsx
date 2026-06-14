"use client";

import {CategoryService} from "@/app/api/category";
import {useEffect, useState} from "react";
import {CategoryDTO} from "@/app/types/category";
import {useRouter} from "next/navigation";
import {ShopLayout} from "@/app/components/ShopLayout";

interface CategoryCatalogProps {
    isAdmin?: boolean;
}

export function CategoryCatalog({isAdmin = false}: CategoryCatalogProps) {
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const router = useRouter();

    useEffect(() => {
        CategoryService.findAll().then(setCategories);
    }, []);

    const getImageUrl = (image: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

    const categoryBasePath = isAdmin ? "/admin/category" : "/category";

    return (
        <ShopLayout>
            <section className="mx-auto max-w-7xl px-5 pb-32 pt-10">
                {isAdmin && (
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-4xl font-bold text-[#6E2A39]">
                                Категорії
                            </h1>
                            <p className="mt-1 text-sm text-[#8A766C]">
                                Адмін-режим: можна створювати та редагувати категорії.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
                    {categories.map((category) => (
                        <div key={category.id} className="group relative text-center">
                            <button
                                type="button"
                                onClick={() => router.push(`${categoryBasePath}/${category.id}`)}
                                className="w-full text-center"
                                style={{ cursor: "pointer" }}
                            >
                                <div className="overflow-hidden rounded-[2.5rem] bg-[#F1ECE5] shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                    {category.image ? (
                                        <img
                                            src={getImageUrl(category.image)}
                                            alt={category.name}
                                            className="aspect-[1.18/1] w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="aspect-[1.18/1] w-full bg-[#F1ECE5]"/>
                                    )}
                                </div>

                                <div className="mt-4 text-sm font-medium uppercase tracking-[0.15em] text-[#6E2A39] sm:text-base">
                                    {category.name}
                                </div>

                                <div className="mt-1 text-xl leading-none text-[#6E2A39] transition group-hover:translate-x-1">
                                    →
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </ShopLayout>
    );
}