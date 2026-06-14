"use client";

import {AdminAuthGuard} from "@/app/components/AdminAuthGuard";
import {ProductsCatalog} from "@/app/components/ProductsCatalog";

export default function AdminProductsPage() {
    return (
        <AdminAuthGuard>
            <ProductsCatalog isAdmin/>
        </AdminAuthGuard>
    );
}