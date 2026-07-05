import {api} from "./api";
import {InfoPageContentDTO} from "@/app/types/infoPage";

export const InfoPageService = {
    get: async () => {
        const res = await api.get("/info-page");

        return res.data as InfoPageContentDTO;
    },
    update: async (content: string) => {
        const res = await api.put("/info-page/admin", {content});

        return res.data as InfoPageContentDTO;
    },
};
