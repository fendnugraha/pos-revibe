"use client";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Notification from "@/components/Notification";
import axios from "@/libs/axios";
import DateTimeNow from "@/libs/dateTimeNow";
import { formatRupiah } from "@/libs/format";
import { LoaderCircleIcon, MinusIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ImportItemMutation from "./ImportItemMutation";
import Modal from "@/components/Modal";

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler); // Clean up on component unmount or when value changes
        };
    }, [value, delay]);

    return debouncedValue;
};

const ItemMutation = () => {
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const { today } = DateTimeNow();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [productList, setProductList] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const debouncedSearch = useDebounce(search, 500); // Apply debounce with 500ms delay
    const [mutationCart, setMutationCart] = useState([]);
    const [showProductList, setShowProductList] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalImportItemMutationOpen, setIsModalImportItemMutationOpen] = useState(false);
    const closeModal = () => {
        setIsModalImportItemMutationOpen(false);
    };

    const productReff = useRef();

    useEffect(() => {
        document.addEventListener("click", (event) => {
            if (productReff.current && !productReff.current.contains(event.target)) {
                setShowProductList(false);
            }
        });
    }, []);

    const fetchWarehouses = useCallback(async () => {
        try {
            const response = await axios.get("/api/warehouse");
            setWarehouses(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const fetchProduct = useCallback(async () => {
        if (debouncedSearch.length > 3) {
            setLoading(true);
            try {
                const response = await axios.get("/api/products", {
                    params: { search: debouncedSearch },
                });
                setProductList(response.data.data);
            } catch (error) {
                console.log("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setProductList([]); // Clear product list if search is too short
        }
    }, [debouncedSearch]);

    const handleAddToCart = (product) => {
        setMutationCart((prevpart) => {
            const existingProduct = prevpart.find((item) => item.id === product.id);
            if (existingProduct) {
                // If product is already in the part, increase its quantity
                return prevpart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }
            // Otherwise, add the product to the part with quantity 1
            return [...prevpart, { ...product, quantity: 1 }];
        });

        setNotification({
            type: "success",
            message: "Product added to cart",
        });
    };

    const [loaded, setLoaded] = useState(false);

    // Load part from localStorage on component mount
    useEffect(() => {
        const storedPart = JSON.parse(localStorage.getItem("mutationCart")) || [];
        if (storedPart) {
            setMutationCart(storedPart);
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) {
            localStorage.setItem("mutationCart", JSON.stringify(mutationCart));
        }
    }, [mutationCart, loaded]);

    const handleIncrementQuantity = (product) => {
        setMutationCart((prevpart) => {
            return prevpart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        });
    };

    // Subtract quantity by 1
    const handleDecrementQuantity = (product) => {
        //if quantity is 1, remove product from part
        if (product.quantity === 1) {
            handleRemoveFromPart(product);
            return;
        }
        setMutationCart((prevpart) => {
            return prevpart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item));
        });
    };

    const handleUpdateQuantity = (product, newQuantity) => {
        setMutationCart((prevpart) => {
            return prevpart.map((item) => (item.id === product.id ? { ...item, quantity: newQuantity } : item));
        });
    };

    const handleRemoveFromPart = (product) => {
        setMutationCart((prevpart) => prevpart.filter((item) => item.id !== product.id));
    };

    const handleClearPart = () => {
        setMutationCart([]);
    };

    // Fetch product list when debounced search term changes
    useEffect(() => {
        fetchProduct();
    }, [debouncedSearch, fetchProduct]);

    const [formData, setFormData] = useState({
        date_issued: today,
        from: "",
        to: "",
    });

    const handleCreateMutation = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/api/transfer-item", { ...formData, cart: mutationCart });
            setNotification({ type: "success", message: response.data.message });
            handleClearPart();
            setFormData({
                date_issued: today,
                from: "",
                to: "",
            });
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Inventory", href: "/inventory" },
                    { name: "Inventory Management", href: "/inventory" },
                    { name: "Item Mutation", href: "/inventory/mutation" },
                ]}
            />
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 sm:col-span-2">
                    <div className="relative" ref={productReff}>
                        <div className="flex items-end gap-4 mb-2">
                            <Input
                                type="search"
                                onClick={() => setShowProductList(true)}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                                placeholder="Search"
                            />
                        </div>

                        <div
                            className={`absolute min-w-3/4 bg-slate-400 text-white rounded-xl shadow-2xl ${
                                showProductList ? "py-1 h-fit" : "h-0 overflow-hidden"
                            } transition-all duration-300 ease-in-out`}
                        >
                            {productList.data?.length > 0 ? (
                                productList.data?.map((item) => (
                                    <div
                                        className="flex justify-between items-center group dark:hover:bg-slate-700 px-3 py-1 last:border-0 border-b border-dashed border-slate-300"
                                        key={item.id}
                                    >
                                        <div>
                                            <h2 className="text-sm group-hover:font-semibold">
                                                {item.code} {item.name}
                                            </h2>
                                            <p className="text-xs">
                                                {formatRupiah(item.price)} / {item.category?.name}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(item)}
                                            className="rounded-lg p-2 text-xs bg-lime-300 hover:bg-lime-400 dark:bg-lime-500 text-lime-900 cursor-pointer focus:scale-95"
                                        >
                                            Tambah part
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex justify-center items-center h-full">
                                    <p className="text-sm">{!search ? "Type to search ..." : loading ? "finding product..." : "No results found"}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 card">
                        <div className="flex justify-between items-center px-4 py-4">
                            <h1 className="font-bold text-lg">
                                Mutation List{" "}
                                <span className="text-gray-500">
                                    ({mutationCart.length} {mutationCart.length === 1 ? "item" : "items"})
                                </span>
                            </h1>
                            <button
                                type="button"
                                onClick={() => setIsModalImportItemMutationOpen(true)}
                                disabled={mutationCart.length > 0}
                                className="bg-red-500 px-4 py-2 rounded-lg text-white cursor-pointer hover:bg-red-400 disabled:bg-red-300 disabled:cursor-not-allowed"
                            >
                                Import Excel
                            </button>
                        </div>
                        <div className="max-h-[calc(85px*5)] overflow-auto border-t border-slate-300">
                            {mutationCart.length > 0 ? (
                                mutationCart.map((item) => (
                                    <div className="flex justify-between items-center p-4 last:border-0 border-b border-dashed border-slate-300" key={item.id}>
                                        <div>
                                            <h2 className="mb-2 font-semibold text-sm">{item.name}</h2>
                                            <div className="flex gap-4">
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => handleDecrementQuantity(item)}
                                                        disabled={item.quantity === 1}
                                                        className="w-7 h-7 flex items-center justify-center hover:scale-105 disabled:bg-slate-400 rounded-full bg-red-500 text-white"
                                                    >
                                                        <MinusIcon size={20} />
                                                    </button>
                                                    <h1 className="px-4 min-w-12 text-center">{item.quantity}</h1>
                                                    <button
                                                        onClick={() => handleIncrementQuantity(item)}
                                                        className="w-7 h-7 flex items-center justify-center hover:scale-105 disabled:bg-slate-400 rounded-full bg-green-500 text-white"
                                                    >
                                                        <PlusIcon size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className={`text-center border border-blue-300 rounded-lg py-1 px-2 ${
                                                    selectedProduct === item.id ? "w-18 opacity-100" : "w-0 opacity-0"
                                                } transition-all duration-300 ease-in-out`}
                                                value={item.quantity}
                                                min={1}
                                                onChange={(e) => handleUpdateQuantity(item, e.target.value)}
                                            />
                                            <button
                                                onClick={(e) => (selectedProduct === item.id ? setSelectedProduct(null) : setSelectedProduct(item.id))}
                                                className="bg-blue-500 text-white hover:bg-blue-400 rounded-full p-2 text-xs  cursor-pointer focus:scale-95"
                                            >
                                                {selectedProduct === item.id ? <XIcon size={12} /> : <PencilIcon size={12} />}
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFromPart(item)}
                                                className="bg-red-500 text-white hover:bg-red-400 rounded-full p-2 text-xs  cursor-pointer focus:scale-95"
                                            >
                                                <Trash2Icon size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex justify-center items-center h-full py-12">
                                    <h1 className="text-sm text-slate-300">Cart is empty</h1>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="card p-4">
                    <h1 className="card-title mb-4">Mutation Details</h1>
                    <form onSubmit={handleCreateMutation}>
                        <div className="mb-2">
                            <Label htmlFor="date_issued">Tanggal:</Label>
                            <input
                                type="datetime-local"
                                className="form-control w-full"
                                id="date_issued"
                                value={formData.date_issued}
                                onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                            />
                        </div>
                        <div className="mb-2">
                            <Label htmlFor="from">Dari:</Label>
                            <select
                                className="form-control w-full"
                                id="from"
                                value={formData.from}
                                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                            >
                                <option value="">Pilih cabang</option>
                                {warehouses.data
                                    ?.filter((warehouse) => warehouse.id !== Number(formData.to))
                                    .map((warehouse) => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="mb-2">
                            <Label htmlFor="to">Ke:</Label>
                            <select
                                className="form-control w-full"
                                id="to"
                                value={formData.to}
                                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                                disabled={!formData.from}
                            >
                                <option value="">Pilih cabang</option>
                                {warehouses.data
                                    ?.filter((warehouse) => warehouse.id !== Number(formData.from))
                                    .map((warehouse) => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="flex justify-end mt-4 gap-2">
                            <Button
                                buttonType="dark"
                                onClick={handleCreateMutation}
                                disabled={!formData.from || !formData.to || mutationCart.length === 0 || loading}
                            >
                                {loading ? <LoaderCircleIcon className="animate-spin" /> : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
            <Modal isOpen={isModalImportItemMutationOpen} onClose={closeModal} modalTitle="Import Mutasi Barang" maxWidth="max-w-3xl">
                <ImportItemMutation
                    isModalOpen={setIsModalImportItemMutationOpen}
                    setMutationCart={setMutationCart}
                    setNotification={setNotification}
                    today={today}
                    warehouses={warehouses}
                />
            </Modal>
        </>
    );
};

export default ItemMutation;
