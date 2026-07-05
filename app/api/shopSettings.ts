import {api} from "./api";
import {ShopSettingsDTO} from "@/app/types/shopSettings";

export const ShopSettingsService = {
    get: async () => {
        const res = await api.get("/shop-settings");

        return res.data as ShopSettingsDTO;
    },
    update: async (pickupEnabled: boolean) => {
        const res = await api.put("/shop-settings/admin", {pickupEnabled});

        return res.data as ShopSettingsDTO;
    },
};
