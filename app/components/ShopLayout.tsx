"use client";

import {ReactNode, useEffect, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useCart} from "@/app/components/CartContext";
import {BannerService} from "@/app/api/banner";
import {BannerDTO} from "@/app/types/banner";

interface ShopLayoutProps {
    children: ReactNode;
}

const getImageUrl = (image: string) =>
    `${process.env.NEXT_PUBLIC_API_URL}/${image.replace(/\\/g, "/")}`;

export function ShopLayout({children}: ShopLayoutProps) {
    const router = useRouter();
    const {totalItems} = useCart();
    const pathname = usePathname();
    const isAdmin = pathname.startsWith("/admin");

    const [banners, setBanners] = useState<BannerDTO[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        BannerService.findAll()
            .then(setBanners)
            .catch(() => setBanners([]));
    }, []);

    const showPrev = () => {
        setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const showNext = () => {
        setActiveIndex((prev) => (prev + 1) % banners.length);
    };

    const handleAddBanner = async (file: File) => {
        const created = await BannerService.create(file);
        setBanners((prev) => {
            setActiveIndex(prev.length);
            return [...prev, created];
        });
    };

    const handleDeleteBanner = async () => {
        const banner = banners[activeIndex];

        if (!banner || !window.confirm("Видалити це фото з банера?")) {
            return;
        }

        await BannerService.delete(banner.id);
        setBanners((prev) => prev.filter((item) => item.id !== banner.id));
        setActiveIndex((prev) => Math.max(0, Math.min(prev, banners.length - 2)));
    };

    return (
        <main className="min-h-screen bg-[#F6F4F0] pb-24 text-[#6E2A39]">
            <header className="sticky top-0 z-20 border-b border-[#E5DED6] bg-[#F6F4F0]/95 backdrop-blur">
                <div className="relative flex h-16 w-full items-center justify-center px-3 sm:h-20 sm:px-5">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="text-center"
                        style={{cursor: "pointer"}}
                    >
                        <div className="font-serif text-2xl tracking-[0.2em] text-[#6E2A39] sm:text-4xl sm:tracking-[0.3em] lg:text-5xl lg:tracking-[0.35em]">
                            ZUNA
                        </div>
                        <div className="-mt-1 text-[9px] tracking-[0.3em] text-[#8A766C] sm:text-xs sm:tracking-[0.45em]">
                            intimates
                        </div>
                    </button>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => router.push("/admin/orders")}
                            className="
absolute right-3 top-1/2 -translate-y-1/2
rounded-full
bg-[#6E2A39]
px-3 py-1.5 sm:px-5 sm:py-2
text-[10px] sm:text-xs uppercase tracking-wider text-[#F6F4F0]
border border-[#6E2A39]
shadow-md
transition-all
hover:bg-[#5b2230]
hover:shadow-lg
hover:scale-105
active:scale-95
"
                        >
                            Замовлення
                        </button>
                    )}
                </div>
            </header>

            <section className="relative h-[280px] overflow-hidden bg-[#F1ECE5] sm:h-[400px] lg:h-[520px]">
                {banners.length > 0 ? (
                    banners.map((banner, index) => (
                        <img
                            key={banner.id}
                            src={getImageUrl(banner.image)}
                            alt=""
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                                index === activeIndex ? "opacity-100" : "opacity-0"
                            }`}
                        />
                    ))
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E5DED6] via-[#F1ECE5] to-[#D8C7BD]"/>
                )}

                {banners.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={showPrev}
                            aria-label="Попереднє фото"
                            className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#F6F4F0]/70 text-[#6E2A39] shadow-md transition hover:bg-[#F6F4F0]"
                            style={{cursor: "pointer"}}
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={showNext}
                            aria-label="Наступне фото"
                            className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#F6F4F0]/70 text-[#6E2A39] shadow-md transition hover:bg-[#F6F4F0]"
                            style={{cursor: "pointer"}}
                        >
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5"
                                      strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </>
                )}

                {banners.length > 0 && (
                    <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-3">
                        {banners.map((banner, index) => (
                            <button
                                key={banner.id}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Показати фото ${index + 1}`}
                                className={`h-2 w-2 rounded-full ${
                                    index === activeIndex ? "bg-[#6E2A39]" : "bg-[#6E2A39]/30"
                                }`}
                                style={{cursor: "pointer"}}
                            />
                        ))}
                    </div>
                )}

                {isAdmin && (
                    <div className="absolute right-2 top-2 z-10 flex gap-2 sm:right-5 sm:top-5">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full bg-[#6E2A39] px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#F6F4F0] shadow-md transition hover:bg-[#5b2230] sm:px-4 sm:py-2 sm:text-xs"
                            style={{cursor: "pointer"}}
                        >
                            + фото
                        </button>

                        {banners.length > 0 && (
                            <button
                                type="button"
                                onClick={handleDeleteBanner}
                                className="rounded-full bg-[#F6F4F0]/90 px-3 py-1.5 text-[10px] uppercase tracking-wider text-[#6E2A39] shadow-md transition hover:bg-[#F6F4F0] sm:px-4 sm:py-2 sm:text-xs"
                                style={{cursor: "pointer"}}
                            >
                                Видалити
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{display: "none"}}
                            onChange={(e) => {
                                const file = e.target.files?.[0];

                                if (file) {
                                    handleAddBanner(file);
                                }

                                e.target.value = "";
                            }}
                        />
                    </div>
                )}
            </section>

            {children}

            <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#E5DED6] bg-[#F1ECE5]/95 backdrop-blur">
                <div className="mx-auto grid h-16 max-w-4xl grid-cols-3 divide-x divide-[#E5DED6] px-2 text-[#6E2A39] sm:h-20 sm:px-4">
                    <button
                        type="button"
                        className="flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-wider sm:text-xs"
                        style={{cursor: "pointer"}}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-6 w-6 sm:h-7 sm:w-7"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M16 16L21 21"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        пошук
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/cart")}
                        className="relative flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-wider sm:text-xs"
                        style={{cursor: "pointer"}}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-6 w-6 sm:h-7 sm:w-7"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M7 8H17L18 21H6L7 8Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M9 8V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V8"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        кошик
                        <span
                            className="absolute top-3 left-1/2 ml-4 flex h-5 w-5 items-center justify-center rounded-full bg-[#6E2A39] text-[10px] text-[#F6F4F0]">
                            {totalItems}
                        </span>
                    </button>

                    <a
                        href="https://www.instagram.com/zuna.intimates/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-wider sm:text-xs"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-6 w-6 sm:h-7 sm:w-7"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M21 3L10.5 13.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M21 3L14.5 21L10.5 13.5L3 9.5L21 3Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                            />
                        </svg>
                        direct
                    </a>
                </div>
            </nav>
        </main>
    );
}