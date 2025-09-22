"use client";
import Button from "@/components/Button";
import InputGroup from "@/components/InputGroup";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatDateTime, formatNumber, todayDate } from "@/libs/format";
import { ChevronRightIcon, DownloadIcon, FilterIcon, PrinterIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import CreateOrder from "./CreateOrder";
import axios from "@/libs/axios";
import Notification from "@/components/Notification";
import Paginator from "@/components/Paginator";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Dropdown from "@/components/Dropdown";
import { useAuth } from "@/libs/auth";
import exportToExcel from "@/libs/exportToExcel";

const OrderListTable = () => {
    const { user } = useAuth();
    const userRole = user?.role?.role;
    const userWarehouseId = user?.role?.warehouse_id;
    const today = todayDate();

    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(userWarehouseId);
    const [OrderList, setOrderList] = useState([]);
    const [search, setSearch] = useState("");

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [CurrentOrderStatus, setCurrentOrderStatus] = useState("All Orders");
    const OrderStatus = ["All Orders", "Pending", "In Progress", "Finished", "Completed", "Canceled", "Rejected"];
    const countOrderByStatus = (status) => {
        if (status === "All Orders") {
            // jumlah total semua order
            return Object.values(OrderList.orderStatusCount || {}).reduce((a, b) => a + b, 0);
        }

        // jumlah per status
        return OrderList.orderStatusCount?.[status] || 0;
    };

    const fetchWarehouse = useCallback(async () => {
        try {
            const response = await axios.get("/api/get-all-warehouses");
            setWarehouses(response.data.data);
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        }
    }, []);

    useEffect(() => {
        fetchWarehouse();
    }, [fetchWarehouse]);
    console.log(warehouses);

    const fetchOrders = useCallback(
        async (url = "/api/orders") => {
            setIsLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                        start_date: startDate,
                        end_date: endDate,
                        status: CurrentOrderStatus,
                        warehouse_id: selectedWarehouse,
                        paginated: true,
                    },
                });
                setOrderList(response.data.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [search, startDate, endDate, CurrentOrderStatus, selectedWarehouse]
    );

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleChangePage = (url) => {
        fetchOrders(url);
    };

    const [isModalCreateOrderOpen, setIsModalCreateOrderOpen] = useState(false);
    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreateOrderOpen(false);
        setIsModalFilterJournalOpen(false);
    };

    const exportOrderToExcel = async () => {
        const header = [
            { key: "date_issued", label: "Tanggal Masuk" },
            { key: "order_number", label: "Order Number" },
            { key: "customer", label: "Customer" },
            { key: "phone_number", label: "No Telepon" },
            { key: "description", label: "Keterangan" },
            { key: "warehouse", label: "Cabang" },
            { key: "technician", label: "Teknisi" },
            { key: "status", label: "Status" },
        ];

        const response = await axios.get("/api/orders", {
            params: {
                search: search,
                start_date: startDate,
                end_date: endDate,
                status: CurrentOrderStatus,
                warehouse_id: selectedWarehouse,
                paginated: false,
            },
        });

        const allOrderList = response.data.data;

        const data = [
            ...allOrderList.orders?.map((item) => ({
                date_issued: item.date_issued,
                order_number: item.order_number,
                customer: item.contact.name,
                phone_number: item.contact.phone_number,
                description: item.description,
                warehouse: item.warehouse.name,
                technician: item.technician?.name ?? "-",
                status: item.status,
            })),
        ];

        exportToExcel(data, header, `Laporan Order ${formatDateTime(new Date())}.xlsx`, `Laporan Order ${formatDateTime(new Date())}`);
    };
    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <Button onClick={() => setIsModalCreateOrderOpen(true)}>New Order</Button>

            <div className="mt-4 card">
                <div className="p-4 flex items-start justify-between">
                    <div className="sm:hidden">
                        <Dropdown
                            trigger={
                                <Button buttonType="secondary" className={"group text-nowrap"}>
                                    All Orders{" "}
                                    <ChevronRightIcon size={18} className="inline group-hover:rotate-90 delay-300 transition-transform duration-200" />
                                </Button>
                            }
                            align="left"
                        >
                            <ul className="p-0">
                                {OrderStatus.map((status, index) => (
                                    <li onClick={() => setCurrentOrderStatus(status)} key={index}>
                                        <button className="px-4 text-start py-2 hover:bg-slate-100 w-48 border-b border-slate-200 cursor-pointer flex items-center justify-between gap-2">
                                            {status}{" "}
                                            <span
                                                className={`ml-2 ${CurrentOrderStatus === status ? "bg-blue-500" : "bg-slate-400"} text-white px-2 rounded-lg`}
                                            >
                                                {formatNumber(countOrderByStatus(status))}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Dropdown>
                    </div>
                    <div className="items-center hidden sm:flex">
                        {OrderStatus.map((status, index) => (
                            <button
                                className={`mr-2 sm:mr-4 py-2 cursor-pointer text-xs ${
                                    CurrentOrderStatus === status
                                        ? "border-b-2 border-blue-500 text-slate-700 dark:text-orange-300"
                                        : "text-slate-400 hover:text-slate-500"
                                }`}
                                onClick={() => setCurrentOrderStatus(status)}
                                key={index}
                            >
                                {status}{" "}
                                <span className={`ml-2 ${CurrentOrderStatus === status ? "bg-blue-500" : "bg-slate-400"} text-white px-2 rounded-lg`}>
                                    {formatNumber(countOrderByStatus(status))}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="small-button" onClick={exportOrderToExcel}>
                            <DownloadIcon size={18} />
                        </button>
                        <button onClick={() => setIsModalFilterJournalOpen(true)} className="small-button">
                            <FilterIcon size={18} />
                        </button>
                    </div>
                </div>
                <div className="px-4">
                    <InputGroup
                        maxWidth="w-full sm:min-w-lg"
                        InputIcon={<SearchIcon size={18} />}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                    />
                </div>
                <div className="overflow-x-auto px-4 mt-2">
                    <table className="w-full text-xs table">
                        <thead>
                            <tr>
                                <th>Order No.</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Teknisi</th>
                                <th>QR Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {OrderList.orders?.data?.length > 0 ? (
                                OrderList.orders?.data?.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <Link href={`/order/detail/${order.order_number}`} className="hover:underline font-bold">
                                                {order.order_number}
                                            </Link>
                                            <span className="text-slate-500 dark:text-slate-400 block text-xs">{formatDateTime(order.date_issued)}</span>
                                        </td>
                                        <td>
                                            {order.contact?.name}
                                            <span className="text-slate-500 dark:text-slate-400 block text-xs">{order.contact?.phone_number}</span>
                                        </td>
                                        <td>
                                            <span className="text-blue-500 dark:text-yellow-300 block text-xs font-bold">
                                                {order.phone_type.toUpperCase()} <span className="font-normal text-slate-500">({order.warehouse?.name})</span>
                                            </span>
                                            {order.description}
                                        </td>
                                        <td className="text-center">
                                            <div className="flex gap-2 items-center">
                                                <StatusBadge status={order.status} />
                                                <span className="text-slate-400 dark:text-slate-400 block text-xs">({formatDateTime(order.updated_at)})</span>
                                            </div>
                                        </td>
                                        <td className="text-center">{order.technician?.name ?? "-"}</td>
                                        <td className="flex items-center justify-center">
                                            <Link
                                                href={`/order/order_invoice/${order.order_number}`}
                                                className="text-slate-500 hover:text-slate-600 cursor-pointer"
                                            >
                                                <PrinterIcon size={20} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">
                                        No Data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-4">{OrderList?.orders?.last_page > 1 && <Paginator links={OrderList.orders} handleChangePage={handleChangePage} />}</div>
            </div>
            <Modal isOpen={isModalCreateOrderOpen} onClose={closeModal} modalTitle="Create New Order" maxWidth="max-w-2xl">
                <CreateOrder
                    isModalOpen={setIsModalCreateOrderOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchOrders={fetchOrders}
                />
            </Modal>
            <Modal isOpen={isModalFilterJournalOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                {["Administrator", "Cashier"].includes(userRole) && (
                    <div className="mb-4">
                        <Label>Cabang</Label>
                        <select
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                            className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Semua Cabang</option>
                            {warehouses.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
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
                        fetchTransaction();
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

export default OrderListTable;
