"use client";

import axios from "@/libs/axios";
import { formatDate, formatNumber, todayDate } from "@/libs/format";
import { useCallback, useEffect, useState } from "react";

const WarehouseBalance = ({}) => {
    const [warehouseBalance, setWarehouseBalance] = useState([]);
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(todayDate());
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });

    const fetchWarehouseBalance = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-warehouse-balance/${endDate}`);
            setWarehouseBalance(response.data.data);
        } catch (error) {
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    }, [endDate]);

    useEffect(() => {
        fetchWarehouseBalance();
    }, [fetchWarehouseBalance]);
    return (
        <div className="card p-4">
            <h1 className="card-title">
                Warehouse Balance
                <span className="card-subtitle">Periode: {formatDate(endDate)}</span>
            </h1>
            <div className="overflow-x-auto">
                <table className="w-full text-xs table">
                    <thead>
                        <tr>
                            <th className="text-left">Cabang</th>
                            <th className="text-right">Kas (Uang Tunai)</th>
                            <th className="text-right">Bank</th>
                            <th className="text-right">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        {warehouseBalance?.warehouses?.length > 0 ? (
                            warehouseBalance?.warehouses?.map((item, index) => (
                                <tr key={index}>
                                    <td className="">{item.name}</td>
                                    <td className="text-center">{formatNumber(item.cash)}</td>
                                    <td className="text-right">{formatNumber(item.bank)}</td>
                                    <td className="text-right">{formatNumber(item.cash + item.bank)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="text-center">
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th className="text-left">Total</th>
                            <th className="text-center">{formatNumber(warehouseBalance?.totalCash)}</th>
                            <th className="text-right">{formatNumber(warehouseBalance?.totalBank)}</th>
                            <th className="text-right">{formatNumber(warehouseBalance?.totalCash + warehouseBalance?.totalBank)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default WarehouseBalance;
