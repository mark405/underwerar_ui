export interface CategoryDTO {
    id: number;
    name: string;
    image?: string | null;
    parent?: CategoryDTO | null;
}

export interface CategoryCreateRequest {
    name: string;
    file?: File;
    parentId?: number;
}

export interface CategoryUpdateRequest {
    id: number;
    name: string;
    file?: File;
}