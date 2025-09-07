"use client";
import { use, useCallback, useEffect, useState } from "react";
import axios from "@/libs/axios";
import MainPage from "@/app/(app)/main";
import { QRCodeSVG } from "qrcode.react";

const OrderNotes = ({ params }) => {
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

    return (
        <MainPage
            headerTitle={
                <>
                    Serivce Order <span className="text-slate-400 font-normal">/ Nota Order</span>
                </>
            }
        >
            <div id="print-area" className="p-4 bg-white w-[300px]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">
                        Re<span className="text-red-500">V</span>IBE ID
                    </h1>
                    <small className="text-slate-400">Phone Service & Accessories</small>
                    <h1 className="text-sm text-slate-500 mt-2">{order_number}</h1>
                    <h1 className="text-xs text-slate-500">{formatLongDate(order.date_issued)} </h1>
                </div>
                <div className="text-xs text-slate-500 flex justify-between mt-8">
                    <h1 className="text-sm font-bold text-slate-500">{order.contact?.name}</h1>
                    <h1>{order.phone_number}</h1>
                </div>
                <div>
                    <hr className="mt-2 border-slate-300 border-dashed" />
                    <small className="text-slate-500">Type HP</small>
                    <h1 className="text-sm text-slate-700 font-bold mb-4">{order.phone_type?.toUpperCase()}</h1>
                    <small className="text-slate-500">Keluhan/Problem</small>
                    <h1 className="text-sm text-slate-700 ">{order.description}</h1>
                    <hr className="my-2 border-slate-300 border-dashed" />
                </div>
                <div className="flex flex-col gap-2 items-center justify-center">
                    <small className="text-slate-500">Scan QR Code</small>
                    <QRCodeSVG value={`${typeof window !== "undefined" ? window.location.origin : ""}/order/tracking/${order.order_number}`} size={200} />
                    <small className="text-slate-500">{order.order_number}</small>

                    <small className="text-slate-500">{"***"}</small>
                </div>
            </div>
            <button onClick={() => window.print()} className="mt-4 bg-slate-700 text-white px-4 py-2 rounded no-print">
                Cetak Nota
            </button>
        </MainPage>
    );
};

export default OrderNotes;
