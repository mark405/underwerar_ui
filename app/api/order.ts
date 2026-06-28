import { api } from "./api";
import {OrderCreateRequest, OrderDTO, OrderUpdateRequest} from "@/app/types/order";

export const OrderService = {
    create: async (data: OrderCreateRequest) => {
        const formData = new FormData();

        formData.append(
            "data",
            new Blob([JSON.stringify(data)], {
                type: "application/json",
            })
        );

        const response = await api.post(
            "/order/create",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },
    findAll: async (params: {
        status?: string;
        page: number;
        size: number;
    }) => {
        const res = await api.get("/order/admin", { params });

        return res.data;
    },
    findOne: async (id: number) => {
        const res = await api.get(`/order/admin/${id}`);
        return res.data as OrderDTO;
    },
    update: async (data: OrderUpdateRequest) => {
        const formData = new FormData();

        formData.append(
            "data",
            new Blob([JSON.stringify({
                username: data.username,
                telephone: data.telephone,
                deliveryAddress: data.deliveryAddress,
                status: data.status,
            })], {
                type: "application/json",
            })
        );

        const response = await api.put(
            `/order/admin/update/${data.id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },
};