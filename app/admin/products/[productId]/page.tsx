"use client";

import {ProductDetails} from "@/app/components/ProductDetails";
import {AdminAuthGuard} from "@/app/components/AdminAuthGuard";

export default function AdminProductDetailsPage() {
    return (
        <AdminAuthGuard>
            <ProductDetails isAdmin/>
        </AdminAuthGuard>
    );
}