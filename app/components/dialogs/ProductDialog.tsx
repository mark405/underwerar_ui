"use client";

import {useEffect, useState} from "react";
import {ProductDTO} from "@/app/types/product";
import {CategoryService} from "@/app/api/category";
import {CategoryDTO} from "@/app/types/category";
import {
    briefStyleOptions,
    bustModelOptions,
    colorOptions,
    circumferenceOptions,
    cupOptions,
    featureOptions,
    materialOptions,
    sizeOptions
} from "@/app/constants/productOptions";
import {ProductService} from "@/app/api/product";

interface ProductDialogProps {
    open: boolean;
    selected: ProductDTO | null;
    onClose: () => void;
    onSubmit: (payload: any) => void;
}

export function ProductDialog({
                                  open,
                                  selected,
                                  onClose,
                                  onSubmit
                              }: ProductDialogProps) {
    const [name, setName] = useState("");

    const [mainImage, setMainImage] = useState<File | undefined>(undefined);
    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const [circumference, setCircumference] = useState("");
    const [cup, setCup] = useState("");

    const [color, setColor] = useState("");
    const [material, setMaterial] = useState("");
    const [features, setFeatures] = useState("");

    const [price, setPrice] = useState<number | "">("");
    const [inStock, setInStock] = useState(true);

    const [bustModel, setBustModel] = useState("");
    const [size, setSize] = useState("");
    const [briefStyle, setBriefStyle] = useState("");

    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [loadingProduct, setLoadingProduct] = useState(false);

    const [errors, setErrors] = useState<{
        name?: string;
        categoryId?: string;
    }>({});

    const isBriefCategory = categoryId === 1;
    const isBraCategory = categoryId === 2;

    const getImageUrl = (image: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

    useEffect(() => {
        CategoryService.findAll(0, 100).then(setCategories);
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        const resetForm = () => {
            setName("");
            setMainImage(undefined);
            setImages([]);
            setExistingImages([]);
            setImagesToDelete([]);

            setCircumference("");
            setCup("");
            setColor("");
            setMaterial("");
            setFeatures("");
            setPrice("");
            setInStock(true);
            setBustModel("");
            setSize("");
            setBriefStyle("");
            setCategoryId("");
            setErrors({});
        };

        const fillForm = (product: ProductDTO) => {
            setName(product.name);
            setCircumference(product.circumference ?? "");
            setCup(product.cup ?? "");
            setColor(product.color ?? "");
            setMaterial(product.material ?? "");
            setFeatures(product.features ?? "");
            setPrice(product.price ?? "");
            setInStock(product.inStock ?? true);
            setBustModel(product.bustModel ?? "");
            setSize(product.size ?? "");
            setBriefStyle(product.briefStyle ?? "");
            setCategoryId(product.category?.id ?? "");

            setMainImage(undefined);
            setImages([]);
            setExistingImages(product.images ?? []);
            setImagesToDelete([]);
            setErrors({});
        };

        if (!selected) {
            resetForm();
            return;
        }

        setLoadingProduct(true);

        ProductService.findOne(selected.id)
            .then(fillForm)
            .finally(() => setLoadingProduct(false));
    }, [selected, open]);

    useEffect(() => {
        if (!isBraCategory) {
            setCircumference("");
            setCup("");
            setBustModel("");
        }

        if (!isBriefCategory) {
            setBriefStyle("");
        }
    }, [isBraCategory, isBriefCategory]);

    if (!open) return null;

    const handleRemoveExistingImage = (image: string) => {
        setExistingImages((prev) => prev.filter((item) => item !== image));
        setImagesToDelete((prev) =>
            prev.includes(image) ? prev : [...prev, image]
        );
    };

    const handleRemoveNewImage = (indexToRemove: number) => {
        setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = () => {
        const newErrors: typeof errors = {};

        if (!name.trim()) {
            newErrors.name = "Назва обов'язкова";
        }

        if (!categoryId) {
            newErrors.categoryId = "Категорія обов'язкова";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const payload = {
            name,
            mainImage,
            images,
            imagesToDelete,

            circumference: isBraCategory ? circumference : undefined,
            cup: isBraCategory ? cup : undefined,
            bustModel: isBraCategory ? bustModel : undefined,

            color,
            material,
            features,

            price: price === "" ? undefined : Number(price),
            inStock,

            size,
            briefStyle: isBriefCategory ? briefStyle : undefined,

            categoryId: Number(categoryId),
        };

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 text-black shadow-2xl">

                <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {selected ? "Редагувати товар" : "Створити товар"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Заповніть інформацію про товар, фото та характеристики.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full px-3 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">

                    <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
                            Основна інформація
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <input
                                    className={`input-light ${
                                        errors.name
                                            ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500"
                                            : ""
                                    }`}
                                    placeholder="Назва"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setErrors((prev) => ({...prev, name: undefined}));
                                    }}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <select
                                    className={`input-light ${
                                        errors.categoryId
                                            ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500"
                                            : ""
                                    }`}
                                    value={categoryId}
                                    onChange={(e) => {
                                        setCategoryId(e.target.value === "" ? "" : Number(e.target.value));
                                        setErrors((prev) => ({...prev, categoryId: undefined}));
                                    }}
                                >
                                    <option value="">Оберіть категорію</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.categoryId && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.categoryId}
                                    </p>
                                )}
                            </div>

                            <input
                                type="number"
                                className="input-light"
                                placeholder="Ціна"
                                value={price}
                                onChange={(e) =>
                                    setPrice(e.target.value === "" ? "" : Number(e.target.value))
                                }
                            />

                            <select
                                className="input-light"
                                value={size}
                                onChange={(e) => setSize(e.target.value)}
                            >
                                <option value="">Оберіть розмір</option>
                                {sizeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
                            Фото товару
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            <label className="rounded-2xl border border-dashed border-gray-300 bg-white p-4">
                                <span className="mb-2 block text-sm font-medium text-gray-700">
                                    Головне фото
                                </span>

                                {selected?.image && !mainImage && (
                                    <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                        <img
                                            src={getImageUrl(selected.image)}
                                            alt="Поточне головне фото"
                                            className="h-40 w-full object-cover"
                                        />
                                    </div>
                                )}

                                {mainImage && (
                                    <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                        <img
                                            src={URL.createObjectURL(mainImage)}
                                            alt="Нове головне фото"
                                            className="h-40 w-full object-cover"
                                        />
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="text-sm text-gray-700"
                                    onChange={(e) => setMainImage(e.target.files?.[0])}
                                />

                                {mainImage && (
                                    <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-500">
                                        <span>Обрано: {mainImage.name}</span>

                                        <button
                                            type="button"
                                            onClick={() => setMainImage(undefined)}
                                            className="font-medium text-red-600 hover:text-red-700"
                                        >
                                            Прибрати
                                        </button>
                                    </div>
                                )}
                            </label>

                            <label className="rounded-2xl border border-dashed border-gray-300 bg-white p-4">
                                <span className="mb-2 block text-sm font-medium text-gray-700">
                                    Додаткові фото
                                </span>

                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="text-sm text-gray-700"
                                    onChange={(e) => {
                                        const newFiles = Array.from(e.target.files ?? []);
                                        setImages((prev) => [...prev, ...newFiles]);
                                        e.target.value = "";
                                    }}
                                />

                                {selected && existingImages.length > 0 && (
                                    <div className="mt-4">
                                        <div className="mb-2 text-xs font-medium text-gray-500">
                                            Поточні фото
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {existingImages.map((image) => (
                                                <div
                                                    key={image}
                                                    className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                                                >
                                                    <img
                                                        src={getImageUrl(image)}
                                                        alt="Поточне фото"
                                                        className="h-24 w-full object-cover"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveExistingImage(image)}
                                                        className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white shadow hover:bg-red-700"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {images.length > 0 && (
                                    <div className="mt-4">
                                        <div className="mb-2 text-xs font-medium text-gray-500">
                                            Нові фото
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {images.map((file, index) => (
                                                <div
                                                    key={`${file.name}-${index}`}
                                                    className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Нове фото ${index + 1}`}
                                                        className="h-24 w-full object-cover"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveNewImage(index)}
                                                        className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white shadow hover:bg-red-700"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selected && existingImages.length === 0 && images.length === 0 && (
                                    <div className="mt-3 text-xs text-gray-500">
                                        Додаткових фото немає.
                                    </div>
                                )}
                            </label>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
                            Характеристики
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {isBraCategory && (
                                <>
                                    <select
                                        className="input-light"
                                        value={circumference}
                                        onChange={(e) => setCircumference(e.target.value)}
                                    >
                                        <option value="">Оберіть обхват</option>
                                        {circumferenceOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="input-light"
                                        value={cup}
                                        onChange={(e) => setCup(e.target.value)}
                                    >
                                        <option value="">Оберіть чашку</option>
                                        {cupOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className="input-light"
                                        value={bustModel}
                                        onChange={(e) => setBustModel(e.target.value)}
                                    >
                                        <option value="">Оберіть модель бюста</option>
                                        {bustModelOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {isBriefCategory && (
                                <select
                                    className="input-light"
                                    value={briefStyle}
                                    onChange={(e) => setBriefStyle(e.target.value)}
                                >
                                    <option value="">Оберіть модель трусиків</option>
                                    {briefStyleOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <select
                                className="input-light"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            >
                                <option value="">Оберіть колір</option>
                                {colorOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="input-light"
                                value={material}
                                onChange={(e) => setMaterial(e.target.value)}
                            >
                                <option value="">Оберіть матеріал</option>
                                {materialOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="input-light"
                                value={features}
                                onChange={(e) => setFeatures(e.target.value)}
                            >
                                <option value="">Оберіть особливість</option>
                                {featureOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {selected && (
                        <label className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={inStock}
                                onChange={(e) => setInStock(e.target.checked)}
                            />
                            В наявності
                        </label>
                    )}

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Скасувати
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {selected ? "Оновити" : "Створити"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}