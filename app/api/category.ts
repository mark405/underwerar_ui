import { api } from "./api";
import {CategoryCreateRequest, CategoryDTO, CategoryUpdateRequest} from "@/app/types/category";

export const CategoryService = {
    findAll: async (parentId?: number) => {
        const res = await api.get("/category", {
            params: { ...(parentId !== undefined ? {parentId} : {}) },
        });

        return res.data as CategoryDTO[];
    },
    findOne: async (id: number) => {
        const res = await api.get(`/category/${id}`);

        return res.data as CategoryDTO;
    },
    create: async (data: CategoryCreateRequest) => {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify({ name: data.name })], {
            type: "application/json",
        }));

        if (data.file) {
            formData.append("file", data.file);
        }

        return api.post("/category/admin/create", formData);
    },

    update: async (data: CategoryUpdateRequest) => {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify({ name: data.name })], {
            type: "application/json",
        }));

        if (data.file) {
            formData.append("file", data.file);
        }

        return api.put(`/category/admin/update/${data.id}`, formData);
    },
};