"use client";

import {useEffect, useState} from "react";
import {ProductDTO} from "@/app/types/product";
import {ProductService} from "@/app/api/product";
import {ProductCard} from "./ProductCard";
import {PageResponse} from "@/app/types/global";


interface ProductsGridProps {
    onEdit: (product: ProductDTO) => void;
}

export function ProductsGrid({onEdit}: ProductsGridProps) {
    const [page, setPage] = useState(0);
    const [productsPage, setProductsPage] = useState<PageResponse<ProductDTO> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);

        ProductService.findAll(page, 12)
            .then(setProductsPage)
            .finally(() => setLoading(false));
    }, [page]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                Завантаження товарів...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsPage?.content.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={onEdit}
                    />
                ))}
            </div>

            {productsPage && productsPage.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button
                        disabled={productsPage.first}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Попередня
                    </button>

                    {Array.from(
                        {length: productsPage.totalPages},
                        (_, index) => (
                            <button
                                key={index}
                                onClick={() => setPage(index)}
                                className={`w-10 h-10 rounded-lg border ${
                                    page === index
                                        ? "bg-black text-white"
                                        : "bg-white hover:bg-gray-100"
                                }`}
                            >
                                {index + 1}
                            </button>
                        )
                    )}

                    <button
                        disabled={productsPage.last}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
    );
}