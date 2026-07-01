"use client";

import {useEffect, useState} from "react";
import {CategoryDTO} from "@/app/types/category";

interface CategoryDialogProps {
    open: boolean;
    selected: CategoryDTO | null;
    parentName?: string | null;
    onClose: () => void;
    onSubmit: (name: string) => void;
}

export function CategoryDialog({open, selected, parentName = null, onClose, onSubmit}: CategoryDialogProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setName(selected?.name ?? "");
            setError("");
        }
    }, [open, selected]);

    if (!open) {
        return null;
    }

    const handleSubmit = () => {
        if (!name.trim()) {
            setError("Введіть назву категорії");
            return;
        }

        onSubmit(name.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#6E2A39]/40 px-3 backdrop-blur-sm sm:px-4">
            <div className="w-full max-w-md rounded-[1.25rem] border border-[#E5DED6] bg-[#F6F4F0] p-4 text-[#6E2A39] shadow-2xl sm:rounded-[2rem] sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#E5DED6] pb-4 sm:mb-6">
                    <div>
                        <h2 className="font-serif text-xl font-bold text-[#6E2A39] sm:text-2xl">
                            {selected ? "Редагувати категорію" : "Створити категорію"}
                        </h2>

                        {parentName && !selected && (
                            <p className="mt-1 text-sm text-[#8A766C]">
                                Підкатегорія: {parentName}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 rounded-full border border-[#E5DED6] bg-[#F1ECE5] px-3 py-1 text-xl text-[#6E2A39] transition hover:bg-[#E5DED6]"
                        style={{cursor: "pointer"}}
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <input
                        className="w-full rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-3 text-sm text-[#6E2A39] outline-none transition placeholder:text-[#8A766C] focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15"
                        placeholder="Назва категорії"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSubmit();
                            }
                        }}
                    />

                    {error && (
                        <p className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-[#E5DED6] pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-full border border-[#E5DED6] bg-[#F6F4F0] px-5 py-2.5 text-sm font-medium text-[#6E2A39] transition hover:bg-[#E5DED6] sm:w-auto"
                            style={{cursor: "pointer"}}
                        >
                            Скасувати
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full rounded-full bg-[#6E2A39] px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#F6F4F0] transition hover:bg-[#5b2230] sm:w-auto"
                            style={{cursor: "pointer"}}
                        >
                            Зберегти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
