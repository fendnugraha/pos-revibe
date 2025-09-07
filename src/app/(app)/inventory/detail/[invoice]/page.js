"use client";
import MainPage from "@/app/(app)/main";
import Dropdown from "@/components/Dropdown";
import Notification from "@/components/Notification";
import axios from "@/libs/axios";
import formatDateTime from "@/libs/formatDateTime";
import formatNumber from "@/libs/formatNumber";
import { ArrowLeftIcon, Ellipsis, EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";

const TransactionDetail = ({ params }) => {
    const { invoice } = use(params);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [order, setOrder] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchOrder = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/get-trx-by-invoice/${invoice}`);
            setOrder(response.data.data);
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setIsLoading(false);
        }
    }, [invoice]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const formatLongDate = (date) => {
        // September 7, 2023
        const formattedDate = new Date(date).toLocaleDateString("id-ID", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });

        return formattedDate;
    };
    const calculateTotalTransaction = () => {
        let total = 0;
        order?.stock_movements?.forEach((item) => {
            total += item.transaction_type === "Purchase" ? item.cost * item.quantity : -item.price * item.quantity;
        });
        return total;
    };

    const confirmDeliveryStatus = async () => {
        try {
            const response = await axios.put(`/api/update-trx-status/`, { id: order.id, status: "Confirmed" });
            setNotification({ type: "success", message: response.data.message });
            fetchOrder();
        } catch (error) {
            console.error("Error updating order status:", error);
            setNotification({ type: "error", message: error.response.data.message });
        }
    };
    return (
        <MainPage
            headerTitle={
                <>
                    Transaction <span className="text-slate-400 font-normal">/ Detail</span>
                </>
            }
        >
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="flex items-center gap-2 mb-4">
                <Link className="underline hover:text-teal-500" href="/inventory">
                    <ArrowLeftIcon />
                </Link>
                <h1 className="text-slate-500">
                    Invoice: <span className="font-bold">{invoice}</span>{" "}
                </h1>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-3xl drop-shadow-sm">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="font-bold">Invoice</td>
                                <td>: {order?.invoice}</td>
                            </tr>
                            <tr>
                                <td className="font-bold">Tanggal Transaksi</td>
                                <td>: {formatLongDate(order?.date_issued)}</td>
                            </tr>
                            <tr>
                                <td className="font-bold">Tipe Transaksi</td>
                                <td>: {order?.transaction_type === "Purchase" ? "Pembelian Barang" : "Penjualan Barang"}</td>
                            </tr>
                            <tr>
                                <td className="font-bold">Cabang</td>
                                <td>: {order?.warehouse?.name}</td>
                            </tr>
                            <tr>
                                <td className="font-bold">Status</td>
                                <td>
                                    : {order?.status} <span className="text-slate-400">({formatDateTime(order?.updated_at)})</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div>
                        <h1 className="text-slate-500 font-bold text-sm">{order?.transaction_type === "Purchase" ? "Supplier" : "Customer"}</h1>
                        <h1 className="text-slate-500 text-sm mb-4">{order?.contact?.name}</h1>
                        <h1 className="text-slate-500 font-bold text-sm">Total Transaksi</h1>
                        <h1 className="text-slate-500 font-bold text-3xl">Rp {formatNumber(calculateTotalTransaction())}</h1>
                    </div>
                </div>
                {order?.status === "On Delivery" && (
                    <button type="button" onClick={() => confirmDeliveryStatus()} className="btn btn-primary">
                        Konfirmasi Penerimaan Barang
                    </button>
                )}
                <div>
                    <table className="w-full text-xs table">
                        <thead>
                            <tr className="text-left">
                                <th></th>
                                <th>Nama Barang</th>
                                <th>Qty</th>
                                <th>Harga</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.stock_movements?.length > 0 ? (
                                order?.stock_movements?.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-100">
                                        <td className="text-center w-12">
                                            <Dropdown align="left" trigger={<EllipsisIcon className="w-4 h-4" />}>
                                                <ul>
                                                    <li>
                                                        <button className="text-start px-2 py-1 min-w-20 hover:underline hover:bg-slate-200">
                                                            Edit Barang
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="text-start px-2 py-1 min-w-20 hover:underline hover:bg-slate-200">Return</button>
                                                    </li>
                                                </ul>
                                            </Dropdown>
                                        </td>
                                        <td>
                                            <span className="text-slate-400">{item.product?.code}</span> {item.product?.name}
                                        </td>
                                        <td className="text-center">{formatNumber(item.transaction_type === "Purchase" ? item.quantity : -item.quantity)}</td>
                                        <td className="text-right">{formatNumber(item.transaction_type === "Purchase" ? item.cost : item.price)}</td>
                                        <td className="text-right">
                                            {formatNumber(item.transaction_type === "Purchase" ? item.cost * item.quantity : -item.price * item.quantity)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        Tidak ada transaksi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan="4" className="text-right font-bold">
                                    Total
                                </th>
                                <th className="text-right font-bold">{formatNumber(calculateTotalTransaction())}</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </MainPage>
    );
};

export default TransactionDetail;
