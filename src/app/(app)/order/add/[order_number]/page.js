"use client";
import ProductCard from "@/app/(app)/inventory/components/ProductCard";
import MainPage from "@/app/(app)/main";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Modal from "@/components/Modal";
import Notification from "@/components/Notification";
import axios from "@/libs/axios";
import { formatRupiah } from "@/libs/format";
import formatNumber from "@/libs/formatNumber";
import { CheckCircle, LoaderCircleIcon, MinusIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useRef, useState } from "react";

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

const AddPartsReplacement = ({ params }) => {
    const router = useRouter();
    const { order_number } = use(params);
    const OrderPageBreadcrumb = [
        {
            name: "Order",
            href: "/order",
            current: false,
        },
        {
            name: "Detail",
            href: `/order/detail/${order_number}`,
            current: false,
        },
        {
            name: "Add parts",
            href: `/order/add/${order_number}`,
            current: true,
        },
    ];
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [isModalCheckOutOpen, setIsModalCheckOutOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [productList, setProductList] = useState([]);
    const debouncedSearch = useDebounce(search, 500); // Apply debounce with 500ms delay
    const [part, setPart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isPartsAdded, setIsPartsAdded] = useState(false);
    const [showProductList, setShowProductList] = useState(false);
    const productReff = useRef();

    useEffect(() => {
        document.addEventListener("click", (event) => {
            if (productReff.current && !productReff.current.contains(event.target)) {
                setShowProductList(false);
            }
        });
    }, []);
    const closeModal = () => {
        setIsModalCheckOutOpen(false);
    };

    // Fetch product list based on debounced search term
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

    // Add product to part
    const handleAddToCart = (product) => {
        setPart((prevpart) => {
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

    const handleUpdatePrice = (product, newPrice) => {
        setPart((prevpart) => {
            return prevpart.map((item) => (item.id === product.id ? { ...item, price: newPrice } : item));
        });
    };

    const handleIncrementQuantity = (product) => {
        setPart((prevpart) => {
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
        setPart((prevpart) => {
            return prevpart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item));
        });
    };

    // Calculate total price
    const calculateTotalPrice = useCallback(() => {
        const totalPartcost = part.reduce((total, item) => total + item.price * item.quantity, 0);

        return totalPartcost;
        // return part.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [part]);

    const calculateTotalQuantity = useCallback(() => {
        return part.reduce((total, item) => total + item.quantity, 0);
    }, [part]);

    // Remove product from part
    const handleRemoveFromPart = (product) => {
        setPart((prevpart) => prevpart.filter((item) => item.id !== product.id));
    };

    // Handle clear part
    const handleClearPart = () => {
        setPart([]);
    };

    // Load part from localStorage on component mount
    useEffect(() => {
        const storedPart = JSON.parse(localStorage.getItem("part")) || [];
        setPart(storedPart);
    }, []);

    // Fetch product list when debounced search term changes
    useEffect(() => {
        fetchProduct();
    }, [debouncedSearch, fetchProduct]);

    // Save part to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("part", JSON.stringify(part));
        setTotalPrice(calculateTotalPrice());
    }, [part, calculateTotalPrice]);

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/api/add-parts-to-order", {
                order_number,
                parts: part,
            });
            setNotification({ type: "success", message: response.data.message });
            handleClearPart();
            setIsPartsAdded(true);
        } catch (error) {
            const message = error.response?.data?.message || "Something went wrong.";
            setNotification({ type: "error", message });
        } finally {
            setLoading(false);
            setIsModalCheckOutOpen(false);
        }
    };

    const filteredProductList = productList.data?.filter((product) => !["hp second"].includes(product.category?.name));
    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            {isPartsAdded && (
                <div className="fixed top-0 left-0 w-full h-full flex flex-col gap-4 items-center justify-center bg-black/20 backdrop-blur-xl z-50">
                    <CheckCircle size={120} className="text-green-500" />
                    <h1 className="text-2xl font-bold">Sparepart berhasil ditambahkan</h1>
                    <div>
                        <Link className="hover:underline mr-4" href={`/order/detail/${order_number}`}>
                            Kembali
                        </Link>
                        <button className="hover:underline cursor-pointer" onClick={() => setIsPartsAdded(false)}>
                            Tambah Lagi
                        </button>
                    </div>
                </div>
            )}
            <Breadcrumb BreadcrumbArray={OrderPageBreadcrumb} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 sm:col-span-2">
                    <div className="relative" ref={productReff}>
                        <Label>Cari barang</Label>
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
                            {filteredProductList?.length > 0 ? (
                                filteredProductList?.map((item) => (
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
                        <h1 className="mb-2 font-bold text-lg px-4 pt-4">
                            Order List{" "}
                            <span className="text-gray-500">
                                ({part.length} {part.length === 1 ? "item" : "items"})
                            </span>
                        </h1>
                        <div className="max-h-[calc(85px*5)] overflow-auto border-t border-slate-300">
                            {part.length > 0 ? (
                                part.map((item) => (
                                    <div className="flex justify-between items-center p-4 last:border-0 border-b border-dashed border-slate-300" key={item.id}>
                                        <div>
                                            <h2 className="mb-2 font-semibold text-sm">
                                                {item.code} {item.name} / {item.category?.name}
                                            </h2>
                                            <div className="flex gap-4">
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => handleDecrementQuantity(item)}
                                                        disabled={item.quantity === 1}
                                                        className="w-7 h-7 flex items-center justify-center hover:scale-105 disabled:bg-slate-400 rounded-full bg-slate-500 text-white"
                                                    >
                                                        <MinusIcon size={20} />
                                                    </button>
                                                    <h1 className="px-4 min-w-12 text-center">{item.quantity}</h1>
                                                    <button
                                                        onClick={() => handleIncrementQuantity(item)}
                                                        disabled={item.is_service === 1}
                                                        className="w-7 h-7 flex items-center justify-center hover:scale-105 disabled:bg-slate-400 rounded-full bg-slate-500 text-white"
                                                    >
                                                        <PlusIcon size={20} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <label className="font-medium text-xs text-gray-700 dark:text-white mb-1">Rp</label>
                                                    <input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => handleUpdatePrice(item, e.target.value)}
                                                        className="w-auto text-sm border border-slate-300 rounded-xl px-4 py-1"
                                                        placeholder="Harga"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <h1 className="text-lg font-semibold">
                                                <span className="text-gray-500 text-sm block text-end">Subtotal</span>
                                                {formatRupiah(item.price * item.quantity)}
                                            </h1>
                                            <button
                                                onClick={() => handleRemoveFromPart(item)}
                                                className="bg-red-500 text-white hover:bg-red-400 rounded-full p-2 text-xs  cursor-pointer focus:scale-95"
                                            >
                                                <XIcon size={12} />
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
                <div className="">
                    <div>
                        <Label>Order Number</Label>
                        <Input value={order_number} className="w-full" disabled />
                    </div>
                    <div className="mt-4 card p-4">
                        <h1 className="font-semibold text-sm">Total Bayar</h1>
                        <h1 className="font-semibold text-3xl">{formatRupiah(totalPrice)}</h1>
                    </div>
                    <Button buttonType="dark" onClick={() => setIsModalCheckOutOpen(true)} disabled={part.length === 0} className="w-full mt-4">
                        Checkout
                    </Button>
                </div>
            </div>
            <Modal isOpen={isModalCheckOutOpen} onClose={closeModal} maxWidth={"max-w-sm"} modalTitle="Checkout" bgColor="bg-white">
                <div className="flex justify-center flex-col items-center gap-2 border-b border-gray-300 border-dashed py-2">
                    <h1 className="text-7xl text-green-500 font-bold">{calculateTotalQuantity()}</h1>
                    <span className="text-sm font-light">{calculateTotalQuantity() > 1 ? "Items" : "Item"}</span>
                </div>
                <div className="flex justify-between items-center my-4">
                    <h1 className="text-xl">Total</h1>
                    <h1 className="text-xl">Rp. {formatNumber(totalPrice)}</h1>
                </div>
                <button
                    onClick={handleCheckOut}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white py-4 px-6 disabled:bg-slate-300 disabled:cursor-wait rounded-full"
                    disabled={loading}
                >
                    {loading ? <LoaderCircleIcon className="animate-spin" /> : "Simpan"}
                </button>
            </Modal>
        </>
    );
};

export default AddPartsReplacement;
