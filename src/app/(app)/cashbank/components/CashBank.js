"use client";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Modal from "@/components/Modal";
import { useAuth } from "@/libs/auth";
import axios from "@/libs/axios";
import { formatDate, formatDateTime, formatNumber, todayDate } from "@/libs/format";
import { ChevronRightIcon, Download, Filter, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CreateExpense from "../../cashbank/components/CreateExpense";
import Notification from "@/components/Notification";
import JournalHistory from "../../cashbank/components/JournalHistory";
import CreateJournal from "./CreateJournal";
import { mutate } from "swr";
import RecentOrderStatus from "./RecentOrderStatus";
import CreateIncome from "./CreateIncome";
import StatusBadge from "@/components/StatusBadge";
import Label from "@/components/Label";
import Input from "@/components/Input";
import CreatePrive from "./CreatePrive";

const CashBank = () => {
    const { user } = useAuth();
    const warehouseId = user?.role?.warehouse_id;
    const userRole = user?.role?.role;
    const [startDate, setStartDate] = useState(todayDate());
    const [endDate, setEndDate] = useState(todayDate());
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);

    const today = todayDate();
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [accounts, setAccounts] = useState([]);
    const [journalByWarehouse, setJournalByWarehouse] = useState([]);
    const [revenueByWarehouse, setRevenueByWarehouse] = useState([]);
    function range(start, end) {
        return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    }
    const expenseId = range(33, 45);
    const revenueId = range(27, 30);

    const fetchAccounts = async ({ account_ids }) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
            setAccounts(response.data.data);
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts({ account_ids: [1, 2, ...expenseId, ...revenueId] });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchJournalByWarehouse = useCallback(async () => {
        try {
            const response = await axios.get(`/api/get-journal-by-warehouse/${warehouseId}/${startDate}/${endDate}`, {
                params: {
                    search: search,
                },
            });
            setJournalByWarehouse(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }, [warehouseId, startDate, endDate, search]);

    useEffect(() => {
        fetchJournalByWarehouse();
    }, [fetchJournalByWarehouse]);
    const fetchRevenueByWarehouse = useCallback(async () => {
        try {
            const response = await axios.get(`/api/get-revenue-by-warehouse/${warehouseId}/${startDate}/${endDate}`);
            setRevenueByWarehouse(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }, [warehouseId, startDate, endDate]);

    useEffect(() => {
        fetchRevenueByWarehouse();
    }, [fetchRevenueByWarehouse]);

    const warehouseCashAccountId = accounts.find((account) => account.warehouse_id === warehouseId && account.is_primary_cash === 1)?.id;
    const [selectedAccountId, setSelectedAccountId] = useState("all");

    useEffect(() => {
        if (warehouseCashAccountId) {
            setSelectedAccountId(warehouseCashAccountId);
        }
    }, [warehouseCashAccountId]);

    const filterAccountsByWarehouseId = accounts.filter((account) =>
        userRole === "Administrator" ? [1, 2].includes(account.account_id) : account.warehouse_id === warehouseId
    );
    const filterJournalByAccountId = journalByWarehouse.filter((journal) => {
        const matchAccountId = journal.chart_of_account_id === Number(selectedAccountId) || Number(selectedAccountId) === "all";

        if (selectedAccountId !== "all") {
            return matchAccountId;
        }

        return true;
    });

    const [isModalCreateJournalOpen, setIsModalCreateJournalOpen] = useState(false);
    const [isModalCreateIncomeOpen, setIsModalCreateIncomeOpen] = useState(false);
    const [isModalCreateExpenseOpen, setIsModalCreateExpenseOpen] = useState(false);
    const [isModalCreatePriveOpen, setIsModalCreatePriveOpen] = useState(false);

    const closeModal = () => {
        setIsModalCreateJournalOpen(false);
        setIsModalCreateIncomeOpen(false);
        setIsModalCreateExpenseOpen(false);
        setIsModalFilterJournalOpen(false);
        setIsModalCreatePriveOpen(false);
    };

    useEffect(() => {
        mutate(`/api/get-cash-bank-balance/${warehouseId}/${endDate}`);
    }, [warehouseId, endDate, journalByWarehouse]);

    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="mb-4">
                <Dropdown
                    trigger={
                        <Button className={"group text-nowrap"}>
                            Mutasi Kas <ChevronRightIcon size={18} className="inline group-hover:rotate-90 delay-300 transition-transform duration-200" />
                        </Button>
                    }
                    align="left"
                >
                    <ul className="min-w-max">
                        <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500 ">
                            <button className="w-full text-sm text-left py-2 px-4 " onClick={() => setIsModalCreateJournalOpen(true)}>
                                Transfer Saldo
                            </button>
                        </li>
                        <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500">
                            <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateIncomeOpen(true)}>
                                Kas Masuk
                            </button>
                        </li>
                        <li className="border-b border-slate-200 hover:bg-slate-100 dark:border-slate-500 dark:hover:bg-slate-500">
                            <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateExpenseOpen(true)}>
                                Kas Keluar
                            </button>
                        </li>
                        <li className="hover:bg-slate-100 dark:hover:bg-slate-500" hidden={userRole !== "Administrator"}>
                            <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreatePriveOpen(true)}>
                                Input Prive
                            </button>
                        </li>
                    </ul>
                </Dropdown>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
                <div className="card p-4">
                    <h1 className="card-title">Saldo Kas</h1>
                    <h1 className="text-2xl font-bold mt-1">{formatNumber(revenueByWarehouse.cash || 0)}</h1>
                </div>
                <div className="card p-4">
                    <div className="flex justify-between items-center">
                        <h1 className="card-title">Total Pendapatan</h1>
                        <StatusBadge
                            statusText={`${formatNumber(revenueByWarehouse.service_order || 0)} Order${revenueByWarehouse.service_order > 1 ? "s" : ""}`}
                        />
                    </div>
                    <h1 className="text-2xl font-bold mt-1">{formatNumber(revenueByWarehouse.revenue || 0)}</h1>
                </div>
                <div className="card p-4">
                    <h1 className="card-title">Pengeluaran</h1>
                    <h1 className="text-2xl font-bold mt-1">{formatNumber(revenueByWarehouse.expense || 0)}</h1>
                </div>
                <div className="card p-4">
                    <h1 className="card-title">Net Profit</h1>
                    <h1 className="text-2xl font-bold mt-1">{formatNumber(revenueByWarehouse.net_profit || 0)}</h1>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="card p-4 col-span-2">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="card-title">
                            Riwayat Kas
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
                    <div className="flex justify-between items-center gap-2 mb-4">
                        <input
                            type="search"
                            placeholder="Cari .."
                            className="form-control w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select className="form-select" value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                            <option value={"all"}>Semua Akun</option>
                            {filterAccountsByWarehouseId?.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.acc_name}
                                </option>
                            ))}
                        </select>
                        <select className="form-select !w-20" value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value)}>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <JournalHistory
                        filterJournalByAccountId={filterJournalByAccountId}
                        fetchJournalsByWarehouse={fetchJournalByWarehouse}
                        notification={setNotification}
                        formatDateTime={formatDateTime}
                        formatNumber={formatNumber}
                        itemsPerPage={itemsPerPage}
                    />
                </div>
                <div>
                    <RecentOrderStatus />
                </div>
            </div>

            <Modal isOpen={isModalCreateJournalOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Transfer Saldo">
                <CreateJournal
                    accounts={accounts}
                    range={range}
                    isModalOpen={setIsModalCreateJournalOpen}
                    fetchRevenueByWarehouse={fetchRevenueByWarehouse}
                    fetchJournalByWarehouse={fetchJournalByWarehouse}
                    notification={setNotification}
                    user={user}
                    today={today}
                    warehouseId={warehouseId}
                />
            </Modal>
            <Modal isOpen={isModalCreatePriveOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Buat Jurnal Prive">
                <CreatePrive
                    accounts={accounts}
                    isModalOpen={setIsModalCreatePriveOpen}
                    fetchRevenueByWarehouse={fetchRevenueByWarehouse}
                    fetchJournalByWarehouse={fetchJournalByWarehouse}
                    notification={setNotification}
                    user={user}
                    today={today}
                />
            </Modal>
            <Modal isOpen={isModalCreateExpenseOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Pengeluaran Kas">
                <CreateExpense
                    accounts={accounts}
                    range={range}
                    isModalOpen={setIsModalCreateExpenseOpen}
                    fetchRevenueByWarehouse={fetchRevenueByWarehouse}
                    fetchJournalByWarehouse={fetchJournalByWarehouse}
                    notification={setNotification}
                    user={user}
                    today={today}
                    warehouseId={warehouseId}
                />
            </Modal>
            <Modal isOpen={isModalCreateIncomeOpen} onClose={closeModal} maxWidth={"max-w-xl"} modalTitle="Kas Masuk">
                <CreateIncome
                    accounts={accounts}
                    range={range}
                    isModalOpen={setIsModalCreateIncomeOpen}
                    fetchRevenueByWarehouse={fetchRevenueByWarehouse}
                    fetchJournalByWarehouse={fetchJournalByWarehouse}
                    notification={setNotification}
                    user={user}
                    today={today}
                    warehouseId={warehouseId}
                />
            </Modal>
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
                        fetchJournalByWarehouse();
                        setIsModalFilterJournalOpen(false);
                    }}
                    className="btn-primary"
                >
                    Submit
                </button>
            </Modal>
        </>
    );
};

export default CashBank;
