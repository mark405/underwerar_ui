"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {ProductService} from "@/app/api/product";
import {ProductDTO, ProductFilters} from "@/app/types/product";
import {PageResponse} from "@/app/types/global";
import {useParams, useRouter} from "next/navigation";
import {
    circumferenceOptions,
    colorOptions,
    cupOptions,
    featureOptions,
    materialOptions,
    priceOptions,
    sizeOptions
} from "@/app/constants/productOptions";
import {CategoryService} from "@/app/api/category";
import {CategoryDTO} from "@/app/types/category";
import { ShopLayout } from "@/app/components/ShopLayout";
import {ProductDialog} from "@/app/components/dialogs/ProductDialog";
import {CategoryDialog} from "@/app/components/dialogs/CategoryDialog";

type FilterFormState = {
    name: string;
    circumference: string;
    cup: string;
    color: string;
    material: string;
    features: string;
    minPrice: string;
    maxPrice: string;
    priceRange: string;
    inStock: string;
    size: string;
    categoryId: string;
};

const initialFilters: FilterFormState = {
    name: "",
    circumference: "",
    cup: "",
    color: "",
    material: "",
    features: "",
    minPrice: "",
    maxPrice: "",
    priceRange: "",
    inStock: "",
    size: "",
    categoryId: "",
};
interface ProductsPageProps {
    isAdmin?: boolean;
}
export function ProductsCatalog({isAdmin = false}: ProductsPageProps) {
    const params = useParams();
    const router = useRouter();

    const categoryId =
        typeof params.categoryId === "string"
            ? Number(params.categoryId)
            : undefined;

    const [category, setCategory] = useState<CategoryDTO | null>(null);
    const [childCategories, setChildCategories] = useState<CategoryDTO[]>([]);
    const [checkingChildren, setCheckingChildren] = useState(true);

    const [page, setPage] = useState(0);
    const [productsPage, setProductsPage] = useState<PageResponse<ProductDTO> | null>(null);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [productsReloadKey, setProductsReloadKey] = useState(0);

    const categoryFileInputRef = useRef<HTMLInputElement>(null);
    const [categoryUploadTargetId, setCategoryUploadTargetId] = useState<number | null>(null);

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingChildCategory, setEditingChildCategory] = useState<CategoryDTO | null>(null);

    const [filters, setFilters] = useState<FilterFormState>({
        ...initialFilters,
        categoryId: categoryId ? String(categoryId) : "",
    });

    const hasChildCategories = childCategories.length > 0;
    const shouldShowProducts = !checkingChildren && !hasChildCategories;

    const isBraCategory = category?.parent?.id === 1 || category?.id === 1;
    const filterControlClass =
        "w-full rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-3 text-sm text-[#6E2A39] outline-none transition placeholder:text-[#8A766C] focus:border-[#6E2A39] focus:bg-[#F6F4F0] focus:ring-2 focus:ring-[#6E2A39]/15";
    const getImageUrl = (image: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

    const reloadChildCategories = () => {
        if (!categoryId) {
            return Promise.resolve();
        }

        return CategoryService.findAll(categoryId).then(setChildCategories);
    };

    const handleAddChildPhotoClick = (id: number) => {
        setCategoryUploadTargetId(id);
        categoryFileInputRef.current?.click();
    };

    const handleChildFileChange = async (file: File | undefined) => {
        if (!file || categoryUploadTargetId == null) {
            return;
        }

        const target = childCategories.find((childCategory) => childCategory.id === categoryUploadTargetId);

        if (!target) {
            return;
        }

        await CategoryService.update({id: categoryUploadTargetId, name: target.name, file});
        await reloadChildCategories();
    };

    const handleDeleteChildPhoto = async (id: number) => {
        if (!window.confirm("Видалити фото категорії?")) {
            return;
        }

        await CategoryService.deleteImage(id);
        await reloadChildCategories();
    };

    const openCreateChildDialog = () => {
        setEditingChildCategory(null);
        setCategoryDialogOpen(true);
    };

    const openEditChildDialog = (childCategory: CategoryDTO) => {
        setEditingChildCategory(childCategory);
        setCategoryDialogOpen(true);
    };

    const handleChildDialogSubmit = async (name: string) => {
        if (editingChildCategory) {
            await CategoryService.update({id: editingChildCategory.id, name});
        } else if (categoryId) {
            await CategoryService.create({name, parentId: categoryId});
        }

        setCategoryDialogOpen(false);
        await reloadChildCategories();
    };

    const handleDeleteChildCategory = async (id: number) => {
        if (!window.confirm("Видалити цю категорію?")) {
            return;
        }

        try {
            await CategoryService.remove(id);
            await reloadChildCategories();
        } catch (err) {
            const status = (err as { response?: { status?: number } })?.response?.status;

            alert(
                status === 409
                    ? "Неможливо видалити категорію: спочатку видаліть підкатегорії або товари в ній."
                    : "Не вдалося видалити категорію."
            );
        }
    };

    const handleMoveChildCategory = async (id: number, direction: "up" | "down") => {
        const index = childCategories.findIndex((childCategory) => childCategory.id === id);
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (index === -1 || targetIndex < 0 || targetIndex >= childCategories.length) {
            return;
        }

        const reordered = [...childCategories];
        [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

        setChildCategories(reordered);

        try {
            await CategoryService.reorder(reordered.map((childCategory) => childCategory.id));
        } catch {
            await reloadChildCategories();
        }
    };

    useEffect(() => {
        if (!categoryId) {
            return;
        }

        setCheckingChildren(true);
        setChildCategories([]);
        setProductsPage(null);
        setPage(0);
        setFilters({
            ...initialFilters,
            categoryId: String(categoryId),
        });

        Promise.all([
            CategoryService.findOne(categoryId),
            CategoryService.findAll(categoryId),
        ])
            .then(([categoryData, childrenData]) => {
                setCategory(categoryData);
                setChildCategories(childrenData);
            })
            .finally(() => setCheckingChildren(false));
    }, [categoryId]);


    const normalizedFilters = useMemo<ProductFilters>(() => {
        const result: ProductFilters = {};

        if (filters.name.trim()) result.name = filters.name.trim();
        if (filters.circumference.trim()) result.circumference = filters.circumference.trim();
        if (filters.cup.trim()) result.cup = filters.cup.trim();
        if (filters.color.trim()) result.color = filters.color.trim();
        if (filters.material.trim()) result.material = filters.material.trim();
        if (filters.features.trim()) result.features = filters.features.trim();
        if (filters.size.trim()) result.sizeFilter = filters.size.trim();

        if (filters.minPrice !== "") result.minPrice = Number(filters.minPrice);
        if (filters.maxPrice !== "") result.maxPrice = Number(filters.maxPrice);
        if (filters.categoryId !== "") result.categoryId = Number(filters.categoryId);
        if (filters.inStock !== "") result.inStock = filters.inStock === "true";

        return result;
    }, [filters]);

    useEffect(() => {
        if (!categoryId || !shouldShowProducts) {
            return;
        }

        setLoadingProducts(true);

        ProductService.findAll(page, 12, normalizedFilters)
            .then(setProductsPage)
            .finally(() => setLoadingProducts(false));
    }, [page, normalizedFilters, categoryId, shouldShowProducts, productsReloadKey]);

    const hasProducts = Boolean(productsPage?.content?.length);

    const handleChange = (field: keyof FilterFormState, value: string) => {
        setPage(0);

        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePriceRangeChange = (value: string) => {
        const selectedPrice = priceOptions[Number(value)];

        setPage(0);

        setFilters((prev) => ({
            ...prev,
            priceRange: value,
            minPrice: selectedPrice?.minPrice !== undefined
                ? String(selectedPrice.minPrice)
                : "",
            maxPrice: selectedPrice?.maxPrice !== undefined
                ? String(selectedPrice.maxPrice)
                : "",
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            ...initialFilters,
            categoryId: categoryId ? String(categoryId) : "",
        });

        setPage(0);
    };

    const handleCreateProduct = async (payload: Parameters<typeof ProductService.create>[0]) => {
        await ProductService.create(payload);

        setProductDialogOpen(false);
        setPage(0);
        setProductsReloadKey((prev) => prev + 1);
    };

    const handleDeleteProduct = async (id: number) => {
        if (!window.confirm("Видалити цей товар?")) {
            return;
        }

        try {
            await ProductService.remove(id);
            setProductsReloadKey((prev) => prev + 1);
        } catch {
            alert("Не вдалося видалити товар.");
        }
    };

    const categoryBasePath = isAdmin ? "/admin/category" : "/category";
    const productBasePath = isAdmin ? "/admin/products" : "/products";
    if (checkingChildren) {
        return (
            <ShopLayout>
                <section className="mx-auto max-w-7xl px-5 py-10">
                    <div className="rounded-3xl bg-[#F1ECE5] p-10 text-center text-[#6E2A39]">
                        Завантаження...
                    </div>
                </section>
            </ShopLayout>
        );
    }

    if (hasChildCategories) {
        return (
            <ShopLayout>
                <section className="mx-auto max-w-7xl space-y-8 px-5 pb-32 pt-10">
                    <button
                        type="button"
                        onClick={() => {
                            if (category?.parent?.id) {
                                router.push(`${categoryBasePath}/${category.parent.id}`);
                                return;
                            }

                            router.push(isAdmin ? "/admin/category" : "/")
                        }}
                        className="rounded-xl border border-[#E5DED6] bg-[#F1ECE5] px-5 py-2 text-sm font-medium text-[#6E2A39] hover:bg-[#E5DED6]"
                        style={{ cursor: "pointer" }}
                    >
                        ← Назад до категорій
                    </button>

                    <section className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold text-[#6E2A39]">
                            {category?.name ?? "Категорії"}
                        </h1>

                        {isAdmin && (
                            <button
                                type="button"
                                onClick={openCreateChildDialog}
                                className="rounded-full bg-[#6E2A39] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#F6F4F0] shadow-sm transition hover:bg-[#5b2230]"
                                style={{cursor: "pointer"}}
                            >
                                + Створити підкатегорію
                            </button>
                        )}
                    </section>

                    <section>
                        <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3">
                            {childCategories.map((childCategory, index) => (
                                <div key={childCategory.id} className="group relative text-center">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`${categoryBasePath}/${childCategory.id}`)}
                                        className="w-full text-center"
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="overflow-hidden rounded-[2.5rem] bg-[#F1ECE5] shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                            {childCategory.image ? (
                                                <img
                                                    src={getImageUrl(childCategory.image)}
                                                    alt={childCategory.name}
                                                    className="aspect-[1.18/1] w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="aspect-[1.18/1] w-full bg-[#F1ECE5]"/>
                                            )}
                                        </div>

                                        <div className="mt-4 text-sm font-medium uppercase tracking-[0.15em] text-[#6E2A39] sm:text-base">
                                            {childCategory.name}
                                        </div>

                                        <div className="mt-1 text-xl leading-none text-[#6E2A39] transition group-hover:translate-x-1">
                                            →
                                        </div>
                                    </button>

                                    {isAdmin && (
                                        <div className="absolute right-2 top-2 z-10 flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleAddChildPhotoClick(childCategory.id)}
                                                aria-label="Додати фото"
                                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6E2A39] text-sm font-bold text-[#F6F4F0] shadow-md transition hover:bg-[#5b2230]"
                                                style={{cursor: "pointer"}}
                                            >
                                                +
                                            </button>

                                            {childCategory.image && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteChildPhoto(childCategory.id)}
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
                                                onClick={() => handleMoveChildCategory(childCategory.id, "up")}
                                                disabled={index === 0}
                                                aria-label="Перемістити вгору"
                                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E5DED6] bg-[#F1ECE5] text-[#6E2A39] transition hover:bg-[#E5DED6] disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
                                                style={{cursor: "pointer"}}
                                            >
                                                ↑
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleMoveChildCategory(childCategory.id, "down")}
                                                disabled={index === childCategories.length - 1}
                                                aria-label="Перемістити вниз"
                                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#E5DED6] bg-[#F1ECE5] text-[#6E2A39] transition hover:bg-[#E5DED6] disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
                                                style={{cursor: "pointer"}}
                                            >
                                                ↓
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openEditChildDialog(childCategory)}
                                                aria-label="Редагувати категорію"
                                                className="rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6E2A39] transition hover:bg-[#E5DED6] sm:px-3 sm:py-1.5 sm:text-xs"
                                                style={{cursor: "pointer"}}
                                            >
                                                Редагувати
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteChildCategory(childCategory.id)}
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
                    </section>

                    {isAdmin && (
                        <input
                            ref={categoryFileInputRef}
                            type="file"
                            accept="image/*"
                            style={{display: "none"}}
                            onChange={(e) => {
                                const file = e.target.files?.[0];

                                handleChildFileChange(file);

                                e.target.value = "";
                            }}
                        />
                    )}

                    {isAdmin && (
                        <CategoryDialog
                            open={categoryDialogOpen}
                            selected={editingChildCategory}
                            parentName={category?.name}
                            onClose={() => setCategoryDialogOpen(false)}
                            onSubmit={handleChildDialogSubmit}
                        />
                    )}
                </section>
            </ShopLayout>
        );
    }

    return (
        <ShopLayout>
            <section className="mx-auto max-w-7xl space-y-8 px-5 pb-32 pt-10">
                <button
                    type="button"
                    onClick={() => {
                        if (category?.parent?.id) {
                            router.push(`${categoryBasePath}/${category.parent.id}`)
                            return;
                        }

                        router.push(isAdmin ? "/admin/category" : "/")
                    }}
                    style={{ cursor: "pointer" }}
                    className="rounded-xl border border-[#E5DED6] bg-[#F1ECE5] px-5 py-2 text-sm font-medium text-[#6E2A39] hover:bg-[#E5DED6]"
                >
                    ← Назад до категорій
                </button>

                <section className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="font-serif text-3xl font-bold text-[#6E2A39] sm:text-4xl">
                            {category?.name ?? "Товари"}
                        </h1>

                        {isAdmin && (
                            <p className="text-sm text-[#8A766C]">
                                Адмін-режим: можна створювати та редагувати товари.
                            </p>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={openCreateChildDialog}
                                className="rounded-full border border-[#6E2A39] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#6E2A39] shadow-sm transition hover:bg-[#E5DED6]"
                                style={{ cursor: "pointer" }}
                            >
                                + Створити підкатегорію
                            </button>

                            <button
                                type="button"
                                onClick={() => setProductDialogOpen(true)}
                                className="rounded-full bg-[#6E2A39] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#F6F4F0] shadow-sm transition hover:bg-[#5b2230]"
                                style={{ cursor: "pointer" }}
                            >
                                + Створити товар
                            </button>
                        </div>
                    )}
                </section>

                <section className="rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5]/80 p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-serif text-xl font-semibold text-[#6E2A39] sm:text-2xl">
                                Фільтри
                            </h2>
                            <p className="mt-1 text-sm text-[#8A766C]">
                                Оберіть параметри, щоб швидше знайти потрібний товар.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="shrink-0 rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-5 py-2 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6]"
                            style={{ cursor: "pointer" }}
                        >
                            Скинути
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <input
                            className={filterControlClass}
                            placeholder="Назва"
                            value={filters.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />

                        {isBraCategory && (
                            <>
                                <select
                                    className={filterControlClass}
                                    value={filters.circumference}
                                    onChange={(e) => handleChange("circumference", e.target.value)}
                                >
                                    <option value="">Обхват під грудьми</option>
                                    {circumferenceOptions.map((circumference) => (
                                        <option key={circumference.value} value={circumference.value}>
                                            {circumference.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className={filterControlClass}
                                    value={filters.cup}
                                    onChange={(e) => handleChange("cup", e.target.value)}
                                >
                                    <option value="">Усі чашки</option>
                                    {cupOptions.map((cup) => (
                                        <option key={cup.value} value={cup.value}>
                                            {cup.label}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        <select
                            className={filterControlClass}
                            value={filters.color}
                            onChange={(e) => handleChange("color", e.target.value)}
                        >
                            <option value="">Усі кольори</option>
                            {colorOptions.map((color) => (
                                <option key={color.value} value={color.value}>
                                    {color.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={filterControlClass}
                            value={filters.material}
                            onChange={(e) => handleChange("material", e.target.value)}
                        >
                            <option value="">Усі матеріали</option>
                            {materialOptions.map((material) => (
                                <option key={material.value} value={material.value}>
                                    {material.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={filterControlClass}
                            value={filters.features}
                            onChange={(e) => handleChange("features", e.target.value)}
                        >
                            <option value="">Усі особливості</option>
                            {featureOptions.map((feature) => (
                                <option key={feature.value} value={feature.value}>
                                    {feature.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={filterControlClass}
                            value={filters.size}
                            onChange={(e) => handleChange("size", e.target.value)}
                        >
                            <option value="">Усі розміри</option>
                            {sizeOptions.map((size) => (
                                <option key={size.value} value={size.value}>
                                    {size.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={filterControlClass}
                            value={filters.priceRange}
                            onChange={(e) => handlePriceRangeChange(e.target.value)}
                        >
                            <option value="">Усі ціни</option>
                            {priceOptions.map((price, index) => (
                                <option key={price.label} value={String(index)}>
                                    {price.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={filterControlClass}
                            value={filters.inStock}
                            onChange={(e) => handleChange("inStock", e.target.value)}
                        >
                            <option value="">Усі статуси наявності</option>
                            <option value="true">В наявності</option>
                            <option value="false">Немає в наявності</option>
                        </select>
                    </div>
                </section>

                <section className="space-y-6">
                    {loadingProducts ? (
                        <div className="flex justify-center rounded-[2rem] bg-[#F1ECE5] py-16 text-[#8A766C]">
                            Завантаження товарів...
                        </div>
                    ) : !hasProducts ? (
                        <div className="rounded-[2rem] bg-[#F1ECE5] py-16 text-center text-[#8A766C]">
                            Товарів не знайдено.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 xl:grid-cols-4">
                                {productsPage?.content.map((product) => (
                                    <div key={product.id} className="group relative text-center">
                                        <button
                                            type="button"
                                            onClick={() => router.push(`${productBasePath}/${product.id}?categoryId=${categoryId}`)}
                                            className="w-full text-center"
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="overflow-hidden rounded-[2.5rem] bg-[#F1ECE5] shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                                {product.image ? (
                                                    <img
                                                        src={getImageUrl(product.image)}
                                                        alt={product.name}
                                                        className="aspect-[1.18/1] w-full object-cover transition duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex aspect-[1.18/1] w-full items-center justify-center bg-[#F1ECE5] text-sm text-[#8A766C]">
                                                        Немає фото
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 text-sm font-medium uppercase tracking-[0.15em] text-[#6E2A39] sm:text-base">
                                                {product.name}
                                            </div>

                                            <div className="mt-2 text-md font-bold tracking-wide text-[#6E2A39]">

                                                {product.price !== null && product.price !== undefined
                                                    ? `${product.price} грн`
                                                    : "Ціна не вказана"}
                                            </div>

                                            <div
                                                className={`mx-auto mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                                                    product.inStock
                                                        ? "border-[#E5DED6] bg-[#F6F4F0] text-[#6E2A39]"
                                                        : "border-[#E5DED6] bg-[#F1ECE5] text-[#8A766C]"
                                                }`}
                                            >
                                                {product.inStock ? "В наявності" : "Немає в наявності"}
                                            </div>

                                            <div className="mt-2 text-xl leading-none text-[#6E2A39] transition group-hover:translate-x-1">
                                                →
                                            </div>
                                        </button>

                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteProduct(product.id)}
                                                aria-label="Видалити товар"
                                                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F4F0]/90 text-sm font-bold text-red-700 shadow-md transition hover:bg-[#F6F4F0]"
                                                style={{cursor: "pointer"}}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {productsPage && productsPage.totalPages > 1 && (
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <button
                                        disabled={productsPage.first}
                                        onClick={() => setPage((prev) => prev - 1)}
                                        className="rounded-xl border border-[#E5DED6] bg-[#F1ECE5] px-4 py-2 text-sm text-[#6E2A39] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#E5DED6]"
                                        style={{ cursor: "pointer" }}
                                    >
                                        Попередня
                                    </button>

                                    {Array.from({length: productsPage.totalPages}, (_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setPage(index)}
                                            className={`h-10 w-10 rounded-xl border text-sm ${
                                                page === index
                                                    ? "border-[#6E2A39] bg-[#6E2A39] text-[#F6F4F0]"
                                                    : "border-[#E5DED6] bg-[#F1ECE5] text-[#6E2A39] hover:bg-[#E5DED6]"
                                            }`}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button
                                        style={{ cursor: "pointer" }}
                                        disabled={productsPage.last}
                                        onClick={() => setPage((prev) => prev + 1)}
                                        className="rounded-xl border border-[#E5DED6] bg-[#F1ECE5] px-4 py-2 text-sm text-[#6E2A39] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#E5DED6]"
                                    >
                                        Наступна
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
                {isAdmin && (
                    <ProductDialog
                        open={productDialogOpen}
                        selected={null}
                        fixedCategory={category}
                        onClose={() => setProductDialogOpen(false)}
                        onSubmit={handleCreateProduct}
                    />
                )}

                {isAdmin && (
                    <CategoryDialog
                        open={categoryDialogOpen}
                        selected={editingChildCategory}
                        parentName={category?.name}
                        onClose={() => setCategoryDialogOpen(false)}
                        onSubmit={handleChildDialogSubmit}
                    />
                )}
            </section>
        </ShopLayout>
    );
}