import {ProductDTO} from "@/app/types/product";

export interface OrderItemCreateRequest {
    productId: number;
    quantity: number;
}

export interface OrderCreateRequest {
    username: string;
    telephone: string;
    email: string;
    deliveryType: string;
    deliveryAddress?: string;
    contactByPhone: boolean;
    orderItems: OrderItemCreateRequest[];
}

export interface OrderDTO {
    id: number;
    username: string;
    telephone: string;
    email: string;
    deliveryType: string;
    deliveryAddress: string;
    contactByPhone: boolean;
    status: string;
    orderItems: [OrderItemDTO]
}

export interface OrderItemDTO {
    id: number;
    product: ProductDTO;
    quantity: number;
    price: number;
}

export interface OrderUpdateRequest {
    id: number;
    username: string;
    telephone: string;
    email: string;
    deliveryAddress: string;
    status: string;
}