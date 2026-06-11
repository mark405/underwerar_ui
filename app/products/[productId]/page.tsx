"use client";

import {useEffect, useMemo, useState} from "react";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {ProductService} from "@/app/api/product";
import {ProductDTO} from "@/app/types/product";

function FieldRow({
                      label,
                      value
                  }: {
    label: string;
    value?: string | number | null;
}) {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </div>
            <div className="mt-1 text-base font-semibold text-gray-900">
                {value ?? "-"}
            </div>
        </div>
    );
}

export default function ProductDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const returnCategoryId = searchParams.get("categoryId");

    const productId =
        typeof params.productId === "string"
            ? Number(params.productId)
            : undefined;

    const [product, setProduct] = useState<ProductDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const productImages = useMemo(() => {
        if (!product) {
            return [];
        }

        return [
            product.image,
            ...(product.images ?? []),
        ].filter((image): image is string => Boolean(image));
    }, [product]);

    const getImageUrl = (image: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

    useEffect(() => {
        if (!productId) {
            return;
        }

        setLoading(true);

        ProductService.findOne(productId)
            .then(setProduct)
            .finally(() => setLoading(false));
    }, [productId]);

    useEffect(() => {
        if (productImages.length > 0) {
            setSelectedImage(productImages[0]);
        }
    }, [productImages]);

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 px-4 py-10 text-black">
                <div className="mx-auto max-w-6xl rounded-3xl bg-white p-10 text-center text-gray-600 shadow-sm">
                    Завантаження товару...
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-gray-50 px-4 py-10 text-black">
                <div className="mx-auto max-w-6xl rounded-3xl bg-white p-10 text-center text-gray-600 shadow-sm">
                    Товар не знайдено.
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 text-black">
            <div className="mx-auto max-w-7xl space-y-6">
                <button
                    type="button"
                    onClick={() => {
                        if (returnCategoryId) {
                            router.push(`/category/${returnCategoryId}`);
                            return;
                        }

                        if (product?.category?.id) {
                            router.push(`/category/${product.category.id}`);
                            return;
                        }

                        router.push("/");
                    }}
                    className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                    ← Назад до категорії
                </button>

                <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="bg-gray-100 p-4">
                            {selectedImage ? (
                                <div className="space-y-4">
                                    <div className="h-[520px] overflow-hidden rounded-2xl bg-gray-200">
                                        <img
                                            src={getImageUrl(selectedImage)}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    {productImages.length > 1 && (
                                        <div className="flex gap-3 overflow-x-auto pb-2">
                                            {productImages.map((image, index) => (
                                                <button
                                                    key={`${image}-${index}`}
                                                    type="button"
                                                    onClick={() => setSelectedImage(image)}
                                                    className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-white ${
                                                        selectedImage === image
                                                            ? "border-blue-600"
                                                            : "border-transparent hover:border-gray-300"
                                                    }`}
                                                >
                                                    <img
                                                        src={getImageUrl(image)}
                                                        alt={`${product.name} ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex h-[520px] items-center justify-center rounded-2xl bg-gray-200 text-gray-400">
                                    Немає фото
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                            <div className="space-y-6">
                                <div>
                                    <div className="mb-3 inline-flex rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-700">
                                        {product.category?.name ?? "Без категорії"}
                                    </div>

                                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                                        {product.name}
                                    </h1>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {product.price !== null && product.price !== undefined
                                            ? `${product.price} грн`
                                            : "Ціна не вказана"}
                                    </div>

                                    <div
                                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                                            product.inStock
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-700"
                                        }`}
                                    >
                                        {product.inStock ? "В наявності" : "Немає в наявності"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FieldRow label="Обхват" value={product.circumference}/>
                                    <FieldRow label="Чашка" value={product.cup}/>
                                    <FieldRow label="Розмір" value={product.size}/>
                                    <FieldRow label="Колір" value={product.color}/>
                                    <FieldRow label="Матеріал" value={product.material}/>
                                    <FieldRow label="Особливості" value={product.features}/>
                                    <FieldRow label="Модель бюста" value={product.bustModel}/>
                                    <FieldRow label="Фасон трусиків" value={product.briefStyle}/>
                                    <FieldRow label="Категорія" value={product.category?.name}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}