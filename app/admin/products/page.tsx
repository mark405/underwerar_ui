"use client";

import {useState} from "react";
import {ProductDTO} from "@/app/types/product";
import {ProductService} from "@/app/api/product";
import {ProductsGrid} from "@/app/components/ProductsGrid";
import {ProductDialog} from "@/app/components/dialogs/ProductDialog";

export default function AdminProductsPage() {

    const [selected, setSelected] = useState<ProductDTO | null>(null);
    const [open, setOpen] = useState(false);

    const handleSubmit = async (payload: any) => {
        if (selected) {
            await ProductService.update({id: selected.id, ...payload});
        } else {
            await ProductService.create(payload);
        }

        setOpen(false);
        setSelected(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-6xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-black">Товари</h1>

                    <button
                        onClick={() => {
                            setSelected(null);
                            setOpen(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                        + Створити
                    </button>
                </div>

                <ProductsGrid
                    onEdit={(p) => {
                        setSelected(p);
                        setOpen(true);
                    }}
                />

                <ProductDialog
                    open={open}
                    selected={selected}
                    onClose={() => setOpen(false)}
                    onSubmit={handleSubmit}
                />

            </div>
        </div>
    );
}