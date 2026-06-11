import {ProductDTO} from "@/app/types/product";

interface ProductCardProps {
    product: ProductDTO;
    onEdit?: (product: ProductDTO) => void;
}

export function ProductCard({product, onEdit}: ProductCardProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden">

            {product.image && (
                <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${product.image.replace("\\", "/")}`}
                    alt={product.name}
                    className="w-full h-56 object-cover"
                />
            )}

            <div className="p-4 space-y-3">

                {/* NAME */}
                <div className="font-semibold text-lg text-gray-800">
                    {product.name}
                </div>

                {/* PRICE */}
                <div className="text-sm">
                    <span className="font-medium text-gray-700">Ціна: </span>
                    <span className="text-gray-600">
                        {product.price ?? "-"}
                    </span>
                </div>

                {/* CORE INFO */}
                <div className="text-sm space-y-1 text-gray-600">

                    <div>
                        <span className="font-medium text-gray-700">Колір: </span>
                        {product.color ?? "-"}
                    </div>

                    <div>
                        <span className="font-medium text-gray-700">Матеріал: </span>
                        {product.material ?? "-"}
                    </div>

                    <div>
                        <span className="font-medium text-gray-700">Особливості: </span>
                        {product.features ?? "-"}
                    </div>

                </div>

                {/* SIZE INFO */}
                <div className="text-sm space-y-1 text-gray-600">

                    <div>
                        <span className="font-medium text-gray-700">Обхват: </span>
                        {product.circumference ?? "-"}
                    </div>

                    <div>
                        <span className="font-medium text-gray-700">Чашка: </span>
                        {product.cup ?? "-"}
                    </div>

                    <div>
                        <span className="font-medium text-gray-700">Розмір: </span>
                        {product.size ?? "-"}
                    </div>

                </div>

                {/* STYLE INFO */}
                <div className="text-sm space-y-1 text-gray-600">

                    <div>
                        <span className="font-medium text-gray-700">Модель бюста: </span>
                        {product.bustModel ?? "-"}
                    </div>

                    <div>
                        <span className="font-medium text-gray-700">Фасон трусиків: </span>
                        {product.briefStyle ?? "-"}
                    </div>

                </div>

                {/* STOCK + ACTION */}
                <div className="flex items-center justify-between pt-2">

                    <span
                        className={`text-xs font-medium ${
                            product.inStock
                                ? "text-green-600"
                                : "text-red-600"
                        }`}
                    >
                        {product.inStock ? "В наявності" : "Немає в наявності"}
                    </span>

                    {onEdit && (
                        <button
                            onClick={() => onEdit(product)}
                            className="text-sm text-blue-500 hover:text-blue-700"
                        >
                            Редагувати
                        </button>
                    )}
                </div>

                {/* CATEGORY */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                    Категорія: {product.category?.name ?? "-"}
                </div>

            </div>
        </div>
    );
}