"use client";
import MainPage from "@/app/(app)/main";
import axios from "@/libs/axios";
import formatDateTime from "@/libs/formatDateTime";
import formatNumber from "@/libs/formatNumber";
import { use, useCallback, useEffect, useState } from "react";

const OrderInvoice = ({ params }) => {
    const { order_number } = use(params);
    const [order, setOrder] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const fetchOrder = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/get-order-by-order-number/${order_number}`);
            setOrder(response.data.data);
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setIsLoading(false);
        }
    }, [order_number]);

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
    const maskPhoneNumber = (phoneNumber) => {
        return phoneNumber?.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    };
    const totalPrice = order.transaction?.stock_movements?.reduce((total, part) => total + part.price * -part.quantity, 0);
    console.log(order);
    return (
        <>
            {isLoading && (
                <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-black/30 backdrop-blur-sm z-50">
                    <h1 className="text-2xl font-bold text-slate-700 text-shadow-2xs">Loading data ...</h1>
                </div>
            )}
            <button onClick={() => window.print()} className="fixed bottom-4 right-4 bg-slate-700 hover:bg-slate-800 text-white py-2 px-4 rounded">
                Cetak Invoice
            </button>
            <div id="print-area" className="p-6 bg-white md:mx-8 lg:mx-12 sm:mx-4 rounded-3xl">
                <div className="grid grid-cols-2 my-4 pb-8">
                    <div>
                        <h1 className="text-2xl font-bold">{process.env.NEXT_PUBLIC_APP_NAME || "Revibe ID"}</h1>
                        <p className="text-xs text-slate-500">{process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Bandung, Jawa Barat, ID, 40375"}</p>
                        <small className="text-slate-400">Phone Service & Accessories</small>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-right">Invoice</h1>
                    </div>
                </div>
                <div className="grid grid-cols-2 mb-8">
                    <div>
                        <h1 className="font-bold text-sm">Invoice Number</h1>
                        <h1 className="text-slate-500 text-sm">{order?.order_number}</h1>
                        <h1 className="font-bold text-sm">Tanggal Order</h1>
                        <h1 className="text-slate-500 text-sm">{formatLongDate(order?.date_issued)}</h1>
                    </div>
                </div>
                <div className="grid grid-cols-2 mb-8">
                    <div>
                        <h1 className="font-bold text-sm">Ditujukan Kepada</h1>
                        <h1 className="text-red-500 text-sm font-bold">{order?.contact?.name?.toUpperCase()}</h1>
                        <h1 className="text-slate-500 text-sm">{maskPhoneNumber(order?.contact?.address)}</h1>
                        <h1 className="text-slate-500 text-sm">{maskPhoneNumber(order?.contact?.phone_number)}</h1>
                    </div>
                    <div>
                        <h1 className="font-bold text-sm">Device (Phone)</h1>
                        <h1 className="text-red-500 text-lg font-bold">{order?.phone_type?.toUpperCase()}</h1>
                    </div>
                </div>
                <div>
                    <table className="table-auto border-collapse w-full text-xs">
                        <thead>
                            <tr className="border border-slate-300 text-blue-500">
                                <th className="p-2 border border-slate-300">Deskripsi</th>
                                <th className="p-2 border border-slate-300 w-16">Qty</th>
                                <th className="p-2 border border-slate-300 ">Harga</th>
                                <th className="p-2 border border-slate-300">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order?.transaction?.stock_movements?.map((part) => (
                                <tr className="border border-slate-300" key={part.id}>
                                    <td className="py-3 px-1.5 border border-slate-300">
                                        {part.product?.code} - {part.product?.name}
                                    </td>
                                    <td className="py-3 px-1.5 border border-slate-300 text-center">{formatNumber(-part.quantity)}</td>
                                    <td className="py-3 px-1.5 border border-slate-300 text-end">{formatNumber(part.price)}</td>
                                    <td className="py-3 px-1.5 border border-slate-300 text-end">{formatNumber(part.price * -part.quantity)}</td>
                                </tr>
                            ))}
                            {order?.journal?.service_fee?.credit > 0 && (
                                <tr className="border border-slate-300">
                                    <td className="py-3 px-1.5 border border-slate-300" colSpan={3}>
                                        Biaya Jasa Service
                                    </td>
                                    <td className="py-3 px-1.5 border border-slate-300 text-end">{formatNumber(order?.journal?.service_fee?.credit)}</td>
                                </tr>
                            )}

                            {order?.journal?.sales_discount?.debit > 0 && (
                                <tr className="border border-slate-300">
                                    <td className="py-3 px-1.5 border border-slate-300" colSpan={3}>
                                        Discount (Rp)
                                    </td>
                                    <td className="py-3 px-1.5 border border-slate-300 text-end text-red-500">
                                        -{formatNumber(order?.journal?.sales_discount?.debit)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="flex flex-col items-end mt-4">
                        <h1 className="font-bold text-sm">
                            Total:{" "}
                            {formatNumber(
                                Number(totalPrice || 0) + Number(order?.journal?.service_fee?.credit || 0) - Number(order?.journal?.sales_discount?.debit || 0)
                            )}
                        </h1>
                        <h1 className="text-slate-500 mt-4 text-sm">Teknisi: {order?.technician?.name}</h1>
                    </div>
                    <hr className="my-4 border-dashed border-slate-300" />

                    <div className="flex justify-between mb-8">
                        <div>
                            <h1 className="font-bold text-sm">Metode Pembayaran</h1>
                            <h1 className="text-slate-500 text-sm mb-2">{order?.payment_method}</h1>
                            <h1 className="font-bold text-sm">Tanggal Selesai</h1>
                            <h1 className="text-slate-500 text-sm">{formatLongDate(order?.updated_at)}</h1>
                        </div>
                        <div>
                            <h1 className="font-bold text-right">Catatan</h1>
                            <h1 className="text-slate-500 text-sm">{maskPhoneNumber(order?.description)}</h1>
                        </div>
                    </div>
                    <div className="flex justify-center pt-12">
                        <h1 className="text-sm text-slate-500">Terima Kasih Atas Kepercayaannya</h1>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderInvoice;
