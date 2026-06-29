"use client";

import {CategoryService} from "@/app/api/category";
import {useEffect, useRef, useState} from "react";
import {CategoryDTO} from "@/app/types/category";
import {useRouter} from "next/navigation";
import {ShopLayout} from "@/app/components/ShopLayout";
import {useDialog} from "@/app/components/DialogContext";
import {CategoryDialog} from "@/app/components/dialogs/CategoryDialog";

interface CategoryCatalogProps {
    isAdmin?: boolean;
}

export function CategoryCatalog({isAdmin = false}: CategoryCatalogProps) {
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const router = useRouter();
    const {confirm, alert} = useDialog();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTargetId, setUploadTargetId] = useState<number | null>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

    const loadCategories = () => CategoryService.findAll().then(setCategories);

    useEffect(() => {
        loadCategories();
    }, []);

    const getImageUrl = (image: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

    const categoryBasePath = isAdmin ? "/admin/category" : "/category";

    const handleAddPhotoClick = (id: number) => {
        setUploadTargetId(id);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (file: File | undefined) => {
        if (!file || uploadTargetId == null) {
            return;
        }

        const target = categories.find((category) => category.id === uploadTargetId);

        if (!target) {
            return;
        }

        await CategoryService.update({id: uploadTargetId, name: target.name, file});
        await loadCategories();
    };

    const handleDeletePhoto = async (id: number) => {
        if (!(await confirm("Видалити фото категорії?"))) {
            return;
        }

        await CategoryService.deleteImage(id);
        await loadCategories();
    };

    const openCreateDialog = () => {
        setEditingCategory(null);
        setDialogOpen(true);
    };

    const openEditDialog = (category: CategoryDTO) => {
        setEditingCategory(category);
        setDialogOpen(true);
    };

    const handleDialogSubmit = async (name: string) => {
        if (editingCategory) {
            await CategoryService.update({id: editingCategory.id, name});
        } else {
            await CategoryService.create({name});
        }

        setDialogOpen(false);
        await loadCategories();
    };

    const handleDeleteCategory = async (id: number) => {
        if (!(await confirm("Видалити цю категорію?"))) {
            return;
        }

        try {
            await CategoryService.remove(id);
            await loadCategories();
        } catch (err) {
            const status = (err as { response?: { status?: number } })?.response?.status;

            await alert(
                status === 409
                    ? "Неможливо видалити категорію: спочатку видаліть підкатегорії або товари в ній."
                    : "Не вдалося видалити категорію."
            );
        }
    };

    const handleMoveCategory = async (id: number, direction: "up" | "down") => {
        const index = categories.findIndex((category) => category.id === id);
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (index === -1 || targetIndex < 0 || targetIndex >= categories.length) {
            return;
        }

        const reordered = [...categories];
        [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

        setCategories(reordered);

        try {
            await CategoryService.reorder(reordered.map((category) => category.id));
        } catch {
            await loadCategories();
        }
    };

    return (
        <ShopLayout>
            <section className="mx-auto max-w-7xl px-5 pb-32 pt-10">
                {isAdmin && (
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-[#6E2A39] sm:text-4xl">
                                Категорії
                            </h1>
                            <p className="mt-1 text-sm text-[#8A766C]">
                                Адмін-режим: можна створювати та редагувати категорії.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateDialog}
                            className="rounded-full bg-[#6E2A39] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#F6F4F0] shadow-sm transition hover:bg-[#5b2230]"
                            style={{cursor: "pointer"}}
                        >
                            + Створити категорію
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
                    {categories.map((category, index) => (
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

                            {isAdmin && (
                                <div className="absolute right-2 top-2 z-10 flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleAddPhotoClick(category.id)}
                                        aria-label="Додати фото"
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6E2A39] text-sm font-bold text-[#F6F4F0] shadow-md transition hover:bg-[#5b2230]"
                                        style={{cursor: "pointer"}}
                                    >
                                        +
                                    </button>

                                    {category.image && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePhoto(category.id)}
                                            aria-label="Видалити фото"
                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F4F0]/90 text-sm font-bold text-[#6E2A39] shadow-md transition hover:bg-[#F6F4F0]"
                                            style={{cursor: "pointer"}}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            )}

                            {isAdmin && (
                                <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleMoveCategory(category.id, "up")}
                                        disabled={index === 0}
                                        aria-label="Перемістити вгору"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E5DED6] bg-[#F1ECE5] text-[#6E2A39] transition hover:bg-[#E5DED6] disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
                                        style={{cursor: "pointer"}}
                                    >
                                        ↑
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleMoveCategory(category.id, "down")}
                                        disabled={index === categories.length - 1}
                                        aria-label="Перемістити вниз"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E5DED6] bg-[#F1ECE5] text-[#6E2A39] transition hover:bg-[#E5DED6] disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
                                        style={{cursor: "pointer"}}
                                    >
                                        ↓
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openEditDialog(category)}
                                        aria-label="Редагувати категорію"
                                        className="rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6E2A39] transition hover:bg-[#E5DED6] sm:px-3 sm:py-1.5 sm:text-xs"
                                        style={{cursor: "pointer"}}
                                    >
                                        Редагувати
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(category.id)}
                                        aria-label="Видалити категорію"
                                        className="rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-red-700 transition hover:bg-red-50 sm:px-3 sm:py-1.5 sm:text-xs"
                                        style={{cursor: "pointer"}}
                                    >
                                        Видалити
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {isAdmin && (
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{display: "none"}}
                        onChange={(e) => {
                            const file = e.target.files?.[0];

                            handleFileChange(file);

                            e.target.value = "";
                        }}
                    />
                )}

                {isAdmin && (
                    <CategoryDialog
                        open={dialogOpen}
                        selected={editingCategory}
                        onClose={() => setDialogOpen(false)}
                        onSubmit={handleDialogSubmit}
                    />
                )}
            </section>
        </ShopLayout>
    );
}