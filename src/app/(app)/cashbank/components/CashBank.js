"use client";
import Button from "@/components/Button";
import Dropdown from "@/components/Dropdown";
import Modal from "@/components/Modal";
import { useAuth } from "@/libs/auth";
import axios from "@/libs/axios";
import { formatDateTime, formatNumber, todayDate } from "@/libs/format";
import { ChevronRightIcon, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CreateExpense from "../../cashbank/components/CreateExpense";
import Notification from "@/components/Notification";
import JournalHistory from "../../cashbank/components/JournalHistory";
import CreateJournal from "./CreateJournal";
import { mutate } from "swr";
import RecentOrderStatus from "./RecentOrderStatus";
import CreateIncome from "./CreateIncome";
import StatusBadge from "@/components/StatusBadge";

const CashBank = () => {
    const { user } = useAuth();
    const warehouseId = user?.role?.warehouse_id;
    const startDate = todayDate();
    const endDate = todayDate();
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

    const filterAccountsByWarehouseId = accounts.filter((account) => account.warehouse_id === warehouseId);
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

    const closeModal = () => {
        setIsModalCreateJournalOpen(false);
        setIsModalCreateIncomeOpen(false);
        setIsModalCreateExpenseOpen(false);
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
                        <li className="hover:bg-slate-100 dark:hover:bg-slate-500">
                            <button className="w-full text-sm text-left py-2 px-4" onClick={() => setIsModalCreateExpenseOpen(true)}>
                                Kas Keluar
                            </button>
                        </li>
                    </ul>
                </Dropdown>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="card p-4">
                    <h1 className="card-title">Saldo Kas</h1>
                    <h1 className="text-2xl font-bold mt-1">{formatNumber(revenueByWarehouse.cash)}</h1>
                </div>
                <div className="card p-4">
                    <div className="flex justify-between items-center">
                        <h1 className="card-title">Total Pendapatan</h1>
                        <StatusBadge statusText={`${formatNumber(revenueByWarehouse.service_order)} Order${revenueByWarehouse.service_order > 1 ? "s" : ""}`} />
                    </div>
                    <h1 className="text-2xl font-bold mt-1">{formatNumber(revenueByWarehouse.revenue)}</h1>
                </div>
                <div className="card p-4">
                    <h1 className="card-title">Pengeluaran</h1>
                    <h1 className="text-2xl font-bold mt-1">{formatNumber(revenueByWarehouse.expense)}</h1>
                </div>
                <div className="card p-4">
                    <h1 className="card-title">Net Profit</h1>
                    <h1 className="text-2xl font-bold mt-1">{formatNumber(revenueByWarehouse.net_profit)}</h1>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="card p-4 col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <select className="form-select" value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                            <option value={"all"}>Semua Akun</option>
                            {filterAccountsByWarehouseId?.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.acc_name}
                                </option>
                            ))}
                        </select>
                        <select className="form-select" value={itemsPerPage} onChange={(e) => setItemsPerPage(e.target.value)}>
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
        </>
    );
};

export default CashBank;
