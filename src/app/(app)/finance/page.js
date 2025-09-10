"use client";
import { useCallback, useEffect, useState } from "react";
import exportToExcel from "@/libs/exportToExcel";
import formatNumber from "@/libs/formatNumber";
import Notification from "@/components/Notification";
import axios from "@/libs/axios";
import Pagination from "@/components/PaginateList";
import Modal from "@/components/Modal";
import PaymentForm from "./components/PaymentForm";
import { MessageCircleWarningIcon, PlusIcon } from "lucide-react";
import FinanceLog from "./components/FinanceLog";
import formatDateTime from "@/libs/formatDateTime";
import Dropdown from "@/components/Dropdown";
import CreatePayable from "./components/CreatePayable";
import CreateReceivable from "./components/CreateReceivable";
import CreateContact from "../setting/contact/CreateContact";
import { todayDate } from "@/libs/format";
import { useAuth } from "@/libs/auth";

const FinancePage = () => {
    const { user } = useAuth({ middleware: "auth" });
    const userRole = user?.role?.role;
    const [startDate, setStartDate] = useState(todayDate());
    const [endDate, setEndDate] = useState(todayDate());
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [isModalCreateContactOpen, setIsModalCreateContactOpen] = useState(false);
    const [isModalCreatePayableOpen, setIsModalCreatePayableOpen] = useState(false);
    const [isModalCreateReceivableOpen, setIsModalCreateReceivableOpen] = useState(false);
    const [isModalDeleteFinanceOpen, setIsModalDeleteFinanceOpen] = useState(false);
    const [isModalPaymentOpen, setIsModalPaymentOpen] = useState(false);
    const [finance, setFinance] = useState([]);
    const [financeType, setFinanceType] = useState("Receivable");
    const [selectedFinanceId, setSelectedFinanceId] = useState(null);
    const [selectedContactId, setSelectedContactId] = useState("All");
    const [selectedContactIdPayment, setSelectedContactIdPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchFinance = useCallback(
        async (url = `/api/finance-by-type/${selectedContactId}/${financeType}/${startDate}/${endDate}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url);
                setFinance(response.data.data);
            } catch (error) {
                console.error("Error fetching finance:", error);
            } finally {
                setLoading(false);
            }
        },
        [selectedContactId, financeType, startDate, endDate]
    );

    useEffect(() => {
        fetchFinance();
    }, [fetchFinance]);

    const closeModal = () => {
        setIsModalCreateContactOpen(false);
        setIsModalCreatePayableOpen(false);
        setIsModalCreateReceivableOpen(false);
        setIsModalDeleteFinanceOpen(false);
        setIsModalPaymentOpen(false);
    };

    const [paymentStatus, setPaymentStatus] = useState("Unpaid");

    const filteredFinance =
        finance.financeGroupByContactId?.filter((fnc) => {
            const matchesSearch = searchTerm === "" || fnc.contact.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesUnpaidCondition = paymentStatus === "Unpaid" ? fnc.sisa > 0 : paymentStatus === "Paid" ? Number(fnc.sisa) === 0 : true;

            const matchesFinanceType = fnc.finance_type === financeType;

            return matchesSearch && matchesUnpaidCondition && matchesFinanceType;
        }) || [];

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    // Calculate the total number of pages
    const totalItems = filteredFinance.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get the items for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredFinance.slice(startIndex, startIndex + itemsPerPage);

    // Handle page change from the Pagination component
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDeleteFinance = async (id) => {
        try {
            const response = await axios.delete(`/api/finance/${id}`);
            setNotification({ type: "success", message: response.data.message });
            fetchFinance();
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        }
    };
    const handleChangePage = (url) => {
        fetchFinance(url);
    };

    const exportFinanceToExcel = () => {
        const headers = [
            { key: "contact_name", label: "Contact Name" },
            { key: "tagihan", label: "Tagihan" },
            { key: "terbayar", label: "Terbayar" },
            { key: "sisa", label: "Sisa" },
            { key: "finance_type", label: "Type" },
        ];

        const data = filteredFinance.map((item) => ({
            contact_name: item.contact.name,
            tagihan: formatNumber(item.tagihan),
            terbayar: formatNumber(item.terbayar),
            sisa: formatNumber(item.sisa),
            finance_type: item.finance_type === "Payable" ? "Hutang" : "Piutang",
        }));

        exportToExcel(
            data,
            headers,
            `Laporan ${financeType === "Payable" ? "Hutang Usaha" : "Piutang Usaha"} ${formatDateTime(new Date())}.xlsx`,
            `Laporan ${financeType === "Payable" ? "Hutang Usaha" : "Piutang Usaha"} ${formatDateTime(new Date())}`
        );
    };
    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card p-4">
                    <div className="flex justify-between items-center mb-4">
                        <select
                            value={financeType}
                            onChange={(e) => setFinanceType(e.target.value)}
                            className="p-1 px-4 bg-blue-500 text-white drop-shadow-sm rounded-xl"
                        >
                            <option value="Payable" hidden={userRole !== "Administrator"}>
                                Hutang Usaha
                            </option>
                            <option value="Receivable">Piutang Usaha</option>
                        </select>
                        <Dropdown
                            trigger={
                                <button className="px-4 py-1 bg-red-400 text-white rounded-xl hover:bg-red-500">
                                    <PlusIcon size={16} className="inline" /> Tambah
                                </button>
                            }
                            align="right"
                        >
                            <ul className="min-w-max outline-none text-sm">
                                <li className="border-b border-slate-200 px-2 py-1.5 w-36 hover:bg-slate-100 ">
                                    <button onClick={() => setIsModalCreateContactOpen(true)}>Kontak baru</button>
                                </li>
                                <li className="border-b border-slate-200 px-2 py-1.5 w-36 hover:bg-slate-100 " hidden={userRole !== "Administrator"}>
                                    <button onClick={() => setIsModalCreatePayableOpen(true)}>Hutang Usaha</button>
                                </li>
                                <li className=" px-2 py-1.5 w-36 hover:bg-slate-100 ">
                                    <button onClick={() => setIsModalCreateReceivableOpen(true)}>Piutang Usaha</button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                    <div className="mt-2 flex gap-1">
                        <input
                            type="text"
                            placeholder="Search by contact name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border w-full p-1 px-4 border-slate-300 rounded-xl"
                        />
                        <select
                            className="border text-sm border-slate-300 rounded-xl p-2"
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                        >
                            <option value="All">Semua</option>
                            <option value="Paid">Lunas</option>
                            <option value="Unpaid">Belum lunas</option>
                        </select>
                        <select
                            onChange={(e) => {
                                setItemsPerPage(e.target.value), setCurrentPage(1);
                            }}
                            className="border border-slate-300 text-sm rounded-xl p-2"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full table text-sm">
                            <thead>
                                <tr>
                                    <th>Contact</th>
                                    <th className="w-64">Sisa Tagihan</th>
                                    <th className="w-32">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems?.length > 0 ? (
                                    currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <button onClick={() => setSelectedContactId(item.contact_id)} className="hover:underline cursor-pointer">
                                                    {item.contact.name}
                                                </button>
                                            </td>
                                            <td className="text-end">{formatNumber(item.sisa)}</td>
                                            <td className="text-center w-16">
                                                <button
                                                    onClick={() => {
                                                        setIsModalPaymentOpen(true);
                                                        setSelectedContactIdPayment(item.contact_id);
                                                    }}
                                                    type="button"
                                                    className="hover:underline cursor-pointer"
                                                    disabled={Number(item.sisa) === 0}
                                                >
                                                    {Number(item.sisa) === 0 ? "Lunas" : "Bayar"}
                                                </button>
                                            </td>
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
                                <tr className="">
                                    <th className="font-bold">Total {financeType === "Payable" ? "Hutang" : "Piutang"}</th>
                                    <th className="font-bold text-end">
                                        {formatNumber(filteredFinance.reduce((total, item) => total + Number(item.sisa), 0))}
                                    </th>
                                    <th></th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            className={"w-full px-3 pb-3"}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
                <FinanceLog
                    finance={finance}
                    loading={loading}
                    formatDateTime={formatDateTime}
                    formatNumber={formatNumber}
                    handleChangePage={handleChangePage}
                    notification={setNotification}
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    fetchFinance={fetchFinance}
                />
            </div>
            <Modal isOpen={isModalDeleteFinanceOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={72} className="text-red-600" />
                    <p className="text-sm">Apakah anda yakin ingin menghapus transaksi ini (ID: {selectedFinanceId})?</p>
                </div>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => {
                            handleDeleteFinance(selectedFinanceId);
                            setIsModalDeleteFinanceOpen(false);
                        }}
                        className="btn-primary w-full"
                    >
                        Ya
                    </button>
                    <button
                        onClick={() => setIsModalDeleteFinanceOpen(false)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Tidak
                    </button>
                </div>
            </Modal>
            <Modal isOpen={isModalCreatePayableOpen} onClose={closeModal} modalTitle="Tambah Hutang">
                <CreatePayable
                    isModalOpen={setIsModalCreatePayableOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchFinance={fetchFinance}
                />
            </Modal>
            <Modal isOpen={isModalCreateReceivableOpen} onClose={closeModal} modalTitle="Tambah Piutang">
                <CreateReceivable
                    isModalOpen={setIsModalCreateReceivableOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchFinance={fetchFinance}
                />
            </Modal>
            <Modal isOpen={isModalCreateContactOpen} onClose={closeModal} modalTitle="Tambah Kontak">
                <CreateContact isModalOpen={setIsModalCreateContactOpen} notification={(type, message) => setNotification({ type, message })} />
            </Modal>
            <Modal isOpen={isModalPaymentOpen} onClose={closeModal} modalTitle="Form Pembayaran" maxWidth="max-w-2xl">
                <PaymentForm
                    contactId={selectedContactIdPayment}
                    notification={(type, message) => setNotification({ type, message })}
                    isModalOpen={setIsModalPaymentOpen}
                    fetchFinance={fetchFinance}
                    onClose={closeModal}
                />
            </Modal>
        </>
    );
};

export default FinancePage;
