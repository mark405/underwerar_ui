"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {ShopLayout} from "@/app/components/ShopLayout";
import {useCart} from "@/app/components/CartContext";
import {ProductDTO} from "@/app/types/product";
import {ProductService} from "@/app/api/product";

export default function OrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const returnTo = searchParams.get("returnTo") ?? "/";
    const [singleProduct, setSingleProduct] = useState<ProductDTO | null>(null);
    const {items, clearCart} = useCart();

    const productId = searchParams.get("productId");
    const fromCart = searchParams.get("fromCart") === "true";
    const [showToast, setShowToast] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        secondName: "",
        thirdName: "",
        phone: "",
        shippingType: "",
    });
    useEffect(() => {
        if (!productId || fromCart) return;

        ProductService.findOne(Number(productId)).then(setSingleProduct);
    }, [productId, fromCart]);
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
        if (!showToast) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            router.push(returnTo);
        }, 2200);

        return () => window.clearTimeout(timeoutId);
    }, [showToast, router, returnTo]);

    const inputClass =
        "w-full rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-3 text-sm text-[#6E2A39] outline-none transition placeholder:text-[#8A766C] focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15";

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleOrder = () => {
        if (fromCart) {
            clearCart();
        }

        setShowToast(true);
    };

    return (
        <ShopLayout>
            {showToast && (
                <div className="fixed right-5 top-5 z-[100] max-w-sm rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-5 text-[#6E2A39] shadow-2xl">
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
                        <input
                            className={inputClass}
                            placeholder="Імʼя"
                            value={form.firstName}
                            onChange={(e) => handleChange("firstName", e.target.value)}
                        />

                        <input
                            className={inputClass}
                            placeholder="Прізвище"
                            value={form.secondName}
                            onChange={(e) => handleChange("secondName", e.target.value)}
                        />

                        <input
                            className={inputClass}
                            placeholder="По батькові"
                            value={form.thirdName}
                            onChange={(e) => handleChange("thirdName", e.target.value)}
                        />

                        <input
                            className={inputClass}
                            placeholder="Номер телефону"
                            value={form.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                        />

                        <select
                            className={`${inputClass} sm:col-span-2`}
                            value={form.shippingType}
                            onChange={(e) => handleChange("shippingType", e.target.value)}
                        >
                            <option value="">Тип доставки</option>
                            <option value="nova_poshta">Нова Пошта</option>
                            <option value="ukr_poshta">Укрпошта</option>
                            <option value="pickup">Самовивіз</option>
                        </select>
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
                            className="rounded-full bg-[#6E2A39] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#F6F4F0] transition hover:bg-[#5b2230]"
                        >
                            Замовити
                        </button>
                    </div>
                </div>
            </section>
        </ShopLayout>
    );
}