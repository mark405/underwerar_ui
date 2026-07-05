"use client";

import {useEffect, useState} from "react";
import {ShopLayout} from "@/app/components/ShopLayout";
import {AdminAuthGuard} from "@/app/components/AdminAuthGuard";
import {ShopSettingsService} from "@/app/api/shopSettings";
import {EmailPaymentDetailsService} from "@/app/api/emailPaymentDetails";

function AdminSettingsContent() {
    const [pickupEnabled, setPickupEnabled] = useState(true);
    const [saving, setSaving] = useState(false);

    const [paymentDetails, setPaymentDetails] = useState("");
    const [paymentDetailsDraft, setPaymentDetailsDraft] = useState("");
    const [isEditingPaymentDetails, setIsEditingPaymentDetails] = useState(false);
    const [savingPaymentDetails, setSavingPaymentDetails] = useState(false);

    useEffect(() => {
        ShopSettingsService.get().then((settings) => setPickupEnabled(settings.pickupEnabled));
        EmailPaymentDetailsService.get().then((dto) => setPaymentDetails(dto.content));
    }, []);

    const handleToggle = async () => {
        setSaving(true);

        try {
            const settings = await ShopSettingsService.update(!pickupEnabled);
            setPickupEnabled(settings.pickupEnabled);
        } finally {
            setSaving(false);
        }
    };

    const startEditingPaymentDetails = () => {
        setPaymentDetailsDraft(paymentDetails);
        setIsEditingPaymentDetails(true);
    };

    const handleSavePaymentDetails = async () => {
        setSavingPaymentDetails(true);

        try {
            const dto = await EmailPaymentDetailsService.update(paymentDetailsDraft);
            setPaymentDetails(dto.content);
            setIsEditingPaymentDetails(false);
        } finally {
            setSavingPaymentDetails(false);
        }
    };

    return (
        <ShopLayout>
            <section className="mx-auto max-w-3xl space-y-6 px-5 pb-32 pt-10">
                <h1 className="font-serif text-3xl font-bold text-[#6E2A39] sm:text-4xl">
                    Налаштування
                </h1>

                <div className="flex items-center justify-between rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-5 sm:p-6">
                    <div>
                        <div className="font-serif text-lg font-semibold text-[#6E2A39] sm:text-xl">
                            Самовивіз
                        </div>
                        <p className="mt-1 text-sm text-[#8A766C]">
                            Показувати варіант «Самовивіз» під час оформлення замовлення.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleToggle}
                        disabled={saving}
                        aria-pressed={pickupEnabled}
                        className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            pickupEnabled ? "bg-[#6E2A39]" : "bg-[#E5DED6]"
                        }`}
                    >
                        <span
                            className={`absolute top-1 h-6 w-6 rounded-full bg-[#F6F4F0] transition ${
                                pickupEnabled ? "left-7" : "left-1"
                            }`}
                        />
                    </button>
                </div>

                <div className="rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="font-serif text-lg font-semibold text-[#6E2A39] sm:text-xl">
                                Реквізити оплати в email
                            </div>
                            <p className="mt-1 text-sm text-[#8A766C]">
                                Цей текст додається в лист-підтвердження замовлення клієнту.
                            </p>
                        </div>

                        {!isEditingPaymentDetails && (
                            <button
                                type="button"
                                onClick={startEditingPaymentDetails}
                                className="shrink-0 rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#6E2A39] transition hover:bg-[#E5DED6]"
                            >
                                Редагувати
                            </button>
                        )}
                    </div>

                    {isEditingPaymentDetails ? (
                        <div className="mt-4 space-y-3">
                            <textarea
                                value={paymentDetailsDraft}
                                onChange={(e) => setPaymentDetailsDraft(e.target.value)}
                                rows={8}
                                placeholder="Наприклад: IBAN, отримувач, призначення платежу..."
                                className="w-full resize-y rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] p-4 text-sm leading-relaxed text-[#6E2A39] outline-none focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15"
                            />

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPaymentDetails(false)}
                                    disabled={savingPaymentDetails}
                                    className="w-full rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-5 py-2.5 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    Скасувати
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSavePaymentDetails}
                                    disabled={savingPaymentDetails}
                                    className="w-full rounded-full bg-[#6E2A39] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#F6F4F0] transition hover:bg-[#5b2230] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    {savingPaymentDetails ? "Збереження..." : "Зберегти"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 whitespace-pre-line text-sm text-[#6E2A39]">
                            {paymentDetails || "Реквізити ще не додано."}
                        </p>
                    )}
                </div>
            </section>
        </ShopLayout>
    );
}

export default function AdminSettingsPage() {
    return (
        <AdminAuthGuard>
            <AdminSettingsContent/>
        </AdminAuthGuard>
    );
}
