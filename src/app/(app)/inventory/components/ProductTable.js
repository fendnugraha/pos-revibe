"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import Label from "@/components/Label";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import { DownloadIcon, FilterIcon, MinusIcon, PencilRulerIcon, PlusIcon, RefreshCcwIcon, SearchIcon, UndoIcon } from "lucide-react";
import Pagination from "@/components/PaginateList";
import Link from "next/link";
import exportToExcel from "@/libs/exportToExcel";
import formatDateTime from "@/libs/formatDateTime";
import CreateStockAdjustment from "./CreateStockAdjustment";
import CreateReversal from "./CreateReversal";
import InputGroup from "@/components/InputGroup";
import Paginator from "@/components/Paginator";
import LoadingData from "@/components/LoadingData";

const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const ProductTable = ({ warehouse, warehouses, warehouseName, notification }) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); // 3 detik

        return () => {
            clearTimeout(handler); // reset kalau user masih ngetik
        };
    }, [search]);
    const [endDate, setEndDate] = useState(getCurrentDate());
    const [errors, setErrors] = useState([]); // Store validation errors
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalFilterDataOpen, setIsModalFilterDataOpen] = useState(false);
    const [isModalAdjustmentOpen, setIsModalAdjustmentOpen] = useState(false);
    const [isModalReversalOpen, setIsModalReversalOpen] = useState(false);
    const [warehouseStock, setWarehouseStock] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const closeModal = () => {
        setIsModalFilterDataOpen(false);
        setIsModalAdjustmentOpen(false);
        setIsModalReversalOpen(false);
    };

    const fetchWarehouseStock = useCallback(
        async (url = `/api/get-all-products-by-warehouse/${warehouse}/${endDate}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: debouncedSearch,
                        paginated: true,
                    },
                });
                setWarehouseStock(response.data.data);
            } catch (error) {
                notification("error", error.response?.data?.message || "Something went wrong.");
                console.log(error);
            } finally {
                setLoading(false);
            }
        },
        [endDate, notification, warehouse, debouncedSearch]
    );

    useEffect(() => {
        fetchWarehouseStock();
    }, [fetchWarehouseStock]);

    const handleChangePage = (url) => {
        fetchWarehouseStock(url);
    };

    const summarizeTotal = warehouseStock?.summarizedProducts;

    const exportStockToExcel = async () => {
        const headers = [
            { key: "name", label: "Nama Barang" },
            { key: "stock_movements_sum_quantity", label: "Qty" },
            { key: "cost", label: "Harga" },
            { key: "total", label: "Total" },
        ];

        // ambil data produk dari API tanpa paginate
        const response = await fetchWarehouseStock(`/api/get-all-products-by-warehouse/${warehouse}/${endDate}?paginated=false`);

        // kalau API balikin { data: { products: [...], summarizedProducts: ... } }
        const products = response?.products ?? [];
        const summarizeTotal = response?.summarizedProducts ?? 0;

        const data = [
            ...products.map((item) => ({
                name: item.name,
                stock_movements_sum_quantity: formatNumber(item.stock_movements_sum_quantity),
                cost: formatNumber(item.current_cost),
                total: formatNumber(item.current_cost * item.stock_movements_sum_quantity),
            })),
            {
                name: "Total",
                stock_movements_sum_quantity: "",
                cost: "",
                total: formatNumber(summarizeTotal),
            },
        ];

        exportToExcel(
            data,
            headers,
            `Laporan Stok Gudang ${warehouseName} ${formatDateTime(new Date())}.xlsx`,
            `Laporan Stok Gudang ${warehouseName} ${formatDateTime(new Date())}`
        );
    };

    const findProduct = warehouseStock?.products?.data?.find((item) => item.id === selectedProduct);
    return (
        <>
            <LoadingData loading={loading} message="Geting product data..." />
            <div className="card p-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-lg font-bold">Inventory: {warehouseName}</h1>
                        <span className="text-sm text-gray-500">
                            {endDate}, Total: {formatNumber(summarizeTotal)}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => fetchWarehouseStock(`/api/get-all-products-by-warehouse/${warehouse}/${endDate}`)} className="small-button">
                            <RefreshCcwIcon className="size-4" />
                        </button>
                        <button onClick={exportStockToExcel} className="small-button">
                            <DownloadIcon className="size-4" />
                        </button>
                        <button onClick={() => setIsModalFilterDataOpen(true)} className="small-button">
                            <FilterIcon className="size-4" />
                        </button>
                    </div>
                    <Modal isOpen={isModalFilterDataOpen} onClose={closeModal} modalTitle="Filter Tanggal" maxWidth="max-w-md">
                        <div className="mb-4">
                            <Label className="font-bold">Pilih tanggal</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-md border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        </div>
                        <button onClick={() => fetchWarehouseStock(`/api/get-trx-all-product-by-warehouse/${warehouse}/${endDate}`)} className="btn-primary">
                            Submit
                        </button>
                    </Modal>
                </div>
                <div className="flex items-center justify-between gap-2 mb-4">
                    <InputGroup
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        maxWidth="w-full"
                        InputIcon={<SearchIcon size={18} />}
                        placeholder="Search"
                    />
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="form-select !w-20">
                        <option value="10">10</option>
                        <option value="20">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full table text-sm">
                        <thead>
                            <tr>
                                <th className="">Product Name</th>
                                <th className="">Quantity</th>
                                <th className="">Price</th>
                                <th>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouseStock?.products?.data?.map((item, index) => (
                                <tr key={index} className="text-xs">
                                    <td className="text-start w-1/2">
                                        <Link className="hover:underline" href={`/setting/product/history/${item.id}`}>
                                            {item.code} - {item.name}
                                        </Link>
                                    </td>
                                    <td className="text-end">{formatNumber(item.stock_movements_sum_quantity)}</td>
                                    <td className="text-end">{formatNumber(item.current_cost)}</td>
                                    <td className="text-end font-semibold">{formatNumber(item.current_cost * item.stock_movements_sum_quantity)}</td>
                                    <td className="flex justify-center gap-2">
                                        <button
                                            onClick={() => {
                                                setIsModalAdjustmentOpen(true);
                                                setSelectedProduct(item.id);
                                            }}
                                            className="cursor-pointer flex items-center gap-1 hover:underline text-cyan-600 dark:text-cyan-400"
                                        >
                                            <PencilRulerIcon size={20} /> Stock Adjustment
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsModalReversalOpen(true);
                                                setSelectedProduct(item.id);
                                            }}
                                            className="cursor-pointer flex items-center gap-1 hover:underline text-red-600 dark:text-red-400"
                                        >
                                            <UndoIcon size={20} /> Reversal
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan="3" className="text-end font-bold">
                                    Total
                                </th>
                                <th className="text-end font-bold">{formatNumber(summarizeTotal)}</th>
                                <th></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="px-4">
                    {warehouseStock?.products?.last_page > 1 && <Paginator links={warehouseStock?.products} handleChangePage={handleChangePage} />}
                </div>
            </div>
            <Modal isOpen={isModalAdjustmentOpen} onClose={closeModal} modalTitle="Stock Adjustment" maxWidth="max-w-md">
                <CreateStockAdjustment
                    isModalOpen={setIsModalAdjustmentOpen}
                    product={findProduct}
                    warehouse={warehouse}
                    warehouses={warehouses}
                    notification={notification}
                    date={getCurrentDate()}
                    fetchWarehouseStock={fetchWarehouseStock}
                />
            </Modal>
            <Modal isOpen={isModalReversalOpen} onClose={closeModal} modalTitle="Reversal" maxWidth="max-w-md">
                <CreateReversal
                    isModalOpen={setIsModalReversalOpen}
                    product={findProduct}
                    warehouse={warehouse}
                    warehouses={warehouses}
                    notification={notification}
                    date={getCurrentDate()}
                    fetchWarehouseStock={fetchWarehouseStock}
                />
            </Modal>
        </>
    );
};

export default ProductTable;
