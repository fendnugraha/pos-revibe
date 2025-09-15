"use client";
import Breadcrumb from "@/components/Breadcrumb";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Modal from "@/components/Modal";
import Paginator from "@/components/Paginator";
import axios from "@/libs/axios";
import { formatDate, formatDateTime, todayDate } from "@/libs/format";
import { DownloadIcon, FilterIcon } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";

const ProductHistory = ({ params }) => {
    const { id } = use(params);

    const [startDate, setStartDate] = useState(todayDate());
    const [endDate, setEndDate] = useState(todayDate());
    const [searchTerm, setSearchTerm] = useState("");

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProduct = useCallback(
        async (url = `/api/product-history/${id}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: searchTerm,
                        start_date: startDate,
                        end_date: endDate,
                    },
                });
                setProducts(response.data.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        },
        [id, searchTerm, startDate, endDate]
    );

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const handleChangePage = (url) => {
        fetchProduct(url);
    };

    const [isModalFilterJournalOpen, setIsModalFilterJournalOpen] = useState(false);

    const closeModal = () => {
        setIsModalFilterJournalOpen(false);
    };
    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Setting", href: "/setting" },
                    { name: "Product", href: "/setting/product" },
                    { name: "Product List", href: "/setting/product" },
                    { name: "Product History", href: `/setting/product/history/${id}` },
                ]}
            />
            <div className="card p-4">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="card-title mb-4">
                        Product History: {products.product?.name}
                        <span className="card-subtitle">
                            Periode: {formatDate(startDate)} - {formatDate(endDate)}
                        </span>
                    </h1>
                    <div className="flex items-center gap-1">
                        <button className="small-button">
                            <DownloadIcon size={18} />
                        </button>
                        <button onClick={() => setIsModalFilterJournalOpen(true)} className="small-button">
                            <FilterIcon size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table text-xs w-full ">
                        <thead>
                            <tr>
                                <th>Waktu</th>
                                <th>Invoice</th>
                                <th>Qty</th>
                                <th>Type</th>
                                <th>Cabang</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.stock_movements?.data?.map((log, index) => (
                                <tr key={log.id}>
                                    <td className="text-center">{formatDateTime(log.date_issued)}</td>
                                    <td className="text-center">{log.transaction?.invoice}</td>
                                    <td className="text-center">{log.quantity}</td>
                                    <td className="text-center">{log.transaction_type}</td>
                                    <td className="text-center">{log.warehouse?.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4">
                    {products?.stock_movements?.last_page > 1 && <Paginator links={products.ostock_movements} handleChangePage={handleChangePage} />}
                </div>
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
                        fetchProduct();
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

export default ProductHistory;
