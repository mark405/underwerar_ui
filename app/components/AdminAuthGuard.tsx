"use client";

import {ReactNode, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {getAdminCredentials} from "@/app/api/api";

interface AdminAuthGuardProps {
    children: ReactNode;
}

export function AdminAuthGuard({children}: AdminAuthGuardProps) {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const credentials = getAdminCredentials();

        if (!credentials) {
            router.replace("/admin");
            return;
        }

        setReady(true);
    }, [router]);

    if (!ready) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F6F4F0] text-[#6E2A39]">
                Завантаження...
            </main>
        );
    }

    return <>{children}</>;
}