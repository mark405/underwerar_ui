"use client";

import {InfoContent} from "@/app/components/InfoContent";
import {AdminAuthGuard} from "@/app/components/AdminAuthGuard";

export default function AdminInfoPage() {
    return (
        <AdminAuthGuard>
            <InfoContent isAdmin/>
        </AdminAuthGuard>
    );
}
