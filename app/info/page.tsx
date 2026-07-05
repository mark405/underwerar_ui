"use client";

import {useEffect, useState} from "react";
import {ShopLayout} from "@/app/components/ShopLayout";
import {InfoPageService} from "@/app/api/infoPage";
import {getAdminCredentials} from "@/app/api/api";

const DEFAULT_CONTENT = `Обмін та повернення

Відповідно до чинного законодавства України, спідня білизна належить до категорії товарів, які не підлягають обміну та поверненню після отримання.

Якщо під час огляду посилки у відділенні перевізника ви виявили виробничий брак, невідповідність замовленому товару, кольору, розміру або неповну комплектацію, будь ласка, одразу повідомте про це працівника служби доставки та оформіть відмову від отримання.

Оплата

Ми пропонуємо зручні способи оплати замовлень:

Оплата на рахунок ФОП
Після оформлення замовлення ви отримаєте реквізити для оплати. Відправка товару здійснюється після зарахування коштів на рахунок.

Післяплата (накладений платіж) Новою поштою
Ви можете оплатити замовлення під час отримання у відділенні Нової пошти або поштоматі (за наявності такої послуги). Звертаємо увагу, що у цьому випадку перевізник додатково стягує комісію за переказ коштів згідно зі своїми тарифами.

Будь ласка, перевіряйте товар під час отримання посилки
Звертаємо вашу увагу, що перевірка товару повинна здійснюватися безпосередньо у відділенні пошти під час отримання посилки.

У разі доставки до поштомату або через Укрпошту можливість скласти акт огляду відсутня. Проте ми завжди прагнемо знайти рішення та допомогти нашим клієнтам у спірних ситуаціях.

Претензії щодо якості, комплектності чи відповідності товару після отримання та огляду поза відділенням перевізника не розглядаються.

Дякуємо за розуміння та довіру до нашого магазину. 💛

Післяплата (накладений платіж)
Для замовлень, оформлених з післяплатою через Нову пошту, передбачена передоплата у розмірі 150 грн.

Передоплата є підтвердженням замовлення та зараховується у його загальну вартість. Під час отримання посилки ви сплачуєте лише залишок суми.

У разі відмови від отримання замовлення передоплата не повертається, оскільки використовується для компенсації витрат на доставку та повернення посилки.

Звертаємо увагу, що при оплаті післяплатою Нова пошта додатково стягує комісію за переказ коштів у розмірі 20 грн + 2% від суми післяплати. Дана комісія встановлюється перевізником та оплачується покупцем під час отримання замовлення.

Дякуємо за розуміння та відповідальне ставлення до оформлення замовлень.`;

export default function InfoPage() {
    const cardClass = "rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-5 sm:p-6";
    const paragraphClass = "mt-3 whitespace-pre-line text-sm leading-relaxed text-[#6E2A39] first:mt-0 sm:text-base";

    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(content);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setIsAdmin(Boolean(getAdminCredentials()));

        InfoPageService.get()
            .then((dto) => setContent(dto.content))
            .catch(() => {});
    }, []);

    const startEditing = () => {
        setDraft(content);
        setIsEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            const dto = await InfoPageService.update(draft);
            setContent(dto.content);
            setIsEditing(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ShopLayout>
            <section className="mx-auto max-w-3xl space-y-6 px-5 pb-32 pt-10">
                {isAdmin && (
                    <div className="flex justify-end gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    disabled={saving}
                                    className="rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#6E2A39] transition hover:bg-[#E5DED6] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="rounded-full bg-[#6E2A39] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#F6F4F0] transition hover:bg-[#5b2230] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? "Збереження..." : "Зберегти"}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={startEditing}
                                className="rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#6E2A39] transition hover:bg-[#E5DED6]"
                            >
                                Редагувати
                            </button>
                        )}
                    </div>
                )}

                <div className={cardClass}>
                    {isEditing ? (
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={24}
                            className="w-full resize-y rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] p-4 text-sm leading-relaxed text-[#6E2A39] outline-none focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15"
                        />
                    ) : (
                        content.split(/\n\n+/).map((paragraph, index) => (
                            <p key={index} className={paragraphClass}>
                                {paragraph}
                            </p>
                        ))
                    )}
                </div>
            </section>
        </ShopLayout>
    );
}
