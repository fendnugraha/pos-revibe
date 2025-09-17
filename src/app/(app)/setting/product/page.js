"use client";
import Button from "@/components/Button";
import { Download, FileUp, MessageCircleWarningIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon } from "lucide-react";
import Input from "@/components/Input";
import { useCallback, useEffect, useState } from "react";
import Modal from "@/components/Modal";
import CreateProduct from "./CreateProduct";
import CreateCategoryProduct from "./CreateCategoryProduct";
import axios from "@/libs/axios";
import Notification from "@/components/Notification";
import formatNumber from "@/libs/formatNumber";
import EditProduct from "./EditProduct";
import Paginator from "@/components/Paginator";
import Breadcrumb from "@/components/Breadcrumb";
import ImportProducts from "./ImportProduct";
import ImportCategoryProducts from "./ImportCategory";
import Link from "next/link";
import exportToExcel from "@/libs/exportToExcel";
import { formatDateTime } from "@/libs/format";

const Product = () => {
    const [product, setProduct] = useState(null);
    const [productCategories, setProductCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [errors, setErrors] = useState([]); // Store validation errors

    const [isModalCreateProductOpen, setIsModalCreateProductOpen] = useState(false);
    const [isModalCreateCategoryProductOpen, setIsModalCreateCategoryProductOpen] = useState(false);
    const [isModalUpdateProductOpen, setIsModalUpdateProductOpen] = useState(false);
    const [isModalDeleteProductOpen, setIsModalDeleteProductOpen] = useState(false);
    const [isModalImportProductOpen, setIsModalImportProductOpen] = useState(false);
    const [isModalImportCategoryProductOpen, setIsModalImportCategoryProductOpen] = useState(false);

    const closeModal = () => {
        setIsModalCreateProductOpen(false);
        setIsModalCreateCategoryProductOpen(false);
        setIsModalUpdateProductOpen(false);
        setIsModalDeleteProductOpen(false);
        setIsModalImportProductOpen(false);
        setIsModalImportCategoryProductOpen(false);
        // setIsModalUpdateAccountOpen(false)
    };

    const fetchProducts = useCallback(
        async (url = "/api/products") => {
            setLoading(true);
            try {
                const response = await axios.get(url, {
                    params: {
                        search: search,
                    },
                });
                setProduct(response.data.data);
            } catch (error) {
                setErrors(error.response?.data?.errors || ["Something went wrong."]);
            } finally {
                setLoading(false);
            }
        },
        [search]
    );

    useEffect(() => {
        fetchProducts("/api/products");
    }, [fetchProducts]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts("/api/products");
        }, 500);

        return () => clearTimeout(timeout);
    }, [search, fetchProducts]);

    const fetchProductCategories = useCallback(async () => {
        try {
            const response = await axios.get("api/product-categories");
            setProductCategories(response.data.data);
        } catch (error) {
            setErrors(error.response?.message || ["Something went wrong."]);
        }
    }, []);

    useEffect(() => {
        fetchProductCategories();
    }, [fetchProductCategories]);

    const handleChangePage = (url) => {
        fetchProducts(url);
    };

    const handleSelectProduct = (id) => {
        setSelectedProduct((prevSelected) => {
            // Check if the ID is already in the selectedProduct array
            if (prevSelected.includes(id)) {
                // If it exists, remove it
                return prevSelected.filter((productId) => productId !== id);
            } else {
                // If it doesn't exist, add it
                return [...prevSelected, id];
            }
        });
    };

    const handleDeleteProduct = async (id) => {
        try {
            const response = await axios.delete(`api/products/${id}`);
            setNotification({
                type: "success",
                message: response.data.message,
            });
            fetchProducts();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            setNotification({
                type: "error",
                message: error.response?.data?.message || "Delete failed",
            });
        }
    };

    const exportExcel = () => {
        const headers = [
            { key: "name", label: "Nama" },
            { key: "category", label: "Kategori" },
            { key: "price", label: "Harga Jual" },
            { key: "current_cost", label: "Harga Modal" },
        ];

        const data = product.getAllProducts?.data?.map((item) => ({
            name: item.name,
            category: item.category.name,
            price: formatNumber(item.price),
            current_cost: formatNumber(item.current_cost),
        }));

        exportToExcel(data, headers, `Laporan Produk ${formatDateTime(new Date())}.xlsx`, `Laporan Produk ${formatDateTime(new Date())}`);
    };
    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Setting", href: "/setting" },
                    { name: "Product", href: "/setting/product" },
                    { name: "Product List", href: "/setting/product" },
                ]}
            />
            <div className="">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
                <div className="flex gap-2 mb-4">
                    <Button buttonType="primary" onClick={() => setIsModalCreateProductOpen(true)} className={`flex item-center gap-2`}>
                        <PlusIcon size={20} /> Add Product
                    </Button>
                    <Button buttonType="primary" onClick={() => setIsModalCreateCategoryProductOpen(true)} className={`flex item-center gap-2`}>
                        <PlusIcon size={20} /> Add Category
                    </Button>

                    <Modal isOpen={isModalCreateProductOpen} onClose={closeModal} modalTitle="Create account">
                        <CreateProduct
                            isModalOpen={setIsModalCreateProductOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchProducts={fetchProducts}
                            productCategories={productCategories}
                        />
                    </Modal>
                    <Modal isOpen={isModalCreateCategoryProductOpen} onClose={closeModal} modalTitle="Create account">
                        <CreateCategoryProduct
                            isModalOpen={setIsModalCreateCategoryProductOpen}
                            notification={(type, message) => setNotification({ type, message })}
                            fetchProductCategories={fetchProductCategories}
                        />
                    </Modal>
                </div>
                <div className="card p-4">
                    <div className="flex justify-between items-start">
                        <h1 className="card-title mb-4">Product List</h1>
                        <div className="flex gap-2">
                            <button className="small-button !font-normal flex items-center gap-2" onClick={() => setIsModalImportProductOpen(true)}>
                                <FileUp size={20} /> Import
                            </button>
                            <button className="small-button !font-normal flex items-center gap-2" onClick={() => setIsModalImportCategoryProductOpen(true)}>
                                <FileUp size={20} /> Import Category
                            </button>
                            <button className="small-button !font-normal flex items-center gap-2" onClick={exportExcel}>
                                <Download size={20} /> Export
                            </button>
                        </div>
                    </div>
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
                    <div className="overflow-x-auto">
                        <table className="table w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="text-center">#</th>
                                    <th>Product</th>
                                    <th>Price (Jual)</th>
                                    <th>Cost (Beli)</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product?.products?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">No products found</td>
                                    </tr>
                                ) : (
                                    product?.products?.data?.map((product) => (
                                        <tr key={product.id}>
                                            <td className="text-center">
                                                <Input
                                                    checked={selectedProduct.includes(product.id)}
                                                    onChange={() => {
                                                        handleSelectProduct(product.id);
                                                    }}
                                                    type="checkbox"
                                                />
                                            </td>
                                            <td>
                                                <Link className="hover:underline" href={`/setting/product/history/${product.id}`}>
                                                    {product.name}
                                                </Link>
                                                <span className="block text-xs text-slate-400">
                                                    {product.code} {product.category?.name}
                                                </span>
                                            </td>
                                            <td>{formatNumber(product.price)}</td>
                                            <td>{formatNumber(product.current_cost)}</td>
                                            <td className="">
                                                <span className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductId(product.id);
                                                            setIsModalUpdateProductOpen(true);
                                                        }}
                                                        className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                    >
                                                        <PencilIcon className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProductId(product.id);
                                                            setIsModalDeleteProductOpen(true);
                                                        }}
                                                        className="cursor-pointer hover:scale-125 transition transform ease-in"
                                                    >
                                                        <TrashIcon className="size-4" />
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        <div className="px-4">
                            {product?.products?.last_page > 1 && <Paginator links={product.products} handleChangePage={handleChangePage} />}
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalUpdateProductOpen} onClose={closeModal} modalTitle="Edit Product" maxWidth="max-w-md">
                <EditProduct
                    isModalOpen={setIsModalUpdateProductOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchProducts={fetchProducts}
                    selectedProductId={selectedProductId}
                    products={product}
                    productCategories={productCategories}
                />
            </Modal>
            <Modal isOpen={isModalDeleteProductOpen} onClose={closeModal} modalTitle="Confirm Delete" maxWidth="max-w-md">
                <div className="flex flex-col items-center justify-center gap-3 mb-4">
                    <MessageCircleWarningIcon size={72} className="text-red-600" />
                    <p className="text-sm">Apakah anda yakin ingin menghapus produk ini (ID: {selectedProductId})?</p>
                </div>
                <div className="flex justify-center gap-3">
                    <Button
                        buttonType="neutral"
                        onClick={() => {
                            handleDeleteProduct(selectedProductId);
                            setIsModalDeleteProductOpen(false);
                        }}
                    >
                        Ya
                    </Button>
                    <Button buttonType="danger" onClick={() => setIsModalDeleteProductOpen(false)}>
                        Tidak
                    </Button>
                </div>
            </Modal>
            <Modal isOpen={isModalImportProductOpen} onClose={closeModal} modalTitle="Import Product" maxWidth="max-w-md">
                <ImportProducts isModalOpen={setIsModalImportProductOpen} fetchData={fetchProducts} setNotification={setNotification} />
            </Modal>
            <Modal isOpen={isModalImportCategoryProductOpen} onClose={closeModal} modalTitle="Import Category Product" maxWidth="max-w-md">
                <ImportCategoryProducts
                    isModalOpen={setIsModalImportCategoryProductOpen}
                    fetchData={fetchProductCategories}
                    setNotification={setNotification}
                />
            </Modal>
        </>
    );
};

export default Product;
