"use client";
import MainPage from "@/app/(app)/main";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Notification from "@/components/Notification";
import SimplePagination from "@/components/SimplePagination";
import axios from "@/libs/axios";
import { CheckSquare } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";

const WarehouseDetail = ({ params }) => {
    const [warehouse, setWarehouse] = useState({});
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState({ type: "", message: "" });

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        chart_of_account_id: "",
    });

    const { id } = use(params);

    const fetchWarehouse = useCallback(
        async (url = `/api/warehouse/${id}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url);
                setWarehouse(response.data.data);
                setFormData({
                    name: response.data.data.name,
                    address: response.data.data.address,
                    chart_of_account_id: response.data.data.chart_of_account_id,
                });
            } catch (error) {
                notification(error.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [id]
    );

    useEffect(() => {
        fetchWarehouse();
    }, [fetchWarehouse]);

    const fetchAccountByIds = useCallback(async ({ account_ids }) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
            setAccounts(response.data.data);
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchAccountByIds({ account_ids: [1, 2] });
    }, [fetchAccountByIds]);

    const availableAccounts = accounts.filter((item) => item.warehouse_id === null || Number(item.warehouse_id) === Number(id));

    const handleUpdateWarehouse = async (e, accId) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`/api/update-warehouse-id/${accId}`, {
                warehouse_id: id, // id gudang aktif
            });
            fetchAccountByIds({ account_ids: [1, 2] });
            setNotification({ type: "success", message: "Gudang berhasil diupdate." });
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const totalItems = accounts?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = accounts?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Setting", href: "/setting" },
                    { name: "Warehouse", href: "/setting/warehouse" },
                    { name: "Warehouse List", href: "/setting/warehouse" },
                    { name: "Warehouse Detail", href: `/setting/warehouse/detail/${id}` },
                ]}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                    <div className="card p-4">
                        <h1 className="card-title mb-4">
                            Detail Gudang
                            <span className="card-subtitle">
                                {warehouse.code} - {warehouse.name}
                            </span>
                        </h1>
                    </div>
                    <div className="card p-4 mt-4">
                        <h1 className="card-title mb-4">
                            Akun Kas & Bank Gudang
                            <span className="card-subtitle">
                                {warehouse.code} - {warehouse.name}
                            </span>
                        </h1>
                        <div>
                            <input
                                type="search"
                                placeholder="Cari akun"
                                onChange={(e) => setSearch(e.target.value)}
                                value={search}
                                className="form-control w-full"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full table">
                                <thead>
                                    <tr>
                                        <th className="text-left">Nama</th>
                                        <th className="text-left">
                                            <CheckSquare size={16} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems
                                        .filter((item) => item.acc_name.toLowerCase().includes(search.toLowerCase()))
                                        .map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.acc_name}</td>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => handleUpdateWarehouse(e, item.id)}
                                                        checked={item.warehouse_id === Number(id)}
                                                        disabled={item.warehouse_id !== Number(id) && item.warehouse_id !== null}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <div>
                            {totalPages > 1 && (
                                <SimplePagination
                                    totalItems={totalItems}
                                    itemsPerPage={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WarehouseDetail;
