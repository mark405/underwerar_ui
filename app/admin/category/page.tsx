"use client";

import {CategoryCatalog} from "@/app/components/CategoryCatalog";
import {AdminAuthGuard} from "@/app/components/AdminAuthGuard";

export default function AdminCategoryPage() {
    return (
        <AdminAuthGuard>
            <CategoryCatalog isAdmin/>
        </AdminAuthGuard>
    );
}