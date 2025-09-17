"use client";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Modal from "@/components/Modal";
import Notification from "@/components/Notification";
import axios from "@/libs/axios";
import DateTimeNow from "@/libs/dateTimeNow";
import { formatRupiah } from "@/libs/format";
import formatNumber from "@/libs/formatNumber";
import { LoaderCircleIcon, MinusIcon, PlusIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

const SalesOrder = () => {
    const PurchasePageBreadcrumb = [
        {
            name: "Inventory",
            href: "/inventory",
            current: false,
        },
        {
            name: "Sales Order",
            href: "/inventory/sales",
            current: true,
        },
    ];
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const { today } = DateTimeNow();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalCheckOutOpen, setIsModalCheckOutOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [productList, setProductList] = useState([]);
    const debouncedSearch = useDebounce(search, 500); // Apply debounce with 500ms delay
    const [cart, setCart] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
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

    const fetchContact = useCallback(async () => {
        try {
            const response = await axios.get("/api/contacts");
            setContacts(response.data.data);
        } catch (error) {
            console.log("Error fetching contacts:", error);
        }
    }, []);

    useEffect(() => {
        fetchContact();
    }, [fetchContact]);

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
        setCart((prevpart) => {
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
        setCart((prevpart) => {
            return prevpart.map((item) => (item.id === product.id ? { ...item, price: newPrice } : item));
        });
    };

    const handleIncrementQuantity = (product) => {
        setCart((prevpart) => {
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
        setCart((prevpart) => {
            return prevpart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item));
        });
    };

    // Calculate total price
    const calculateTotalPrice = useCallback(() => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
        // return cart.reduce((total, item) => total + item.cost * item.quantity, 0);
    }, [cart]);

    const calculateTotalQuantity = useCallback(() => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }, [cart]);

    // Remove product from part
    const handleRemoveFromPart = (product) => {
        setCart((prevpart) => prevpart.filter((item) => item.id !== product.id));
    };

    // Handle clear part
    const handleClearPart = () => {
        setCart([]);
    };

    // Load part from localStorage on component mount
    useEffect(() => {
        const storedPart = JSON.parse(localStorage.getItem("part")) || [];
        setCart(storedPart);
    }, []);

    // Fetch product list when debounced search term changes
    useEffect(() => {
        fetchProduct();
    }, [debouncedSearch, fetchProduct]);

    // Save part to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
        setTotalPrice(calculateTotalPrice());
    }, [cart, calculateTotalPrice]);

    const fetchAccountByIds = useCallback(async ({ account_ids }) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
            setAccounts(response.data.data);
        } catch (error) {
            setNotification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccountByIds({ account_ids: [1, 2] });
    }, [fetchAccountByIds]);

    const [formData, setFormData] = useState({
        date_issued: today,
        paymentMethod: "cash",
        paymentAccountID: "",
        discount: 0,
        shipping_cost: 0,
        contact_id: 1,
    });

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/api/sales-order", { ...formData, cart: cart });
            setNotification({ type: "success", message: response.data.message });
            handleClearPart();
            setFormData({
                date_issued: today,
                paymentMethod: "cash",
                paymentAccountID: "",
                discount: 0,
                shipping_cost: 0,
                contact_id: 1,
            });
            setIsModalCheckOutOpen(false);
        } catch (error) {
            setNotification({ type: "error", message: error.response?.data?.message || "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <Breadcrumb BreadcrumbArray={PurchasePageBreadcrumb} />
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
                        <h1 className="mb-2 font-bold text-lg px-4 pt-4">
                            Order List{" "}
                            <span className="text-gray-500">
                                ({cart.length} {cart.length === 1 ? "item" : "items"})
                            </span>
                        </h1>
                        <div className="max-h-[calc(85px*5)] overflow-auto border-t border-slate-300">
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <div className="flex justify-between items-center p-4 last:border-0 border-b border-dashed border-slate-300" key={item.id}>
                                        <div>
                                            <h2 className="mb-2 font-semibold text-sm">{item.name}</h2>
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
                        <Label>Supplier</Label>
                        <select
                            className="form-select w-full !bg-white"
                            value={formData.contact_id}
                            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                            disabled={loading}
                            required
                        >
                            <option value="">Pilih Supplier</option>
                            {contacts?.data?.map((contact) => (
                                <option key={contact.id} value={contact.id}>
                                    {contact.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-4 card p-4">
                        <h1 className="font-semibold text-sm">Total Bayar</h1>
                        <h1 className="font-semibold text-3xl">{formatRupiah(totalPrice)}</h1>
                    </div>
                    <Button buttonType="dark" onClick={() => setIsModalCheckOutOpen(true)} disabled={cart.length === 0} className="w-full mt-4">
                        Checkout
                    </Button>
                </div>
            </div>
            <Modal isOpen={isModalCheckOutOpen} onClose={closeModal} maxWidth={"max-w-2xl"} modalTitle="Checkout" bgColor="bg-white">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-900">Tanggal</label>
                            <input
                                type="datetime-local"
                                className="w-full border bg-white border-slate-200 px-4 py-1 rounded-xl"
                                value={formData.date_issued}
                                onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-900">Discount (Rp)</label>
                            <input
                                type="number"
                                className="w-full border bg-white border-slate-200 px-4 py-1 rounded-xl"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-900">Biaya Pengiriman (Rp)</label>
                            <input
                                type="number"
                                className="w-full border bg-white border-slate-200 px-4 py-1 rounded-xl"
                                value={formData.shipping_cost}
                                onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex bg-indigo-400 w-fit rounded-xl mb-2">
                            <button
                                className={`${
                                    formData.paymentMethod === "cash" ? "bg-indigo-600 text-white" : "text-white/50"
                                } py-0.5 px-3 cursor-pointer disabled:cursor-wait rounded-xl`}
                                disabled={loading}
                                onClick={() => setFormData({ ...formData, paymentMethod: "cash", paymentAccountID: "" })}
                            >
                                Cash
                            </button>
                            <button
                                className={`${
                                    formData.paymentMethod === "credit" ? "bg-indigo-600 text-white" : "text-white/50"
                                } text-white py-0.5 px-3 cursor-pointer disabled:cursor-wait rounded-xl`}
                                disabled={loading}
                                onClick={() => setFormData({ ...formData, paymentMethod: "credit", paymentAccountID: 7 })}
                            >
                                Credit
                            </button>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">Account Pembayaran</label>
                            <select
                                className="w-full border bg-white border-slate-200 px-4 py-1 rounded-xl mb-4 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                value={formData.paymentAccountID}
                                onChange={(e) => setFormData({ ...formData, paymentAccountID: e.target.value })}
                                disabled={loading || formData.paymentMethod === "credit"}
                                required
                            >
                                <option value="">Pilih Account Pembayaran</option>
                                {accounts?.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.acc_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">Supplier</label>
                            <select
                                className="w-full border bg-white border-slate-200 px-4 py-1 rounded-xl mb-4 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                value={formData.contact_id}
                                onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                                disabled={loading}
                                required
                            >
                                <option value="">Pilih Supplier</option>
                                {contacts?.data?.map((contact) => (
                                    <option key={contact.id} value={contact.id}>
                                        {contact.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <table className="w-full text-xs h-fit">
                            <tbody>
                                <tr>
                                    <td className="font-semibold p-1">Total</td>
                                    <td className="text-right p-1">Rp {formatNumber(totalPrice)}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold p-1">Discount</td>
                                    <td className="text-right p-1 text-red-500">Rp {formatNumber(formData.discount)}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold p-1">Biaya Pengiriman</td>
                                    <td className="text-right p-1">Rp {formatNumber(formData.shipping_cost)}</td>
                                </tr>
                                <tr className="border-t border-slate-500 border-dashed">
                                    <td className="font-semibold p-1">Total Pembayaran</td>
                                    <td className="text-right p-1">Rp {formatNumber(totalPrice - formData.discount + Number(formData.shipping_cost))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <Button buttonType="dark" onClick={handleCheckOut} disabled={loading}>
                    {loading ? <LoaderCircleIcon className="animate-spin" /> : "Simpan"}
                </Button>
            </Modal>
        </>
    );
};

export default SalesOrder;
