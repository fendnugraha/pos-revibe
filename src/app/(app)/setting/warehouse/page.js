"use client";
import Notification from "@/components/Notification";
import { useCallback, useEffect, useState } from "react";
import MainPage from "../../main";
import Paginator from "@/components/Paginator";
import { EyeIcon, MapPinIcon, MessageCircleWarningIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import axios from "@/libs/axios";
import formatDateTime from "@/libs/formatDateTime";
import CreateWarehouse from "./CreateWarehouse";
import CreateAccount from "../account/CreateAccount";
import UpdateWarehouse from "./UpdateWarehouse";
import { set } from "date-fns";
import Breadcrumb from "@/components/Breadcrumb";

const Warehouse = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [categoryAccount, setCategoryAccount] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalCreateWarehouseOpen, setIsModalCreateWarehouseOpen] = useState(false);
    const [isModalCreateAccountOpen, setIsModalCreateAccountOpen] = useState(false);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const [errors, setErrors] = useState([]); // Store validation errors
    const [isModalDeleteWarehouseOpen, setIsModalDeleteWarehouseOpen] = useState(false);
    const [isModalUpdateWarehouseOpen, setIsModalUpdateWarehouseOpen] = useState(false);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
    const closeModal = () => {
        setIsModalCreateWarehouseOpen(false);
        setIsModalCreateAccountOpen(false);
        setSelectedWarehouseId(null);
        setIsModalDeleteWarehouseOpen(false);
        setIsModalUpdateWarehouseOpen(false);
    };

    const fetchWarehouses = useCallback(
        async (url = "/api/warehouse") => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                    },
                });
                setWarehouses(response.data.data);
            } catch (error) {
                setErrors(error.response?.data?.errors || ["Something went wrong."]);
            } finally {
                setLoading(false);
            }
        },
        [search]
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchWarehouses();
        }, 500);

        return () => clearTimeout(timeout);
    }, [search, fetchWarehouses]);

    const findSelectedWarehouseId = warehouses.data?.find((warehouse) => warehouse.id === selectedWarehouseId);

    const handleChangePage = (url) => {
        fetchWarehouses(url);
    };

    const fetchCategoryAccount = useCallback(async () => {
        try {
            const response = await axios.get("api/category-accounts");
            setCategoryAccount(response.data.data);
        } catch (error) {
            setErrors(error.response?.message || ["Something went wrong."]);
        }
    }, []);

    useEffect(() => {
        fetchCategoryAccount();
    }, [fetchCategoryAccount]);

    const handleDeleteWarehouse = async (id) => {
        try {
            const response = await axios.delete(`api/warehouse/${id}`);
            setNotification({
                type: "success",
                message: response.data.message,
            });
            fetchWarehouses();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Delete failed",
            });
        }
    };
    console.log(warehouses);
    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Setting", href: "/setting" },
                    { name: "Warehouse", href: "/setting/warehouse" },
                    { name: "Warehouse List", href: "/setting/warehouse" },
                ]}
            />
            <div>
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="flex gap-2 mb-4">
                    <Button buttonType="primary" onClick={() => setIsModalCreateWarehouseOpen(true)} className={`flex item-center gap-2`}>
                        <PlusIcon size={20} /> Add Warehouse
                    </Button>
                    <Button buttonType="primary" onClick={() => setIsModalCreateAccountOpen(true)} className={`flex item-center gap-2`}>
                        <PlusIcon size={20} /> Add Account
                    </Button>
                    <Modal isOpen={isModalCreateWarehouseOpen} onClose={closeModal} modalTitle="Add new warehouse" maxWidth="max-w-lg">
                        <CreateWarehouse
                            isModalOpen={setIsModalCreateWarehouseOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchWarehouses={fetchWarehouses}
                        />
                    </Modal>
                    <Modal isOpen={isModalCreateAccountOpen} onClose={closeModal} modalTitle="Create account" maxWidth="max-w-lg">
                        <CreateAccount
                            isModalOpen={setIsModalCreateAccountOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            categoryAccount={categoryAccount}
                        />
                    </Modal>
                </div>
                <div className="card p-4">
                    <h1 className="card-title mb-4">List Warehouse</h1>
                    <div className="relative w-full sm:max-w-sm">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="block w-full text-sm mb-2 pl-10 pr-4 py-2 text-gray-900 placeholder-gray-400 bg-white rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="off"
                        />
                    </div>
                    <div className="overflow-y-auto">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th>Warehouse Name</th>
                                    <th>Address</th>
                                    <th>Cash Account</th>
                                    <th className="text-center">Created At</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warehouses?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="7">No warehouse found</td>
                                    </tr>
                                ) : (
                                    warehouses?.data?.map((warehouse) => (
                                        <tr key={warehouse.id}>
                                            <td className="font-semibold">
                                                {warehouse.name} <span className="text-xs font-normal">({warehouse.code})</span>
                                            </td>
                                            <td>
                                                <span className="block text-xs">
                                                    <MapPinIcon className="w-4 h-4 inline" /> {warehouse.address}
                                                </span>
                                            </td>
                                            <td>{warehouse.primary_cash_account?.acc_name || "-"}</td>
                                            <td className="text-center">{formatDateTime(warehouse.created_at)}</td>
                                            <td className="text-center">
                                                <span className="flex gap-2 justify-center">
                                                    <Link
                                                        className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                        href={`/setting/warehouse/detail/${warehouse.id}`}
                                                    >
                                                        <EyeIcon size={24} />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setIsModalUpdateWarehouseOpen(true);
                                                            setSelectedWarehouseId(warehouse.id);
                                                        }}
                                                        className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                    >
                                                        <PencilIcon size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsModalDeleteWarehouseOpen(true);
                                                            setSelectedWarehouseId(warehouse.id);
                                                        }}
                                                        className="disabled:text-red-400 cursor-pointer hover:scale-125 transition transform ease-in"
                                                    >
                                                        <TrashIcon size={20} />
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="px-4">{warehouses?.last_page > 1 && <Paginator links={warehouses} handleChangePage={handleChangePage} />}</div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalUpdateWarehouseOpen} onClose={closeModal} modalTitle="Update warehouse" maxWidth="max-w-lg">
                <UpdateWarehouse
                    isModalOpen={setIsModalUpdateWarehouseOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    findSelectedWarehouseId={findSelectedWarehouseId}
                    fetchWarehouses={fetchWarehouses}
                />
            </Modal>
            <Modal isOpen={isModalDeleteWarehouseOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={72} className="text-red-600" />
                    <p className="text-sm">Apakah anda yakin ingin menghapus Cabang ini (ID: {selectedWarehouseId})?</p>
                </div>
                <div className="flex justify-center gap-3">
                    <Button
                        buttonType="neutral"
                        onClick={() => {
                            handleDeleteWarehouse(selectedWarehouseId);
                            setIsModalDeleteWarehouseOpen(false);
                        }}
                    >
                        Ya
                    </Button>
                    <Button buttonType="danger" onClick={() => setIsModalDeleteWarehouseOpen(false)}>
                        Tidak
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default Warehouse;
