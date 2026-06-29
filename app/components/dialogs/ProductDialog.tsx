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
    quantity: number;
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
    const [quantity, setQuantity] = useState<number | "">("");

    const [size, setSize] = useState("");

    const [categoryId, setCategoryId] = useState<number | "">("");
    const [categoryLevels, setCategoryLevels] = useState<CategoryDTO[][]>([]);
    const [selectedCategoryPath, setSelectedCategoryPath] = useState<number[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(false);

    const [errors, setErrors] = useState<{
        name?: string;
        categoryId?: string;
        quantity?: string;
        price?: string;
        size?: string;
        color?: string;
        material?: string;
        features?: string;
        mainImage?: string;
        circumference?: string;
        cup?: string;
    }>({});

    const isEditing = Boolean(selected);
    const immediateParentId = isEditing
        ? selectedCategoryPath[selectedCategoryPath.length - 2]
        : fixedCategory?.parent?.id;
    const isBraCategory = categoryId === 1 || immediateParentId === 1;

    const getImageUrl = (image: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

    const inputClass =
        "w-full rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-3 text-sm text-[#6E2A39] outline-none transition placeholder:text-[#8A766C] focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15";

    const sectionClass =
        "rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5]/80 p-5";

    const labelCardClass =
        "rounded-[2rem] border border-dashed border-[#E5DED6] bg-[#F6F4F0] p-4";

    const fieldLabelClass =
        "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#8A766C]";

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
            setQuantity("");
            setSize("");

            setCategoryId(fixedCategory?.id ?? "");
            setSelectedCategoryPath([]);
            setCategoryLevels([]);

            setErrors({});
        };

        const loadCategoryPath = async (category: CategoryDTO) => {
            const chain: CategoryDTO[] = [];
            let current: CategoryDTO | null | undefined = category;

            while (current) {
                chain.unshift(current);
                current = current.parent;
            }

            setLoadingCategories(true);

            try {
                const levels: CategoryDTO[][] = [await CategoryService.findAll()];
                const path: number[] = [];

                for (let i = 0; i < chain.length; i++) {
                    path.push(chain[i].id);

                    if (i < chain.length - 1) {
                        levels.push(await CategoryService.findAll(chain[i].id));
                    }
                }

                setCategoryLevels(levels);
                setSelectedCategoryPath(path);
                setCategoryId(chain[chain.length - 1].id);
            } finally {
                setLoadingCategories(false);
            }
        };

        const fillForm = (product: ProductDTO) => {
            setName(product.name);
            setCircumference(product.circumference ?? "");
            setCup(product.cup ?? "");
            setColor(product.color ?? "");
            setMaterial(product.material ?? "");
            setFeatures(product.features ?? "");
            setPrice(product.price ?? "");
            setQuantity(product.quantity ?? 0);
            setSize(product.size ?? "");

            setMainImage(undefined);
            setImages([]);
            setExistingImages(product.images ?? []);
            setImagesToDelete([]);
            setErrors({});

            if (product.category) {
                void loadCategoryPath(product.category);
            }
        };

        if (!selected) {
            resetForm();
            return;
        }

        setLoadingProduct(true);

        ProductService.findOne(selected.id)
            .then(fillForm)
            .finally(() => setLoadingProduct(false));
    }, [selected, open, fixedCategory]);

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

        if (quantity === "" || quantity < 0 || !Number.isInteger(quantity)) {
            newErrors.quantity = "Вкажіть кількість (ціле число, не менше 0)";
        }

        if (!isEditing) {
            if (price === "") {
                newErrors.price = "Ціна обов'язкова";
            }

            if (!size) {
                newErrors.size = "Розмір обов'язковий";
            }

            if (!color) {
                newErrors.color = "Колір обов'язковий";
            }

            if (!material) {
                newErrors.material = "Матеріал обов'язковий";
            }

            if (!features) {
                newErrors.features = "Особливість обов'язкова";
            }

            if (!mainImage) {
                newErrors.mainImage = "Додайте головне фото";
            }

            if (isBraCategory) {
                if (!circumference) {
                    newErrors.circumference = "Обхват обов'язковий";
                }

                if (!cup) {
                    newErrors.cup = "Чашка обов'язкова";
                }
            }
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
            quantity: Number(quantity),

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
                                <label className={fieldLabelClass} htmlFor="product-name">
                                    Назва *
                                </label>
                                <input
                                    id="product-name"
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
                                <label className={fieldLabelClass}>Категорія *</label>

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
                                    <p className="text-xs text-red-600">
                                        Категорія недоступна. Відкрийте сторінку конкретної категорії, щоб створити товар.
                                    </p>
                                )}

                                {isEditing && (
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
                            </div>

                            <div>
                                <label className={fieldLabelClass} htmlFor="product-price">
                                    Ціна{!isEditing && " *"}
                                </label>
                                <input
                                    id="product-price"
                                    type="number"
                                    className={`${inputClass} ${
                                        errors.price
                                            ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
                                            : ""
                                    }`}
                                    placeholder="Ціна"
                                    value={price}
                                    onChange={(e) => {
                                        setPrice(e.target.value === "" ? "" : Number(e.target.value));
                                        setErrors((prev) => ({...prev, price: undefined}));
                                    }}
                                />
                                {errors.price && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={fieldLabelClass} htmlFor="product-quantity">
                                    Кількість *
                                </label>
                                <input
                                    id="product-quantity"
                                    type="number"
                                    min={0}
                                    step={1}
                                    className={`${inputClass} ${
                                        errors.quantity
                                            ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
                                            : ""
                                    }`}
                                    placeholder="Кількість"
                                    value={quantity}
                                    onChange={(e) => {
                                        setQuantity(e.target.value === "" ? "" : Number(e.target.value));
                                        setErrors((prev) => ({...prev, quantity: undefined}));
                                    }}
                                />
                                {errors.quantity && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.quantity}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={fieldLabelClass} htmlFor="product-size">
                                    Розмір{!isEditing && " *"}
                                </label>
                                <select
                                    id="product-size"
                                    className={`${inputClass} ${
                                        errors.size
                                            ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
                                            : ""
                                    }`}
                                    value={size}
                                    onChange={(e) => {
                                        setSize(e.target.value);
                                        setErrors((prev) => ({...prev, size: undefined}));
                                    }}
                                >
                                    <option value="">Оберіть розмір</option>
                                    {sizeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.size && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.size}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#8A766C]">
                            Фото товару
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            <label className={labelCardClass}>
                                <span className="mb-2 block text-sm font-medium text-[#6E2A39]">
                                    Головне фото{!isEditing && " *"}
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
                                    onChange={(e) => {
                                        setMainImage(e.target.files?.[0]);
                                        setErrors((prev) => ({...prev, mainImage: undefined}));
                                    }}
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

                                {errors.mainImage && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.mainImage}
                                    </p>
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
                                    <div>
                                        <label className={fieldLabelClass} htmlFor="product-circumference">
                                            Обхват{!isEditing && " *"}
                                        </label>
                                        <select
                                            id="product-circumference"
                                            className={`${inputClass} ${
                                                errors.circumference
                                                    ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
                                                    : ""
                                            }`}
                                            value={circumference}
                                            onChange={(e) => {
                                                setCircumference(e.target.value);
                                                setErrors((prev) => ({...prev, circumference: undefined}));
                                            }}
                                        >
                                            <option value="">Оберіть обхват</option>
                                            {circumferenceOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.circumference && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.circumference}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={fieldLabelClass} htmlFor="product-cup">
                                            Чашка{!isEditing && " *"}
                                        </label>
                                        <select
                                            id="product-cup"
                                            className={`${inputClass} ${
                                                errors.cup
                                                    ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
                                                    : ""
                                            }`}
                                            value={cup}
                                            onChange={(e) => {
                                                setCup(e.target.value);
                                                setErrors((prev) => ({...prev, cup: undefined}));
                                            }}
                                        >
                                            <option value="">Оберіть чашку</option>
                                            {cupOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.cup && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.cup}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div>
                                <label className={fieldLabelClass} htmlFor="product-color">
                                    Колір{!isEditing && " *"}
                                </label>
                                <select
                                    id="product-color"
                                    className={`${inputClass} ${
                                        errors.color
                                            ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
                                            : ""
                                    }`}
                                    value={color}
                                    onChange={(e) => {
                                        setColor(e.target.value);
                                        setErrors((prev) => ({...prev, color: undefined}));
                                    }}
                                >
                                    <option value="">Оберіть колір</option>
                                    {colorOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.color && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.color}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={fieldLabelClass} htmlFor="product-material">
                                    Матеріал{!isEditing && " *"}
                                </label>
                                <select
                                    id="product-material"
                                    className={`${inputClass} ${
                                        errors.material
                                            ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
                                            : ""
                                    }`}
                                    value={material}
                                    onChange={(e) => {
                                        setMaterial(e.target.value);
                                        setErrors((prev) => ({...prev, material: undefined}));
                                    }}
                                >
                                    <option value="">Оберіть матеріал</option>
                                    {materialOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.material && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.material}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={fieldLabelClass} htmlFor="product-features">
                                    Особливість{!isEditing && " *"}
                                </label>
                                <select
                                    id="product-features"
                                    className={`${inputClass} ${
                                        errors.features
                                            ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/15"
                                            : ""
                                    }`}
                                    value={features}
                                    onChange={(e) => {
                                        setFeatures(e.target.value);
                                        setErrors((prev) => ({...prev, features: undefined}));
                                    }}
                                >
                                    <option value="">Оберіть особливість</option>
                                    {featureOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.features && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.features}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {selected && (
                    <div className="rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5]/80 p-4 text-sm text-[#6E2A39]">
                        {Number(quantity) > 0 ? "В наявності" : "Немає в наявності"}
                    </div>
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