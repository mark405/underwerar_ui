import {CategoryDTO} from "@/app/types/category";

export interface ProductDTO {
    id: number;
    name: string;
    image?: string | null;
    images?: string[] | null;

    circumference?: string | null;
    cup?: string | null;

    color?: string | null;
    material?: string | null;
    features?: string | null;

    price?: number | null;
    inStock?: boolean | null;

    size?: string | null;

    category: CategoryDTO;
}

export interface ProductFilters {
    name?: string;
    circumference?: string;
    cup?: string;
    color?: string;
    material?: string;
    features?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    bustModel?: string;
    sizeFilter?: string;
    briefStyle?: string;
    categoryId?: number;
}

export interface ProductCreateRequest {
    name: string;

    circumference?: string;
    cup?: string;

    color?: string;
    material?: string;
    features?: string;

    price?: number;

    size?: string;
    briefStyle?: string;
    bustModel?: string;
    categoryId?: number;

    mainImage?: File;
    images?: File[];
}

export interface ProductUpdateRequest {
    id: number;
    name: string;

    circumference?: string;
    cup?: string;

    color?: string;
    material?: string;
    features?: string;

    price?: number;
    inStock?: boolean;

    size?: string;
    briefStyle?: string;
    bustModel?: string;
    categoryId?: number;

    mainImage?: File;
    images?: File[];
    imagesToDelete?: string[];
}