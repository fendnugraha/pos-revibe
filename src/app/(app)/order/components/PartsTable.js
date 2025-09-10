import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { X } from "lucide-react";

const PartsTable = ({ parts, totalPrice, orderId, fetchOrder, notification, orderStatus }) => {
    const handleDeletePart = async ({ e, orderId, partId }) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`/api/remove-part-from-order/${orderId}`, {
                params: { order_id: orderId, part_id: partId },
            });
            fetchOrder();
            notification({ type: "success", message: response.data.message });
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-xs table">
                    <thead>
                        <tr>
                            <th className="" colSpan="2">
                                Nama Part
                            </th>
                            <th className="">Jumlah</th>
                            <th className="w-16">Harga</th>
                            <th className="">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parts?.stock_movements?.length > 0 ? (
                            parts?.stock_movements?.map((part, index) => (
                                <tr key={index}>
                                    <td>
                                        <button
                                            onClick={(e) => handleDeletePart({ e, orderId: orderId, partId: part.product_id })}
                                            className="p-1 rounded-full bg-red-500 text-white hover:scale-110 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                                            disabled={["Finished", "Completed", "Canceled", "Rejected"].includes(orderStatus)}
                                        >
                                            <X size={10} />
                                        </button>
                                    </td>
                                    <td className="">{part.product?.name}</td>
                                    <td className="text-center">{formatNumber(-part.quantity)}</td>
                                    <td className="text-right">{formatNumber(part.price)}</td>
                                    <td className="text-right">{formatNumber(part.price * -part.quantity)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    Tidak ada pergantian sparepart
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {parts?.stock_movements?.length > 0 && (
                        <tfoot>
                            <tr>
                                <th></th>
                                <th></th>
                                <th className="text-right" colSpan="2">
                                    Total
                                </th>
                                <th className="text-right">{formatNumber(totalPrice)}</th>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </>
    );
};

export default PartsTable;
