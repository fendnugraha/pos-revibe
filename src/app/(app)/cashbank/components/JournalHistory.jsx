"use client";
import Modal from "@/components/Modal";
import SimplePagination from "@/components/SimplePagination";
import { MessageCircleWarningIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import EditJournal from "./EditJournal";
import axios from "@/libs/axios";

const JournalHistory = ({ filterJournalByAccountId, formatDateTime, formatNumber, fetchJournalsByWarehouse, notification }) => {
    const [isModalEditJournalOpen, setIsModalEditJournalOpen] = useState(false);
    const [isModalDeleteJournalOpen, setIsModalDeleteJournalOpen] = useState(false);
    const [selectedJournalId, setSelectedJournalId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const totalItems = filterJournalByAccountId?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filterJournalByAccountId?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const closeModal = () => {
        setIsModalEditJournalOpen(false);
        setIsModalDeleteJournalOpen(false);
    };

    const handleDeleteJournal = async (id) => {
        try {
            const response = await axios.delete(`/api/journals/${id}`);
            notification({ type: "success", message: response.data.message });
            fetchJournalsByWarehouse();
        } catch (error) {
            notification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
            console.log(error);
        }
    };

    const filterSelectedJournalId = currentItems?.find((entries) => entries.journal_id === selectedJournalId);

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-xs table">
                    <thead>
                        <tr>
                            <th className="">Keterangan</th>
                            <th className="">Jumlah</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems?.map((entries, index) => (
                                <tr key={index}>
                                    <td className="">
                                        <span className="font-bold block text-slate-500">
                                            {formatDateTime(entries.journal?.date_issued)} {entries.journal?.invoice}
                                        </span>
                                        Note: {entries.journal?.description}
                                        <span className="font-bold block">{entries.chart_of_account?.acc_name}</span>
                                    </td>
                                    <td className={`text-right text-lg font-bold ${entries.debit > 0 ? "text-green-500" : "text-red-500"}`}>
                                        {formatNumber(entries.debit > 0 ? entries.debit : entries.credit)}
                                    </td>
                                    <td>
                                        <div className="flex justify-center gap-3">
                                            <button
                                                className=" hover:scale-125 transtition-all duration-200"
                                                hidden={!["General"].includes(entries.journal?.journal_type)}
                                                onClick={() => {
                                                    setSelectedJournalId(entries.journal_id);
                                                    setIsModalEditJournalOpen(true);
                                                }}
                                            >
                                                <PencilIcon className="size-4 text-indigo-700 dark:text-indigo-300 group-hover:text-white" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedJournalId(entries.journal_id);
                                                    setIsModalDeleteJournalOpen(true);
                                                }}
                                                disabled={!["General"].includes(entries.journal?.journal_type)}
                                                className="disabled:text-slate-300 disabled:cursor-not-allowed text-red-600 dark:text-red-400 hover:scale-125 transition-all group-hover:text-white duration-200"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="text-center">
                                    Tidak ada transaksi
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div>
                {totalPages > 1 && (
                    <SimplePagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />
                )}
            </div>

            <Modal isOpen={isModalEditJournalOpen} onClose={closeModal} modalTitle="Edit Journal" maxWidth="max-w-2xl">
                <EditJournal isModalOpen={setIsModalEditJournalOpen} journal={filterSelectedJournalId} />
            </Modal>
            <Modal isOpen={isModalDeleteJournalOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={100} className="text-red-600" />
                    <h1 className="text-2xl font-bold text-slate-500 text-center">Apakah anda yakin ??</h1>
                    <p className="text-sm text-center">(ID: {selectedJournalId})</p>
                </div>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setIsModalDeleteJournalOpen(false)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Tidak
                    </button>
                    <button
                        onClick={() => {
                            handleDeleteJournal(selectedJournalId);
                            setIsModalDeleteJournalOpen(false);
                        }}
                        className="btn-primary w-full"
                    >
                        Ya
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default JournalHistory;
