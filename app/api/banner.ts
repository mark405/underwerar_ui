import {api} from "./api";
import {BannerDTO} from "@/app/types/banner";

export const BannerService = {
    findAll: async () => {
        const res = await api.get("/banner");

        return res.data as BannerDTO[];
    },
    create: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/banner/admin/create", formData);

        return res.data as BannerDTO;
    },
    delete: async (id: number) => {
        await api.delete(`/banner/admin/${id}`);
    },
};
