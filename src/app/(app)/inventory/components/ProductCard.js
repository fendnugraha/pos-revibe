import formatNumber from "@/libs/formatNumber";
import { BoxesIcon, PlusCircleIcon, ShoppingCartIcon } from "lucide-react";

const ProductCard = ({ product, onAddToCart }) => {
    return (
        <div className="group hover:bg-yellow-100 border border-slate-200 flex justify-center gap-2 items-center bg-white p-2 rounded-2xl hover:drop-shadow-xs">
            <div className="w-[50px] bg-slate-400 rounded-lg h-[50px] flex justify-center items-center">
                <BoxesIcon size={20} className="text-slate-100" />
            </div>
            <div className="flex flex-col justify-between h-full w-full">
                <div>
                    <h1 className="text-xs font-bold">{product?.name.toUpperCase()}</h1>
                    <span className="text-xs text-gray-500">Stock: {product?.end_stock}</span>
                </div>
                <div className="flex justify-between items-end w-full">
                    <h1 className="text-sm font-bold">
                        <span className="text-xs font-light">Rp</span> {formatNumber(product?.price)}
                    </h1>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="group-hover:scale-125 hover:text-green-500 transition-transform duration-300 ease-out flex items-center gap-1 text-green-600 cursor-pointer"
                    >
                        <PlusCircleIcon size={20} className="inline" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
