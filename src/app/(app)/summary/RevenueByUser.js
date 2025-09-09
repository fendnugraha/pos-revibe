"use client";
import axios from "@/libs/axios";
import { formatDate, formatNumber, todayDate } from "@/libs/format";
import { useCallback, useEffect, useState } from "react";

const RevenueByUser = ({ startDate, endDate }) => {
    const [revenue, setRevenue] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRevenue = useCallback(
        async (url = `/api/get-revenue-by-user/${startDate}/${endDate}`) => {
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

    return (
        <div className="card p-4">
            <h1 className="card-title">
                Revenue By User
                <span className="card-subtitle">
                    Periode: {formatDate(startDate)} - {formatDate(endDate)}
                </span>
            </h1>
            <div className="overflow-x-auto">
                <table className="w-full text-xs table">
                    <thead>
                        <tr>
                            <th className="text-left">Teknisi</th>
                            <th className="text-center">Repaired (Unit)</th>
                            <th className="text-right">Jasa Service</th>
                        </tr>
                    </thead>
                    <tbody>
                        {revenue?.length > 0 ? (
                            revenue?.map((item, index) => (
                                <tr key={index}>
                                    <td className="">{item.technician?.name}</td>
                                    <td className="text-center">{formatNumber(item.total_orders)}</td>
                                    <td className="text-right">{formatNumber(item.total_fee)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th className="text-left">Total</th>
                            <th className="text-center">{formatNumber(revenue?.reduce((total, item) => total + item.total_orders, 0))}</th>
                            <th className="text-right">{formatNumber(revenue?.reduce((total, item) => total + Number(item.total_fee), 0))}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default RevenueByUser;
