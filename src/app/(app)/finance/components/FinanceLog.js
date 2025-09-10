"use client";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Modal from "@/components/Modal";
import Paginator from "@/components/Paginator";
import axios from "@/libs/axios";
import { ArrowBigDown, ArrowBigUp, Eye, EyeIcon, FilterIcon, Trash2Icon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const FinanceLog = ({
    finance,
    fetchFinance,
    loading,
    formatDateTime,
    formatNumber,
    notification,
    handleChangePage,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
    };

    const handleDeleteFinance = async (id) => {
        try {
            const response = await axios.delete(`/api/finance/${id}`);
            notification({ type: "success", message: response.data.message });
            fetchFinance();
        } catch (error) {
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        }
    };
    return (
        <div className="card p-4">
            <div className="flex justify-between items-start">
                <h1 className="card-title mb-4">
                    Finance Log
                    <span className="card-subtitle">
                        Periode: {formatDateTime(startDate)} - {formatDateTime(endDate)}
                    </span>
                </h1>
                <button
                    onClick={() => setIsModalFilterDataOpen(true)}
                    className="bg-white font-bold p-2 rounded-lg border border-gray-300 hover:border-gray-400"
                >
                    <FilterIcon className="size-4" />
                </button>
            </div>
            <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                <div className="mb-4">
                    <Label className="font-bold">Dari</Label>
                    <Input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div className="mb-4">
                    <Label className="font-bold">Sampai</Label>
                    <Input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <button onClick={() => fetchFinance()} disabled={loading} className="btn-primary">
                    Submit
                </button>
            </Modal>
            <div className="mt-2">
                <input
                    type="text"
                    placeholder="Search.."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border w-full p-1 px-4 mb-2 border-slate-300 rounded-xl"
                />
            </div>
            <div className="overflow-x-auto">
                {finance.finance?.data.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border rounded-2xl border-slate-200 mb-2 p-2">
                        <div className="flex gap-2 items-center">
                            <span
                                className={`w-10 h-10 rounded-full ${
                                    item.bill_amount > 0 ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"
                                } flex justify-center items-center`}
                            >
                                {item.bill_amount > 0 ? <ArrowBigUp size={20} /> : <ArrowBigDown size={20} />}
                            </span>
                            <div className="flex flex-col text-xs justify-center">
                                {item.contact?.name}
                                <span className="text-gray-500">{formatDateTime(item.date_issued)}</span>
                                <h1>{item.journal?.description}</h1>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <h1 className="font-bold text-lg">{formatNumber(item.bill_amount > 0 ? item.bill_amount : item.payment_amount)}</h1>
                            <button
                                className="text-red-500 p-1 border border-red-500 rounded-full hover:bg-red-500 hover:text-white cursor-pointer"
                                onClick={() => handleDeleteFinance(item.id)}
                            >
                                <Trash2Icon size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                <div className="px-4 pt-2 sm:py-0">
                    {finance.finance?.last_page > 1 && <Paginator links={finance.finance} handleChangePage={handleChangePage} />}
                </div>
            </div>
        </div>
    );
};

export default FinanceLog;
