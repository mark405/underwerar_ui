"use client";

import { useEffect, useState } from "react";
import {useParams, useRouter} from "next/navigation";
import { OrderService } from "@/app/api/order";
import { OrderDTO } from "@/app/types/order";
import { AdminAuthGuard } from "@/app/components/AdminAuthGuard";
import { useDialog } from "@/app/components/DialogContext";

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

const inputClass =
    "w-full rounded-xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-2.5 text-sm text-[#6E2A39] outline-none transition focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15";

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState<OrderDTO | null>(null);
    const router = useRouter();
    const { alert } = useDialog();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [resending, setResending] = useState(false);
    const [username, setUsername] = useState("");
    const [telephone, setTelephone] = useState("");
    const [email, setEmail] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (!orderId) return;

        OrderService.findOne(Number(orderId)).then(setOrder);
    }, [orderId]);

    const startEditing = () => {
        if (!order) return;

        setUsername(order.username);
        setTelephone(order.telephone);
        setEmail(order.email);
        setDeliveryAddress(order.deliveryAddress);
        setStatus(order.status);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!order) return;

        setSaving(true);

        try {
            await OrderService.update({
                id: order.id,
                username,
                telephone,
                email,
                deliveryAddress,
                status,
            });

            const updated = await OrderService.findOne(order.id);
            setOrder(updated);
            setIsEditing(false);
        } catch {
            await alert("Не вдалося зберегти зміни.");
        } finally {
            setSaving(false);
        }
    };

    const handleResendEmail = async () => {
        if (!order) return;

        setResending(true);

        try {
            await OrderService.resendEmail(order.id);
            await alert("Лист надіслано повторно.");
        } catch {
            await alert("Не вдалося надіслати лист.");
        } finally {
            setResending(false);
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-[#F6F4F0] flex items-center justify-center text-[#6E2A39]">
                Завантаження...
            </div>
        );
    }

    return (
        <AdminAuthGuard>
            <div className="min-h-screen bg-[#F6F4F0] p-4 flex justify-center text-[#6E2A39] sm:p-6">
                <div className="w-full max-w-3xl">
                    <button
                        onClick={() => router.push("/admin/orders")}
                        className="mb-4 px-4 py-2 cursor-pointer rounded-full border border-[#E5DED6] bg-[#F1ECE5] text-sm hover:shadow-sm transition"
                    >
                        ← Назад до замовлень
                    </button>
                    {/* HEADER */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-serif font-bold sm:text-3xl">
                                Замовлення #{order.id}
                            </h1>

                            {!isEditing && (
                                <span className={`
            inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-semibold uppercase tracking-wider border
            ${statusStyles[order.status] ?? "bg-gray-100 text-gray-800 border-gray-200"}
        `}>
            {statusLabels[order.status] ?? order.status}
        </span>
                            )}
                        </div>

                        {!isEditing && (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleResendEmail}
                                    disabled={resending || !order.email}
                                    className="rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-5 py-2 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6] disabled:cursor-not-allowed disabled:opacity-60"
                                    style={{cursor: "pointer"}}
                                >
                                    {resending ? "Надсилання..." : "Надіслати email повторно"}
                                </button>

                                <button
                                    type="button"
                                    onClick={startEditing}
                                    className="rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-5 py-2 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6]"
                                    style={{cursor: "pointer"}}
                                >
                                    Редагувати
                                </button>
                            </div>
                        )}
                    </div>

                    {/* INFO */}
                    {isEditing ? (
                        <div className="rounded-2xl border border-[#E5DED6] bg-[#F1ECE5] p-4 space-y-4 sm:p-6">
                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#8A766C]">
                                    Користувач
                                </label>
                                <input
                                    className={inputClass}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#8A766C]">
                                    Телефон
                                </label>
                                <input
                                    className={inputClass}
                                    value={telephone}
                                    onChange={(e) => setTelephone(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#8A766C]">
                                    Email
                                </label>
                                <input
                                    className={inputClass}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#8A766C]">
                                    Доставка
                                </label>
                                <p className="px-1 text-sm text-[#6E2A39]">
                                    {order.deliveryType}
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#8A766C]">
                                    Адреса
                                </label>
                                <input
                                    className={inputClass}
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#8A766C]">
                                    Статус
                                </label>
                                <select
                                    className={inputClass}
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {Object.entries(statusLabels).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-[#E5DED6] pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                    className="w-full rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-5 py-2.5 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    style={{cursor: "pointer"}}
                                >
                                    Скасувати
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full rounded-full bg-[#6E2A39] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#F6F4F0] transition hover:bg-[#5b2230] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    style={{cursor: "pointer"}}
                                >
                                    {saving ? "Збереження..." : "Зберегти"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-[#E5DED6] bg-[#F1ECE5] p-4 space-y-2 sm:p-6">
                            <p><b>Користувач:</b> {order.username}</p>
                            <p><b>Телефон:</b> {order.telephone}</p>
                            <p><b>Email:</b> {order.email}</p>
                            <p><b>Доставка:</b> {order.deliveryType}</p>
                            <p><b>Адреса:</b> {order.deliveryAddress}</p>
                            <p><b>Спосіб зв&apos;язку:</b> {order.contactByPhone ? "Телефон" : "Email"}</p>
                        </div>
                    )}

                    {/* ITEMS */}
                    <div className="mt-6 space-y-3">
                        {order.orderItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-[#E5DED6] bg-[#F1ECE5]"
                            >
                                <div className="flex min-w-0 flex-col">
                                    <p className="font-semibold">
                                        {item.product.name}
                                    </p>

                                    <p className="text-sm text-[#8A766C]">
                                        Кількість: {item.quantity}
                                    </p>
                                </div>

                                <div className="shrink-0 font-semibold text-[#6E2A39] text-lg">
                                    {item.price ? `${item.price} ₴` : "Ціна не вказана"}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AdminAuthGuard>
    );
}
