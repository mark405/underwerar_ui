"use client";

import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {ProductDTO} from "@/app/types/product";

const CART_STORAGE_KEY = "zuna-cart";

export type CartItem = {
    product: ProductDTO;
    quantity: number;
};

interface CartContextValue {
    items: CartItem[];
    totalItems: number;
    addToCart: (product: ProductDTO) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const loadCartFromStorage = (): CartItem[] => {
    if (typeof window === "undefined") {
        return [];
    }

    const rawCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!rawCart) {
        return [];
    }

    try {
        return JSON.parse(rawCart) as CartItem[];
    } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
        return [];
    }
};

export function CartProvider({children}: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        setItems(loadCartFromStorage());
        setInitialized(true);
    }, []);

    useEffect(() => {
        if (!initialized) {
            return;
        }

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items, initialized]);

    const addToCart = (product: ProductDTO) => {
        setItems((prev) => {
            const existingItem = prev.find((item) => item.product.id === product.id);

            if (existingItem) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? {...item, quantity: item.quantity + 1}
                        : item
                );
            }

            return [...prev, {product, quantity: 1}];
        });
    };

    const removeFromCart = (productId: number) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
    };

    const totalItems = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items]
    );

    return (
        <CartContext.Provider
            value={{
                items,
                totalItems,
                addToCart,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }

    return context;
}