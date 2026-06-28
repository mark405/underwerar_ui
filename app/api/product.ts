import {api} from "./api";
import {ProductCreateRequest, ProductDTO, ProductFilters, ProductUpdateRequest} from "@/app/types/product";

export const ProductService = {
    findAll: async (
        page = 0,
        size = 20,
        filters: ProductFilters = {}
    ) => {
        const res = await api.get("/product", {
            params: {
                page,
                size,
                ...filters,
            },
        });

        return res.data;
    },
    findOne: async (id: number) => {
        const res = await api.get(`/product/${id}`);

        return res.data as ProductDTO;
    },
    create: async (data: ProductCreateRequest) => {
        const formData = new FormData();

        const payload = {
            name: data.name,

            circumference: data.circumference,
            cup: data.cup,

            color: data.color,
            material: data.material,
            features: data.features,

            price: data.price,

            bustModel: data.bustModel,
            size: data.size,
            briefStyle: data.briefStyle,

            categoryId: data.categoryId,
        };

        formData.append(
            "data",
            new Blob([JSON.stringify(payload)], {
                type: "application/json",
            })
        );

        if (data.mainImage) {
            formData.append("mainImage", data.mainImage);
        }

        data.images?.forEach((image) => {
            formData.append("images", image);
        });

        return api.post("/product/admin/create", formData);
    },

    update: async (data: ProductUpdateRequest) => {
        const formData = new FormData();

        const payload = {
            id: data.id,
            name: data.name,

            circumference: data.circumference,
            cup: data.cup,

            color: data.color,
            material: data.material,
            features: data.features,

            price: data.price,
            inStock: data.inStock,

            bustModel: data.bustModel,
            size: data.size,
            briefStyle: data.briefStyle,

            categoryId: data.categoryId,
            imagesToDelete: data.imagesToDelete,
        };

        formData.append(
            "data",
            new Blob([JSON.stringify(payload)], {
                type: "application/json",
            })
        );

        if (data.mainImage) {
            formData.append("mainImage", data.mainImage);
        }

        data.images?.forEach((image) => {
            formData.append("images", image);
        });

        return api.put(`/product/admin/update/${data.id}`, formData);
    },

    remove: async (id: number) => {
        return api.delete(`/product/admin/${id}`);
    },
};