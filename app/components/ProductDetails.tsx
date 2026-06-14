"use client";

import {useEffect, useMemo, useState} from "react";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {ProductService} from "@/app/api/product";
import {ProductDTO} from "@/app/types/product";
import {ShopLayout} from "@/app/components/ShopLayout";
import {CategoryService} from "@/app/api/category";
import {CategoryDTO} from "@/app/types/category";
import {ProductDialog} from "@/app/components/dialogs/ProductDialog";
import {
    circumferenceOptions,
    colorOptions, cupOptions,
    featureOptions,
    materialOptions,
    sizeOptions
} from "@/app/constants/productOptions";

interface ProductDetailsProps {
    isAdmin?: boolean;
}

function FieldRow({
                      label,
                      value
                  }: {
    label: string;
    value?: string | number | null;
}) {
    return (
        <div className="rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] p-4">
            <div className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A766C]">
                {label}
            </div>
            <div className="mt-1 text-base font-semibold text-[#6E2A39]">
                {value ?? "-"}
            </div>
        </div>
    );
}

export function ProductDetails({isAdmin = false}: ProductDetailsProps) {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const returnCategoryId = searchParams.get("categoryId");

    const productId =
        typeof params.productId === "string"
            ? Number(params.productId)
            : undefined;

    const [product, setProduct] = useState<ProductDTO | null>(null);
    const [category, setCategory] = useState<CategoryDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const productImages = useMemo(() => {
        if (!product) {
            return [];
        }

        return [
            product.image,
            ...(product.images ?? []),
        ].filter((image): image is string => Boolean(image));
    }, [product]);

    const isBraCategory = category?.parent?.id === 1 || category?.id === 1;

    const categoryBasePath = isAdmin ? "/admin/category" : "/category";

    const getImageUrl = (image: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

    const loadProduct = async (ignore?: () => boolean) => {
        if (!productId) {
            return;
        }

        const productData = await ProductService.findOne(productId);

        if (ignore?.()) {
            return;
        }

        setProduct(productData);

        const firstImage = [
            productData.image,
            ...(productData.images ?? []),
        ].find(Boolean);

        setSelectedImage(firstImage ?? null);

        if (productData.category?.id) {
            const categoryData = await CategoryService.findOne(productData.category.id);

            if (!ignore?.()) {
                setCategory(categoryData);
            }

            return;
        }

        setCategory(null);
    };

    useEffect(() => {
        if (!productId) {
            return;
        }

        let ignore = false;

        loadProduct(() => ignore)
            .finally(() => {
                if (!ignore) {
                    setLoading(false);
                }
            });

        return () => {
            ignore = true;
        };
    }, [productId]);

    const handleUpdateProduct = async (payload: Parameters<typeof ProductService.create>[0] & {
        imagesToDelete?: string[];
        inStock?: boolean;
    }) => {
        if (!product) {
            return;
        }

        await ProductService.update({
            id: product.id,
            ...payload,
        });

        setEditDialogOpen(false);
        await loadProduct();
    };

    if (loading) {
        return (
            <ShopLayout>
                <section className="mx-auto max-w-6xl px-5 py-10">
                    <div className="rounded-[2rem] bg-[#F1ECE5] p-10 text-center text-[#8A766C] shadow-sm">
                        Завантаження товару...
                    </div>
                </section>
            </ShopLayout>
        );
    }

    if (!product) {
        return (
            <ShopLayout>
                <section className="mx-auto max-w-6xl px-5 py-10">
                    <div className="rounded-[2rem] bg-[#F1ECE5] p-10 text-center text-[#8A766C] shadow-sm">
                        Товар не знайдено.
                    </div>
                </section>
            </ShopLayout>
        );
    }
    const getOptionLabel = (
        options: {label: string; value: string}[],
        value?: string | null
    ) => options.find((option) => option.value === value)?.label ?? value ?? "-";
    return (
        <ShopLayout>
            <section className="mx-auto max-w-7xl space-y-6 px-5 pb-32 pt-10">
                <button
                    type="button"
                    onClick={() => {
                        if (returnCategoryId) {
                            router.push(`${categoryBasePath}/${returnCategoryId}`);
                            return;
                        }

                        if (product.category?.id) {
                            router.push(`${categoryBasePath}/${product.category.id}`);
                            return;
                        }

                        router.push(isAdmin ? "/admin/category" : "/");
                    }}
                    style={{ cursor: "pointer" }}
                    className="rounded-xl border border-[#E5DED6] bg-[#F1ECE5] px-5 py-2 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6]"
                >
                    ← Назад до товарів
                </button>

                <section className="overflow-hidden rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="bg-[#F1ECE5] p-4">
                            {selectedImage ? (
                                <div className="space-y-4">
                                    <div className="h-[520px] overflow-hidden rounded-[2rem] bg-[#E5DED6]">
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
                                                    className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 bg-[#F6F4F0] transition ${
                                                        selectedImage === image
                                                            ? "border-[#6E2A39]"
                                                            : "border-transparent hover:border-[#E5DED6]"
                                                    }`}
                                                    style={{ cursor: "pointer" }}
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
                                <div className="flex h-[520px] items-center justify-center rounded-[2rem] bg-[#E5DED6] text-[#8A766C]">
                                    Немає фото
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                            <div className="space-y-6">
                                <div>
                                    <div className="mb-3 inline-flex rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-4 py-1 text-sm font-medium text-[#8A766C]">
                                        {category?.parent?.name
                                            ? `${category.parent.name} / ${category.name}`
                                            : category?.name ?? product.category?.name ?? "Без категорії"}
                                    </div>

                                    <h1 className="font-serif text-4xl font-bold text-[#6E2A39] sm:text-5xl">
                                        {product.name}
                                    </h1>

                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => setEditDialogOpen(true)}
                                            className="mt-5 rounded-full bg-[#6E2A39] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#F6F4F0] transition hover:bg-[#5b2230]"
                                            style={{ cursor: "pointer" }}
                                        >
                                            Редагувати товар
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="text-4xl font-extrabold tracking-wide text-[#6E2A39]">
                                        {product.price !== null && product.price !== undefined
                                            ? `${product.price} грн`
                                            : "Ціна не вказана"}
                                    </div>

                                    <div
                                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                                            product.inStock
                                                ? "border-[#E5DED6] bg-[#F6F4F0] text-[#6E2A39]"
                                                : "border-[#E5DED6] bg-[#E5DED6] text-[#8A766C]"
                                        }`}
                                    >
                                        {product.inStock ? "В наявності" : "Немає в наявності"}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {isBraCategory && (
                                        <>
                                            <FieldRow label="Обхват" value={getOptionLabel(circumferenceOptions, product.circumference)}/>
                                            <FieldRow label="Чашка" value={getOptionLabel(cupOptions, product.cup)}/>
                                        </>
                                    )}

                                    <FieldRow label="Розмір" value={getOptionLabel(sizeOptions, product.size)}/>
                                    <FieldRow label="Колір" value={getOptionLabel(colorOptions, product.color)}/>
                                    <FieldRow label="Матеріал" value={getOptionLabel(materialOptions, product.material)}/>
                                    <FieldRow label="Особливості" value={getOptionLabel(featureOptions, product.features)}/>
                                    <FieldRow
                                        label="Категорія"
                                        value={
                                            category?.parent?.name
                                                ? `${category.parent.name} / ${category.name}`
                                                : category?.name ?? product.category?.name
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {isAdmin && (
                    <ProductDialog
                        open={editDialogOpen}
                        selected={product}
                        onClose={() => setEditDialogOpen(false)}
                        onSubmit={handleUpdateProduct}
                    />
                )}
            </section>
        </ShopLayout>
    );
}