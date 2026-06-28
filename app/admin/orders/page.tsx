"use client";

import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {OrderService} from "@/app/api/order";
import {OrderDTO} from "@/app/types/order";
import {AdminAuthGuard} from "@/app/components/AdminAuthGuard";
import {PageResponse} from "@/app/types/global";

export default function AdminOrdersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [status, setStatus] = useState<string>("");
    const [data, setData] = useState<PageResponse<OrderDTO> | null>(null);
    const page = Number(searchParams.get("page") ?? 0);
    const size = 10;

    useEffect(() => {
        OrderService.findAll({
            status: status || undefined,
            page,
            size,
        }).then(setData);
    }, [status, page]);
    const statusLabels: Record<string, string> = {
        PENDING: "Створено",
        DELIVERED: "Доставлено",
        CANCELLED: "Скасовано",
    };
    const statusStyles: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        DELIVERED: "bg-green-100 text-green-800 border-green-200",
        CANCELLED: "bg-red-100 text-red-700 border-red-200",
    };
    return (
        <AdminAuthGuard>
            <div className="min-h-screen bg-[#F6F4F0] p-6 text-[#6E2A39] flex justify-center">
                <div className="w-full max-w-4xl flex flex-col">

                    <button
                        onClick={() => router.push("/admin")}
                        className="mb-4 self-start px-4 py-2 cursor-pointer rounded-full border border-[#E5DED6] bg-[#F1ECE5] text-sm hover:shadow-sm transition"
                    >
                        ← На головну
                    </button>

                    {/* HEADER */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-serif font-bold">
                            Замовлення
                        </h1>

                        {/* FILTER */}
                        <select
                            className="
                            rounded-full
                            border border-[#E5DED6]
                            bg-[#F1ECE5]
                            px-4 py-2
                            text-sm
                            uppercase tracking-wider
                            text-[#6E2A39]
                            outline-none
                            focus:border-[#6E2A39]
                        "
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">Всі</option>
                            <option value="PENDING">Створені</option>
                            <option value="DELIVERED">Доставлені</option>
                            <option value="CANCELLED">Скасовані</option>
                        </select>
                    </div>

                    {/* LIST */}
                    <div className="space-y-4 mb-12">
                        {data?.content?.map((o) => (
                            <div
                                key={o.id}
                                onClick={() => router.push(`/admin/orders/${o.id}`)}
                                className="
        cursor-pointer
        rounded-2xl
        border border-[#E5DED6]
        bg-[#F1ECE5]
        p-5
        shadow-sm
        transition
        hover:shadow-md
        hover:scale-[1.01]
    "
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold">
                                        #{o.id} — {o.username}
                                    </div>

                                    <span className={`
                                    text-xs uppercase tracking-wider
                                    px-3 py-1 rounded-full
                                    border
                                    ${statusStyles[o.status] ?? "bg-gray-100 text-gray-800 border-gray-200"}
                                `}>
                                    {statusLabels[o.status] ?? o.status}
                                </span>
                                </div>

                                <div className="mt-2 text-sm text-[#8A766C]">
                                    {o.telephone}
                                </div>

                                <div className="text-sm text-[#8A766C]">
                                    {o.deliveryType}
                                </div>

                                <div className="text-sm mt-2">
                                    {o.deliveryAddress}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[#E5DED6] flex justify-center items-center gap-3 mt-20">
                        <button
                            className="px-4 py-2 rounded-full border border-[#E5DED6] bg-[#F1ECE5] disabled:opacity-40"
                            disabled={page <= 0}
                            onClick={() => router.push(`?page=${page - 1}`)}
                        >
                            Назад
                        </button>

                        <span className="text-sm">
        Сторінка {page + 1} з {data?.totalPages ?? 1}
    </span>

                        <button
                            className="px-4 py-2 rounded-full border border-[#E5DED6] bg-[#F1ECE5] disabled:opacity-40"
                            disabled={!data || page + 1 >= data.totalPages}
                            onClick={() => router.push(`?page=${page + 1}`)}
                        >
                            Вперед
                        </button>
                    </div>
                </div>
            </div>
        </AdminAuthGuard>
    );
}