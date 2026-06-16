import {api} from "./api";

export const NovaPostService = {
    getAreas: async () => {
        const { data } = await api.get("/nova-post/getSettlementAreas");
        return data;
    },

    getSettlements: async (
        areaRef: string,
        search?: string,
        page = 1
    ) => {
        const query = new URLSearchParams();

        query.append("area", areaRef);
        query.append("page", String(page));

        if (search) {
            query.append("search", search);
        }

        const { data } = await api.get(
            `/nova-post/getSettlements?${query.toString()}`
        );

        return data;
    },

    getWarehouses: async (
        cityRef: string,
        search?: string,
        page = 1,
        limit = 20
    ) => {
        const query = new URLSearchParams();

        query.append("city", cityRef);
        query.append("page", String(page));
        query.append("limit", String(limit));

        if (search) {
            query.append("search", search);
        }

        const { data } = await api.get(
            `/nova-post/getWarehouses?${query.toString()}`
        );

        return data;
    },
};