import axios from "axios";

const ADMIN_CREDENTIALS_STORAGE_KEY = "admin-credentials";
const ADMIN_AUTH_TTL_MS = 30 * 60 * 1000;

export type AdminCredentials = {
    login: string;
    password: string;
};

type StoredAdminCredentials = AdminCredentials & {
    expiresAt: number;
};

export const saveAdminCredentials = (credentials: AdminCredentials) => {
    const storedCredentials: StoredAdminCredentials = {
        ...credentials,
        expiresAt: Date.now() + ADMIN_AUTH_TTL_MS,
    };

    localStorage.setItem(
        ADMIN_CREDENTIALS_STORAGE_KEY,
        JSON.stringify(storedCredentials)
    );
};

export const getAdminCredentials = (): AdminCredentials | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const rawCredentials = localStorage.getItem(ADMIN_CREDENTIALS_STORAGE_KEY);

    if (!rawCredentials) {
        return null;
    }

    try {
        const storedCredentials = JSON.parse(rawCredentials) as StoredAdminCredentials;

        if (Date.now() > storedCredentials.expiresAt) {
            localStorage.removeItem(ADMIN_CREDENTIALS_STORAGE_KEY);
            return null;
        }

        return {
            login: storedCredentials.login,
            password: storedCredentials.password,
        };
    } catch {
        localStorage.removeItem(ADMIN_CREDENTIALS_STORAGE_KEY);
        return null;
    }
};

export const clearAdminCredentials = () => {
    localStorage.removeItem(ADMIN_CREDENTIALS_STORAGE_KEY);
};

const createBasicAuthHeader = ({login, password}: AdminCredentials) => {
    return `Basic ${btoa(`${login}:${password}`)}`;
};

const isAdminRequest = (url?: string) => {
    if (!url) {
        return false;
    }

    return url.includes("/admin");
};

export const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
});

api.interceptors.request.use((config) => {
    if (!isAdminRequest(config.url)) {
        return config;
    }

    const credentials = getAdminCredentials();

    if (!credentials) {
        return config;
    }

    config.headers.Authorization = createBasicAuthHeader(credentials);

    return config;
});