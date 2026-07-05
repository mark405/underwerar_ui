import {api} from "./api";
import {EmailPaymentDetailsDTO} from "@/app/types/emailPaymentDetails";

export const EmailPaymentDetailsService = {
    get: async () => {
        const res = await api.get("/email-payment-details/admin");

        return res.data as EmailPaymentDetailsDTO;
    },
    update: async (content: string) => {
        const res = await api.put("/email-payment-details/admin", {content});

        return res.data as EmailPaymentDetailsDTO;
    },
};
