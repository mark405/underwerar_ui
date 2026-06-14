"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {api, getAdminCredentials, saveAdminCredentials} from "@/app/api/api";

export default function AdminLoginPage() {
    const router = useRouter();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setError("");

        if (!login.trim() || !password.trim()) {
            setError("Введіть логін і пароль");
            return;
        }

        setLoading(true);

        try {
            await api.post("/admin/login", {
                login,
                password,
            });

            saveAdminCredentials({
                login,
                password,
            });

            localStorage.setItem("admin-auth", "true");

            router.push("/admin/category");
        } catch {
            setError("Невірний логін або пароль");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const credentials = getAdminCredentials();

        if (!credentials) {
            router.replace("/admin");
            return;
        }

        router.push("/admin/category");
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F6F4F0] px-5 text-[#6E2A39]">
            <section className="w-full max-w-md rounded-[2rem] border border-[#E5DED6] bg-[#F1ECE5] p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="font-serif text-5xl tracking-[0.35em] text-[#6E2A39]">
                        ZUNA
                    </div>
                    <div className="-mt-1 text-xs tracking-[0.45em] text-[#8A766C]">
                        admin
                    </div>
                </div>

                <div className="space-y-4">
                    <input
                        className="w-full rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-3 text-sm text-[#6E2A39] outline-none placeholder:text-[#8A766C] focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15"
                        placeholder="Логін"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />

                    <input
                        type="password"
                        className="w-full rounded-2xl border border-[#E5DED6] bg-[#F6F4F0] px-4 py-3 text-sm text-[#6E2A39] outline-none placeholder:text-[#8A766C] focus:border-[#6E2A39] focus:ring-2 focus:ring-[#6E2A39]/15"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full rounded-full bg-[#6E2A39] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#F6F4F0] transition hover:bg-[#5b2230] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Вхід..." : "Увійти"}
                    </button>
                </div>
            </section>
        </main>
    );
}