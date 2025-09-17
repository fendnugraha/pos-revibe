"use client";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Modal from "@/components/Modal";
import axios from "@/libs/axios";
import { formatDate, formatNumber, todayDate } from "@/libs/format";
import { Download, Filter } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const RevenueByUser = () => {
    const [startDate, setStartDate] = useState(todayDate());
    const [endDate, setEndDate] = useState(todayDate());

    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);
    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
    };
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
            <div className="flex justify-between items-start">
                <h1 className="card-title">
                    Pendapatan Jasa Service
                    <span className="card-subtitle">
                        Periode: {formatDate(startDate)} - {formatDate(endDate)}
                    </span>
                </h1>
                <div className="flex gap-2">
                    <button className="small-button">
                        <Download size={20} />
                    </button>
                    <button className="small-button" onClick={() => setIsModalFilterJournalOpen(true)}>
                        <Filter size={20} />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-xs table">
                    <thead>
                        <tr>
                            <th className="text-left">Teknisi</th>
                            <th className="text-center">Repaired (Unit)</th>
                            <th className="text-right">Jasa (Rp)</th>
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
            <Modal isOpen={isModalFilterJournalOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                        <Label>Tanggal</Label>
                        <Input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div>
                        <Label>s/d</Label>
                        <Input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            disabled={!startDate}
                        />
                    </div>
                </div>
                <button
                    onClick={() => {
                        fetchRevenue();
                        setIsModalFilterJournalOpen(false);
                    }}
                    className="btn-primary"
                >
                    Submit
                </button>
            </Modal>
        </div>
    );
};

export default RevenueByUser;
