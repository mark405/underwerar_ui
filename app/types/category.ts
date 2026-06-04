export interface CategoryDTO {
    id: number;
    name: string;
    image?: string | null;
}

export interface CategoryCreateRequest {
    name: string;
    file?: File;
}

export interface CategoryUpdateRequest {
    id: number;
    name: string;
    file?: File;
}