"use client";

import {useEffect, useMemo, useState} from "react";
import {ProductService} from "@/app/api/product";
import {ProductDTO, ProductFilters} from "@/app/types/product";
import {PageResponse} from "@/app/types/global";
import {useParams, useRouter} from "next/navigation";
import {
    briefStyleOptions,
    bustModelOptions,
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
    bustModel: string;
    size: string;
    briefStyle: string;
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
    bustModel: "",
    size: "",
    briefStyle: "",
    categoryId: "",
};

export default function ProductsPage() {
    const params = useParams();
    const [category, setCategory] = useState<CategoryDTO | null>(null);
    const router = useRouter();
    const categoryId =
        typeof params.categoryId === "string"
            ? Number(params.categoryId)
            : undefined;

    const [page, setPage] = useState(0);
    const [productsPage, setProductsPage] = useState<PageResponse<ProductDTO> | null>(null);
    const [filters, setFilters] = useState<FilterFormState>({
        ...initialFilters,
        categoryId: categoryId ? String(categoryId) : "",
    });
    const isBraCategory = categoryId === 2;
    const isBriefCategory = categoryId === 1;

    const [loading, setLoading] = useState(true);
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


    const normalizedFilters = useMemo<ProductFilters>(() => {
        const result: ProductFilters = {};

        if (filters.name.trim()) result.name = filters.name.trim();
        if (filters.circumference.trim()) result.circumference = filters.circumference.trim();
        if (filters.cup.trim()) result.cup = filters.cup.trim();
        if (filters.color.trim()) result.color = filters.color.trim();
        if (filters.material.trim()) result.material = filters.material.trim();
        if (filters.features.trim()) result.features = filters.features.trim();
        if (filters.bustModel.trim()) result.bustModel = filters.bustModel.trim();
        if (filters.size.trim()) result.sizeFilter = filters.size.trim();
        if (filters.briefStyle.trim()) result.briefStyle = filters.briefStyle.trim();

        if (filters.minPrice !== "") result.minPrice = Number(filters.minPrice);
        if (filters.maxPrice !== "") result.maxPrice = Number(filters.maxPrice);
        if (filters.categoryId !== "") result.categoryId = Number(filters.categoryId);
        if (filters.inStock !== "") result.inStock = filters.inStock === "true";

        return result;
    }, [filters]);

    useEffect(() => {
        if (!categoryId) {
            return;
        }

        setLoading(true);

        ProductService.findAll(page, 12, normalizedFilters)
            .then(setProductsPage)
            .finally(() => setLoading(false));
    }, [page, normalizedFilters, categoryId]);

    const hasProducts = Boolean(productsPage?.content?.length);

    const handleChange = (field: keyof FilterFormState, value: string) => {
        setPage(0);

        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            ...initialFilters,
            categoryId: categoryId ? String(categoryId) : "",
        });

        setPage(0);
    };

    useEffect(() => {
        if (!categoryId) {
            return;
        }

        CategoryService.findOne(categoryId).then(setCategory);
    }, [categoryId]);

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 text-black">
            <div className="mx-auto max-w-7xl space-y-8">
                <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                    ← Назад до категорій
                </button>
                <section className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {category?.name ?? "Товари"}
                    </h1>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Фільтри
                        </h2>

                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Скинути
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <input
                            className="input-light"
                            placeholder="Назва"
                            value={filters.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                        {isBraCategory && (
                            <>
                                <select
                                    className="input-light"
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
                                    className="input-light"
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

                                <select
                                    className="input-light"
                                    value={filters.bustModel}
                                    onChange={(e) => handleChange("bustModel", e.target.value)}
                                >
                                    <option value="">Усі моделі бюста</option>
                                    {bustModelOptions.map((bustModel) => (
                                        <option key={bustModel.value} value={bustModel.value}>
                                            {bustModel.label}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}
                        {isBriefCategory && (
                            <select
                                className="input-light"
                                value={filters.briefStyle}
                                onChange={(e) => handleChange("briefStyle", e.target.value)}
                            >
                                <option value="">Усі моделі трусиків</option>
                                {briefStyleOptions.map((briefStyle) => (
                                    <option key={briefStyle.value} value={briefStyle.value}>
                                        {briefStyle.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        <select
                            className="input-light"
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
                            className="input-light"
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
                            className="input-light"
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
                            className="input-light"
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
                            className="input-light"
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
                            className="input-light"
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
                    {loading ? (
                        <div className="flex justify-center rounded-2xl bg-white py-16 text-gray-600">
                            Завантаження товарів...
                        </div>
                    ) : !hasProducts ? (
                        <div className="rounded-2xl bg-white py-16 text-center text-gray-600">
                            Товарів не знайдено.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {productsPage?.content.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => router.push(`/products/${product.id}?categoryId=${categoryId}`)}
                                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg"
                                    >
                                        <div className="h-72 bg-gray-100">
                                            {product.image ? (
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${product.image.replace(/\\/g, "/")}`}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="flex h-full items-center justify-center text-sm text-gray-400">
                                                    Немає фото
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 p-4">
                                            <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                                                {product.name}
                                            </h3>

                                            <div className="text-base font-medium text-gray-800">
                                                {product.price !== null && product.price !== undefined
                                                    ? `${product.price} грн`
                                                    : "Ціна не вказана"}
                                            </div>

                                            <div
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                    product.inStock
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-red-50 text-red-700"
                                                }`}
                                            >
                                                {product.inStock ? "В наявності" : "Немає в наявності"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {productsPage && productsPage.totalPages > 1 && (
                                <div className="flex flex-wrap justify-center items-center gap-2">
                                    <button
                                        disabled={productsPage.first}
                                        onClick={() => setPage((prev) => prev - 1)}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        Попередня
                                    </button>

                                    {Array.from(
                                        {length: productsPage.totalPages},
                                        (_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setPage(index)}
                                                className={`h-10 w-10 rounded-lg border text-sm ${
                                                    page === index
                                                        ? "border-black bg-black text-white"
                                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        )
                                    )}

                                    <button
                                        disabled={productsPage.last}
                                        onClick={() => setPage((prev) => prev + 1)}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
                                    >
                                        Наступна
                                    </button>
                                </div>
                            )}

                            {productsPage && (
                                <div className="text-center text-sm text-gray-500">
                                    Знайдено товарів: {productsPage.totalElements}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}