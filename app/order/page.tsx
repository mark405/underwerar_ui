"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {ShopLayout} from "@/app/components/ShopLayout";
import {useCart} from "@/app/components/CartContext";
import {ProductDTO} from "@/app/types/product";
import {ProductService} from "@/app/api/product";
import {NovaPostService} from "@/app/api/novapost";
import {SettlementAreaDTO, SettlementDTO, WareHouseDTO} from "@/app/types/novapost";
import {OrderService} from "@/app/api/order";

export default function OrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const returnTo = searchParams.get("returnTo") ?? "/";
    const [singleProduct, setSingleProduct] = useState<ProductDTO | null>(null);
    const {items, clearCart} = useCart();
    const [areas, setAreas] = useState<SettlementAreaDTO[]>([]);
    const [selectedArea, setSelectedArea] = useState<string>("");

    const [settlements, setSettlements] = useState<SettlementDTO[]>([]);
    const [selectedSettlement, setSelectedSettlement] = useState<SettlementDTO | null>(null);
    const [settlementSearch, setSettlementSearch] = useState("");
    const [settlementPage, setSettlementPage] = useState(1);
    const [hasMoreSettlements, setHasMoreSettlements] = useState(true);
    const [warehouses, setWarehouses] = useState<WareHouseDTO[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] =
        useState<WareHouseDTO | null>(null);
    const productId = searchParams.get("productId");
    const fromCart = searchParams.get("fromCart") === "true";
    const [showToast, setShowToast] = useState(false);
    const [warehouseSearch, setWarehouseSearch] = useState("");
    const [warehouseDropdownOpen, setWarehouseDropdownOpen] =
        useState(false);
    const [settlementDropdownOpen, setSettlementDropdownOpen] =
        useState(false);
    const [form, setForm] = useState({
        firstName: "",
        secondName: "",
        thirdName: "",
        phone: "",
        shippingType: "",
    });
    useEffect(() => {
        if (form.shippingType !== "nova_poshta") {
            return;
        }

        NovaPostService.getAreas()
            .then(setAreas);
    }, [form.shippingType]);
    useEffect(() => {
        if (!selectedArea) {
            return;
        }

        NovaPostService.getSettlements(
            selectedArea,
            settlementSearch,
            settlementPage
        ).then((page) => {
            if (settlementPage === 1) {
                setSettlements(page.content);
            } else {
                setSettlements(prev => [...prev, ...page.content]);
            }

            setHasMoreSettlements(!page.last);
        });
    }, [selectedArea, settlementSearch, settlementPage]);
    useEffect(() => {
        if (!productId || fromCart) return;

        ProductService.findOne(Number(productId)).then(setSingleProduct);
    }, [productId, fromCart]);
    useEffect(() => {
        setSettlements([]);
        setSettlementPage(1);
        setHasMoreSettlements(true);
        setSelectedSettlement(null);
    }, [selectedArea]);
    const orderItems = useMemo(() => {
        if (fromCart) return items;

        if (singleProduct) {
            return [{
                product: singleProduct,
                quantity: 1,
            }];
        }

        return [];
    }, [fromCart, items, singleProduct]);
    const totalPrice = useMemo(() => {
        return orderItems.reduce(
            (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
            0
        );
    }, [orderItems]);
    useEffect(() => {
        setSelectedWarehouse(null);
        setWarehouseSearch("");
    }, [selectedSettlement]);
    useEffect(() => {
        if (!showToast) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            router.push(returnTo);
        }, 2200);

        return () => window.clearTimeout(timeoutId);
    }, [showToast, router, returnTo]);

    useEffect(() => {
        if (!selectedSettlement) {
            setWarehouses([]);
            return;
        }

        NovaPostService.getWarehouses(
            selectedSettlement.Description,
            warehouseSearch,
            1,
            20
        ).then((page) => {
            setWarehouses(page.content);
        });
    }, [selectedSettlement, warehouseSearch]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const inputClass =
        "w-full rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-3 text-sm text-[#6E2A39] outline-none transition placeholder:text-[#8A766C] focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15";

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const isValidPhone = (phone: string) => {
        const normalized = phone.trim().replace(/[\s\-()]/g, "");

        return /^(?:\+380|380|0)\d{9}$/.test(normalized);
    };
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.firstName.trim()) newErrors.firstName = "Вкажіть ім'я";
        if (!form.secondName.trim()) newErrors.secondName = "Вкажіть прізвище";
        if (!form.thirdName.trim()) newErrors.thirdName = "Вкажіть по батькові";

        if (!form.phone.trim()) {
            newErrors.phone = "Вкажіть телефон";
        } else if (!isValidPhone(form.phone)) {
            newErrors.phone = "Невірний формат телефону";
        }

        if (!form.shippingType) {
            newErrors.shippingType = "Оберіть тип доставки";
        }

        if (form.shippingType === "nova_poshta") {
            if (!selectedArea) newErrors.area = "Оберіть область";
            if (!selectedSettlement) newErrors.settlement = "Оберіть місто";
            if (!selectedWarehouse) newErrors.warehouse = "Оберіть відділення";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };
    const handleOrder = async () => {
        if (!validate()) return;

        const deliveryAddress =
            form.shippingType === "nova_poshta"
                ? `${selectedSettlement?.Description ?? ""}; ${selectedWarehouse?.Description ?? ""}`
                : "";

        await OrderService.create({
            username: `${form.secondName} ${form.firstName} ${form.thirdName}`.trim(),
            telephone: form.phone,
            deliveryType: form.shippingType,
            deliveryAddress,
            orderItems: orderItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
            })),
        });

        if (fromCart) clearCart();

        setShowToast(true);
    };

    return (
        <ShopLayout>
            {showToast && (
                <div
                    className="fixed right-5 top-5 z-[100] max-w-sm rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-5 text-[#6E2A39] shadow-2xl">
                    <div className="font-serif text-2xl font-bold">
                        Замовлення прийнято
                    </div>
                    <p className="mt-2 text-sm text-[#8A766C]">
                        Дякуємо! Ми скоро звʼяжемося з вами.
                    </p>
                </div>
            )}
            <section className="mx-auto max-w-3xl px-5 pb-32 pt-10">
                <div className="mb-6 rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-5">
                    <div className="text-sm uppercase tracking-[0.15em] text-[#8A766C]">
                        Ваше замовлення
                    </div>

                    <div className="mt-3 space-y-2">
                        {orderItems.map((item) => (
                            <div
                                key={item.product.id}
                                className="flex justify-between text-[#6E2A39]"
                            >
                                <div>
                                    {item.product.name} × {item.quantity}
                                </div>
                                <div className="font-semibold">
                                    {(item.product.price ?? 0) * item.quantity} грн
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 border-t border-[#E5DED6] pt-3 flex justify-between">
                        <div className="text-[#8A766C]">Разом</div>
                        <div className="text-xl font-extrabold text-[#6E2A39]">
                            {totalPrice} грн
                        </div>
                    </div>
                </div>
                <div className="rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-6 shadow-xl">
                    <div className="mb-6">
                        <h1 className="font-serif text-4xl font-bold text-[#6E2A39]">
                            Оформлення замовлення
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <input
                                className={inputClass}
                                placeholder="Імʼя"
                                value={form.firstName}
                                onChange={(e) => handleChange("firstName", e.target.value)}
                            />
                            {errors.firstName && (
                                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                            )}
                        </div>

                        <div>
                            <input
                                className={inputClass}
                                placeholder="Прізвище"
                                value={form.secondName}
                                onChange={(e) => handleChange("secondName", e.target.value)}
                            />
                            {errors.secondName && (
                                <p className="text-sm text-red-500 mt-1">{errors.secondName}</p>
                            )}
                        </div>

                        <div>
                            <input
                                className={inputClass}
                                placeholder="По батькові"
                                value={form.thirdName}
                                onChange={(e) => handleChange("thirdName", e.target.value)}
                            />
                            {errors.thirdName && (
                                <p className="text-sm text-red-500 mt-1">{errors.thirdName}</p>
                            )}
                        </div>

                        <div>
                            <input
                                className={inputClass}
                                placeholder="+380..."
                                inputMode="tel"
                                value={form.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <select
                                className={inputClass}
                                value={form.shippingType}
                                onChange={(e) => handleChange("shippingType", e.target.value)}
                            >
                                <option value="">Тип доставки</option>
                                <option value="nova_poshta">Нова Пошта</option>
                                <option value="pickup">Самовивіз</option>
                            </select>
                            {errors.shippingType && (
                                <p className="text-sm text-red-500 mt-1">{errors.shippingType}</p>
                            )}
                        </div>

                        {form.shippingType === "nova_poshta" && (
                            <>
                                <div className="sm:col-span-2">
                                    <select
                                        className={inputClass}
                                        value={selectedArea}
                                        onChange={(e) => {
                                            setSelectedArea(e.target.value);
                                            setSelectedSettlement(null);
                                            setSelectedWarehouse(null);
                                            setSettlementSearch("");
                                            setWarehouses([]);
                                        }}
                                    >
                                        <option value="">Оберіть область</option>

                                        {areas.map((area) => (
                                            <option
                                                key={area.Ref}
                                                value={area.Ref}
                                            >
                                                {area.Description}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.area && (
                                        <p className="text-sm text-red-500 mt-1">{errors.area}</p>
                                    )}
                                </div>
                                <div className="relative sm:col-span-2">
                                    <input
                                        className={inputClass}
                                        placeholder="Пошук міста..."
                                        value={settlementSearch}
                                        onFocus={() => setSettlementDropdownOpen(true)}
                                        onChange={(e) => {
                                            setSettlementSearch(e.target.value);
                                            setSettlementPage(1);
                                            setSelectedSettlement(null);
                                            setSettlementDropdownOpen(true);
                                        }}
                                        disabled={!selectedArea}
                                    />

                                    {settlementDropdownOpen && settlements.length > 0 && (
                                        <div
                                            className="
                absolute
                left-0
                right-0
                top-full
                z-50
                mt-1
                max-h-60
                overflow-auto
                rounded-xl
                border
                border-[#E5DED6]
                bg-[#F6F4F0]
                shadow-lg
            "
                                            onScroll={(e) => {
                                                const el = e.currentTarget;

                                                const isBottom =
                                                    el.scrollTop + el.clientHeight >= el.scrollHeight - 20;

                                                if (isBottom && hasMoreSettlements) {
                                                    setSettlementPage(prev => prev + 1);
                                                }
                                            }}
                                        >
                                            {settlements.map((city) => (
                                                <div
                                                    key={city.Ref}
                                                    onClick={() => {
                                                        setSelectedSettlement(city);
                                                        setSettlementSearch(city.Description);
                                                        setSettlementDropdownOpen(false);
                                                    }}
                                                    className="cursor-pointer px-4 py-3 hover:bg-[#E5DED6]"
                                                >
                                                    {city.Description}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.settlement && (
                                        <p className="text-sm text-red-500 mt-1">{errors.settlement}</p>
                                    )}
                                </div>
                                <div className="relative sm:col-span-2">
                                    <input
                                        className={inputClass}
                                        placeholder="Пошук відділення..."
                                        value={warehouseSearch}
                                        onFocus={() => setWarehouseDropdownOpen(true)}
                                        onChange={(e) => {
                                            setWarehouseSearch(e.target.value);
                                            setWarehouseDropdownOpen(true);
                                        }}
                                        disabled={!selectedSettlement}
                                    />

                                    {warehouseDropdownOpen && warehouses.length > 0 && (
                                        <div
                                            className="
                absolute
                left-0
                right-0
                top-full
                z-50
                mt-1
                max-h-60
                overflow-auto
                rounded-xl
                border
                border-[#E5DED6]
                bg-[#F6F4F0]
                shadow-lg
            "
                                        >
                                            {warehouses.map((warehouse) => (
                                                <div
                                                    key={warehouse.SiteKey}
                                                    onClick={() => {
                                                        setSelectedWarehouse(warehouse);
                                                        setWarehouseSearch(warehouse.Description);
                                                        setWarehouseDropdownOpen(false);
                                                    }}
                                                    className="cursor-pointer px-4 py-3 hover:bg-[#E5DED6]"
                                                >
                                                    {warehouse.Description}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.warehouse && (
                                        <p className="text-sm text-red-500 mt-1">{errors.warehouse}</p>
                                    )}
                                </div>
                            </>

                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-[#E5DED6] pt-5">
                        <button
                            type="button"
                            onClick={() => router.push(returnTo)}
                            className="rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-5 py-2.5 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6]"
                        >
                            Назад
                        </button>

                        <button
                            type="button"
                            onClick={handleOrder}
                            className="rounded-full bg-[#6E2A39] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#F6F4F0] transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5b2230]"
                        >
                            Замовити
                        </button>
                    </div>
                </div>
            </section>
        </ShopLayout>
    );
}