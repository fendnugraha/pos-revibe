"use client";
import axios from "@/libs/axios";
import { formatDate, formatNumber, todayDate } from "@/libs/format";
import { useCallback, useEffect, useState } from "react";

const RevenueReport = ({ startDate, endDate }) => {
    const [loading, setLoading] = useState(false);
    const [revenue, setRevenue] = useState([]);

    const fetchRevenue = useCallback(
        async (url = `/api/get-revenue-report/${startDate}/${endDate}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url);
                setRevenue(response.data.data);
            } catch (error) {
                console.error("Error fetching revenue:", error);
            } finally {
                setLoading(false);
            }
        },
        [startDate, endDate]
    );

    useEffect(() => {
        fetchRevenue();
    }, [fetchRevenue]);

    const calculateTotal = (data, key) => {
        return data.reduce((total, item) => total + item[key], 0);
    };
    return (
        <div className="card p-4">
            <h1 className="card-title">
                Revenue Report
                <span className="card-subtitle">
                    Periode: {formatDate(startDate)} - {formatDate(endDate)}
                </span>
            </h1>
            <div className="overflow-x-auto">
                <table className="w-full text-xs table">
                    <thead>
                        <tr>
                            <th className="">Cabang</th>
                            <th className="">Total Order</th>
                            <th className="">Pendapatan</th>
                            <th className="">Biaya</th>
                            <th className="">Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {revenue?.length > 0 ? (
                            revenue?.map((item, index) => (
                                <tr key={index}>
                                    <td className="">{item.warehouse_name}</td>
                                    <td className="text-center">{formatNumber(item.total_order)}</td>
                                    <td className="text-right">{formatNumber(item.total_revenue)}</td>
                                    <td className="text-right">{formatNumber(item.total_expense)}</td>
                                    <td className="text-right">{formatNumber(item.total_revenue - item.total_cost - item.total_expense)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th className="font-bold">Total</th>
                            <th className="text-center font-bold">{formatNumber(calculateTotal(revenue, "total_order"))}</th>
                            <th className="text-right font-bold">{formatNumber(calculateTotal(revenue, "total_revenue"))}</th>
                            <th className="text-right font-bold">{formatNumber(calculateTotal(revenue, "total_expense"))}</th>
                            <th className="text-right font-bold">
                                {formatNumber(
                                    calculateTotal(revenue, "total_revenue") - calculateTotal(revenue, "total_cost") - calculateTotal(revenue, "total_expense")
                                )}
                            </th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default RevenueReport;
