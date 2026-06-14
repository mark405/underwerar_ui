"use client";

import {useEffect, useState} from "react";
import {ProductDTO} from "@/app/types/product";
import {CategoryService} from "@/app/api/category";
import {CategoryDTO} from "@/app/types/category";
import {
    circumferenceOptions,
    colorOptions,
    cupOptions,
    featureOptions,
    materialOptions,
    sizeOptions
} from "@/app/constants/productOptions";
import {ProductService} from "@/app/api/product";
interface ProductDialogPayload {
    name: string;
    mainImage?: File;
    images: File[];
    imagesToDelete: string[];
    circumference?: string;
    cup?: string;
    bustModel?: string;
    color: string;
    material: string;
    features: string;
    price?: number;
    inStock: boolean;
    size: string;
    briefStyle?: string;
    categoryId: number;
}
interface ProductDialogProps {
    open: boolean;
    selected: ProductDTO | null;
    fixedCategory?: CategoryDTO | null;
    onClose: () => void;
    onSubmit: (payload: ProductDialogPayload) => void;
}

export function ProductDialog({
                                  open,
                                  selected,
                                  fixedCategory = null,
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

    const [size, setSize] = useState("");

    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [categoryLevels, setCategoryLevels] = useState<CategoryDTO[][]>([]);
    const [selectedCategoryPath, setSelectedCategoryPath] = useState<number[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);

    const [errors, setErrors] = useState<{
        name?: string;
        categoryId?: string;
    }>({});

    const isEditing = Boolean(selected);
    const isBraCategory = categoryId === 1;

    const getImageUrl = (image: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

    const inputClass =
        "w-full rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-3 text-sm text-[#6E2A39] outline-none transition placeholder:text-[#8A766C] focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15";

    const sectionClass =
        "rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5]/80 p-5";

    const labelCardClass =
        "rounded-[2rem] border border-dashed border-[#E5DED6] bg-[#F6F4F0] p-4";

    const renderSelectedCategoryInfo = () => {
        const productCategory = selected?.category;
        const parentCategory = productCategory?.parent;
        if (!productCategory) {
            return (
                <div className="mt-1 font-semibold text-gray-900">
                    Категорія не вказана
                </div>
            );
        }

        if (parentCategory) {
            return (
                <div className="mt-2 space-y-2">
                    <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Категорія
                        </div>
                        <div className="font-semibold text-gray-900">
                            {parentCategory.name}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Підкатегорія
                        </div>
                        <div className="font-semibold text-gray-900">
                            {productCategory.name}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-2">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Категорія
                </div>
                <div className="font-semibold text-gray-900">
                    {productCategory.name}
                </div>
            </div>
        );
    };
    const handleCategorySelect = async (levelIndex: number, value: string) => {
        const selectedId = value === "" ? "" : Number(value);
        const nextPath = selectedCategoryPath.slice(0, levelIndex);

        setErrors((prev) => ({...prev, categoryId: undefined}));

        if (selectedId === "") {
            setSelectedCategoryPath(nextPath);
            setCategoryLevels((prev) => prev.slice(0, levelIndex + 1));
            setCategoryId("");
            return;
        }

        nextPath[levelIndex] = selectedId;
        setSelectedCategoryPath(nextPath);
        setCategoryLevels((prev) => prev.slice(0, levelIndex + 1));
        setLoadingCategories(true);

        try {
            const children = await CategoryService.findAll(selectedId);

            if (children.length > 0) {
                setCategoryLevels((prev) => [
                    ...prev.slice(0, levelIndex + 1),
                    children,
                ]);
                setCategoryId("");
                return;
            }

            setCategoryId(selectedId);
        } finally {
            setLoadingCategories(false);
        }
    };
    useEffect(() => {
        CategoryService.findAll().then((rootCategories) => {
            setCategories(rootCategories);
            setCategoryLevels([rootCategories]);
        });
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
            setSize("");

            setCategoryId(fixedCategory?.id ?? "");
            setSelectedCategoryPath([]);
            setCategoryLevels(fixedCategory ? [] : categories.length > 0 ? [categories] : []);

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
            setSize(product.size ?? "");
            setCategoryId(product.category?.id ?? "");
            setSelectedCategoryPath([]);

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
    }, [selected, open, fixedCategory, categories]);

    useEffect(() => {
        if (!isBraCategory) {
            setCircumference("");
            setCup("");
        }

    }, [isBraCategory]);

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

            color,
            material,
            features,

            price: price === "" ? undefined : Number(price),
            inStock,

            size,

            categoryId: Number(categoryId),
        };

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6E2A39]/40 px-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-[#E5DED6] bg-[#F6F4F0] p-6 text-[#6E2A39] shadow-2xl">

                <div className="mb-6 flex items-center justify-between border-b border-[#E5DED6] pb-4">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-[#6E2A39]">
                            {selected ? "Редагувати товар" : "Створити товар"}
                        </h2>
                        <p className="mt-1 text-sm text-[#8A766C]">
                            Заповніть інформацію про товар, фото та характеристики.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-3 py-1 text-xl text-[#6E2A39] transition hover:bg-[#E5DED6]"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#8A766C]">
                            Основна інформація
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <input
                                    className={`${inputClass} ${
                                        errors.name
                                            ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
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
                                {!isEditing && fixedCategory && (
                                    <div className="rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-3 text-sm text-[#6E2A39]">
                                        <div className="text-xs font-medium uppercase tracking-wide text-[#8A766C]">
                                            Категорія товару
                                        </div>

                                        {fixedCategory.parent?.name && (
                                            <div className="mt-2">
                                                <div className="text-xs font-medium uppercase tracking-wide text-[#8A766C]">
                                                    Категорія
                                                </div>
                                                <div className="font-semibold text-[#6E2A39]">
                                                    {fixedCategory.parent.name}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-2">
                                            <div className="text-xs font-medium uppercase tracking-wide text-[#8A766C]">
                                                {fixedCategory.parent ? "Підкатегорія" : "Категорія"}
                                            </div>
                                            <div className="font-semibold text-[#6E2A39]">
                                                {fixedCategory.name}
                                            </div>
                                        </div>

                                        <p className="mt-3 text-xs text-[#8A766C]">
                                            Товар буде створено в поточній категорії.
                                        </p>
                                    </div>
                                )}

                                {!isEditing && !fixedCategory && (
                                    <div className="space-y-3">
                                        {categoryLevels.map((levelCategories, levelIndex) => (
                                            <select
                                                key={levelIndex}
                                                className={`${inputClass} ${
                                                    errors.categoryId && levelIndex === categoryLevels.length - 1
                                                        ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
                                                        : ""
                                                }`}
                                                value={selectedCategoryPath[levelIndex] ?? ""}
                                                onChange={(e) => handleCategorySelect(levelIndex, e.target.value)}
                                            >
                                                <option value="">
                                                    {levelIndex === 0
                                                        ? "Оберіть категорію"
                                                        : "Оберіть підкатегорію"}
                                                </option>

                                                {levelCategories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ))}

                                        {loadingCategories && (
                                            <p className="text-xs text-gray-500">
                                                Завантаження підкатегорій...
                                            </p>
                                        )}

                                        {errors.categoryId && (
                                            <p className="text-xs text-red-600">
                                                {errors.categoryId}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {isEditing && errors.categoryId && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.categoryId}
                                    </p>
                                )}
                            </div>

                            <input
                                type="number"
                                className={inputClass}
                                placeholder="Ціна"
                                value={price}
                                onChange={(e) =>
                                    setPrice(e.target.value === "" ? "" : Number(e.target.value))
                                }
                            />

                            <select
                                className={inputClass}
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

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#8A766C]">
                            Фото товару
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            <label className={labelCardClass}>
                                <span className="mb-2 block text-sm font-medium text-[#6E2A39]">
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

                            <label className={labelCardClass}>
                                <span className="mb-2 block text-sm font-medium text-[#6E2A39]">
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

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#8A766C]">
                            Характеристики
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {isBraCategory && (
                                <>
                                    <select
                                        className={inputClass}
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
                                        className={inputClass}
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
                                </>
                            )}

                            <select
                                className={inputClass}
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
                                className={inputClass}
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
                                className={inputClass}
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
                    <label className="flex items-center gap-2 rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5]/80 p-4 text-sm text-[#6E2A39]">
                        <input
                            type="checkbox"
                            checked={inStock}
                            onChange={(e) => setInStock(e.target.checked)}
                        />
                        В наявності
                    </label>
                    )}

                    <div className="flex justify-end gap-3 border-t border-[#E5DED6] pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-5 py-2.5 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6]"
                        >
                            Скасувати
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="rounded-full bg-[#6E2A39] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#F6F4F0] transition hover:bg-[#5b2230]"
                        >
                            {selected ? "Оновити" : "Створити"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}