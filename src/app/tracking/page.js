"use client";
import InputGroup from "@/components/InputGroup";
import StatusBadge from "@/components/StatusBadge";
import axios from "@/libs/axios";
import { formatDateTime } from "@/libs/format";
import { SearchIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

const TrackingOrder = () => {
    const [search, setSearch] = useState("");
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");

    const fetchOrders = useCallback(async () => {
        try {
            const response = await axios.get("/api/tracking-orders", {
                params: {
                    search: search,
                },
            });
            setOrders(response.data.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setError(error.response?.data?.message || "Something went wrong.");
        }
    }, [search]);

    useEffect(() => {
        if (search === "") {
            setOrders([]);
        }
    }, [search]);
    return (
        <div className="flex flex-col items-center justify-center gap-4 h-screen">
            <Image src="/revibe-logo.png" alt="Revibe Logo" className="inline" width={100} height={24} priority />
            <h1 className="text-3xl font-bold mb-4">Order Tracking</h1>
            <div className="card p-4 w-full">
                <InputGroup
                    type="search"
                    maxWidth="w-fit"
                    InputIcon={<SearchIcon size={18} />}
                    onChange={(e) => setSearch(e.target.value)}
                    value={search}
                    onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
                    placeholder="Masukan No. HP/Order"
                />
                {orders.length > 0 && search !== "" ? (
                    <>
                        <p className="text-center mt-4">
                            Menampilkan {orders.length} order untuk {search}.
                        </p>
                        <table className="w-full table mt-4">
                            <thead>
                                <tr className="">
                                    <th className="text-center">Order Number</th>
                                    <th className="text-center">Tanggal Masuk</th>
                                    <th className="text-center">Nama Customer</th>
                                    <th className="text-center">Tipe Ponsel</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-center">Update Terakhir</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, index) => (
                                    <tr key={index}>
                                        <td className="text-center">{order.order_number}</td>
                                        <td className="text-center">{formatDateTime(order.date_issued)}</td>
                                        <td className="text-center">{order.contact?.name}</td>
                                        <td className="">{order.phone_type}</td>
                                        <td className="text-center">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="text-center">{formatDateTime(order.updated_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    error && <p className="text-center text-red-500 italic mt-4">{error}</p>
                )}
            </div>
        </div>
    );
};

export default TrackingOrder;
