export type ProductOption = {
    label: string;
    value: string;
};

export const colorOptions: ProductOption[] = [
    {label: "Чорний", value: "black"},
    {label: "Білий", value: "white"},
    {label: "Бежевий", value: "beige"},
    {label: "Червоний", value: "red"},
    {label: "Бордо", value: "burgundy"},
    {label: "Рожевий", value: "pink"},
    {label: "Синій", value: "blue"},
    {label: "Зелений", value: "green"},
    {label: "Фіолетовий", value: "purple"},
    {label: "Молочний", value: "milky"},
];

export const materialOptions: ProductOption[] = [
    {label: "Бавовна", value: "cotton"},
    {label: "Мікрофібра", value: "microfiber"},
    {label: "Мереживо", value: "lace"},
    {label: "Сітка", value: "mesh"},
    {label: "Атлас", value: "satin"},
    {label: "Шовк", value: "silk"},
];

export type PriceOption = {
    label: string;
    minPrice?: number;
    maxPrice?: number;
};

export const featureOptions: ProductOption[] = [
    {label: "Безшовна", value: "seamless"},
    {label: "Мереживна", value: "lace"},
    {label: "Базова", value: "basic"},
    {label: "Еротична", value: "erotic"},
    {label: "Коригуюча", value: "shaping"},
    {label: "Для великого бюста", value: "large_bust"},
    {label: "Для годування", value: "nursing"},
    {label: "Спортивна", value: "sport"},
];

export const priceOptions: PriceOption[] = [
    {label: "до 500 грн", maxPrice: 500},
    {label: "500–1000 грн", minPrice: 500, maxPrice: 1000},
    {label: "1000–2000 грн", minPrice: 1000, maxPrice: 2000},
    {label: "2000+ грн", minPrice: 2000},
];

export const circumferenceOptions: ProductOption[] = [
    {label: "65", value: "65"},
    {label: "70", value: "70"},
    {label: "75", value: "75"},
    {label: "80", value: "80"},
    {label: "85", value: "85"},
    {label: "90", value: "90"},
    {label: "95", value: "95"},
    {label: "100", value: "100"},
    {label: "105", value: "105"},
    {label: "115", value: "115"},
];

export const cupOptions: ProductOption[] = [
    {label: "A", value: "A"},
    {label: "B", value: "B"},
    {label: "C", value: "C"},
    {label: "D", value: "D"},
    {label: "E", value: "E"},
    {label: "F", value: "F"},
    {label: "G", value: "G"},
    {label: "H", value: "H"},
    {label: "I", value: "I"},
];

export const sizeOptions: ProductOption[] = [
    {label: "S", value: "S"},
    {label: "M", value: "M"},
    {label: "L", value: "L"},
    {label: "XL", value: "XL"},
    {label: "2XL", value: "2XL"},
    {label: "3XL", value: "3XL"},
    {label: "4XL", value: "4XL"},
    {label: "5XL", value: "5XL"},
    {label: "6XL", value: "6XL"},
    {label: "7XL", value: "7XL"},
    {label: "8XL", value: "8XL"},
    {label: "9XL", value: "9XL"},
];