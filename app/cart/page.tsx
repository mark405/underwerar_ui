"use client";

import {ShopLayout} from "@/app/components/ShopLayout";
import {useCart} from "@/app/components/CartContext";
import {useRouter} from "next/navigation";

export default function CartPage() {
    const router = useRouter();
    const {items, removeFromCart, clearCart} = useCart();

    const totalPrice = items.reduce(
        (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
        0
    );

    const getImageUrl = (image: string) =>
        `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

    return (
        <ShopLayout>
            <section className="mx-auto max-w-6xl space-y-8 px-5 pb-32 pt-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-[#6E2A39] sm:text-4xl">
                            Кошик
                        </h1>
                        <p className="mt-1 text-sm text-[#8A766C]">
                            Товари зберігаються у вашому браузері, поки ви не очистите кошик.
                        </p>
                    </div>

                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={clearCart}
                            className="rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-5 py-2 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6]"
                        >
                            Очистити
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-10 text-center text-[#8A766C]">
                        Кошик порожній.
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.product.id}
                                    className="flex gap-4 rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-4 sm:grid sm:grid-cols-[140px_1fr_auto]"
                                >
                                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#E5DED6] sm:h-32 sm:w-auto">
                                        {item.product.image ? (
                                            <img
                                                src={getImageUrl(item.product.image)}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-[#8A766C]">
                                                Немає фото
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:contents">
                                        <div className="space-y-2">
                                            <h2 className="font-serif text-xl font-bold text-[#6E2A39] sm:text-2xl">
                                                {item.product.name}
                                            </h2>
                                            <div className="text-lg font-extrabold text-[#6E2A39]">
                                                {item.product.price ?? "-"} грн
                                            </div>
                                            <div className="text-sm text-[#8A766C]">
                                                Кількість: {item.quantity}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.product.id)}
                                            className="self-start rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-4 py-2 text-sm text-[#6E2A39] transition hover:bg-[#E5DED6]"
                                        >
                                            Видалити
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-5">
                            <div>
                                <div className="text-sm uppercase tracking-[0.15em] text-[#8A766C]">
                                    Разом
                                </div>
                                <div className="text-3xl font-extrabold text-[#6E2A39]">
                                    {totalPrice} грн
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.push(`/order?fromCart=true&returnTo=${encodeURIComponent("/cart")}`)}
                                className="rounded-full bg-[#6E2A39] px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#F6F4F0] transition hover:bg-[#5b2230]"
                            >
                                Оформити замовлення
                            </button>
                        </div>
                    </>
                )}
            </section>
        </ShopLayout>
    );
}