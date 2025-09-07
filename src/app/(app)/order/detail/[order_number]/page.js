"use client";
import Modal from "@/components/Modal";
import Notification from "@/components/Notification";
import StatusBadge from "@/components/StatusBadge";
import axios from "@/libs/axios";
import TimeAgo from "@/libs/formatDateDistance";
import formatDateTime from "@/libs/formatDateTime";
import formatNumber from "@/libs/formatNumber";
import { ArrowLeftIcon, MailIcon, Phone, PhoneCallIcon, PhoneIcon, PinIcon, ReceiptTextIcon, ShoppingBagIcon, SmartphoneIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import PartsTable from "../../components/PartsTable";
import CreatePaymentFrom from "../../components/CreatePaymentFrom";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import { useAuth } from "@/libs/auth";

const OrderDetail = ({ params }) => {
    const { user } = useAuth();
    const warehouseId = user?.role?.warehouse_id;
    const { order_number } = use(params);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [order, setOrder] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isModalCreatePaymentOpen, setIsModalCreatePaymentOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreatePaymentOpen(false);
    };

    const fetchOrder = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/get-order-by-order-number/${order_number}`);
            setOrder(response.data.data);
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setIsLoading(false);
        }
    }, [order_number]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleUpdateOrderStatus = async (status) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`/api/update-order-status`, {
                order_number: order_number,
                status: status,
            });
            setNotification({ type: "success", message: response.data.message });
            fetchOrder();
        } catch (error) {
            console.error("Error updating order status:", error);
            setNotification({ type: "error", message: error.response.data.message });
        } finally {
            setIsLoading(false);
        }
    };
    console.log(order);
    const totalPrice = order.transaction?.stock_movements?.reduce((total, part) => total + part.price * -part.quantity, 0);
    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Order", href: "/order" },
                    { name: "Order Detail", href: `/order/detail/${order_number}` },
                ]}
            />
            {notification.message && (
                <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
            )}
            <div className="mb-4 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <Link className="underline hover:text-teal-500" href="/order">
                            <ArrowLeftIcon />
                        </Link>
                        <h1 className="text-slate-700">
                            Order ID: <span className="text-xl font-bold">{order_number}</span>{" "}
                        </h1>
                        <StatusBadge
                            status={!order.transaction?.payment_method || order.transaction?.payment_method === "Unpaid" ? "Pending" : "Completed"}
                            statusText={order.transaction?.payment_method ?? "Unpaid"}
                        />
                        <StatusBadge status={order.status} />
                    </div>
                    <div className="px-8 mt-1">
                        <p className="text-xs text-slate-400">
                            Created by <span className="font-semibold">{order.user?.name}</span> on{" "}
                            <span className="font-semibold">{formatDateTime(order.date_issued)}</span> at{" "}
                            <span className="font-semibold">{order.warehouse?.name}</span>
                        </p>
                    </div>
                </div>
                <select
                    disabled={
                        order.status === "Finished" || order.status === "Completed" || order.status === "Canceled" || order.status === "Rejected" || isLoading
                    }
                    onChange={(e) => handleUpdateOrderStatus(e.target.value)}
                    value={order.status}
                    className="form-select w-1/4"
                >
                    <option value={"Pending"}>-Pilih tindakan-</option>
                    {order.status !== "In Progress" ? (
                        <>
                            <option value="In Progress">Proses</option>
                            <option value="Rejected">Tolak</option>
                        </>
                    ) : (
                        <>
                            <option value="Take Over">Ambil Alih</option>
                            <option value="Canceled">Batalkan</option>
                        </>
                    )}
                </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 card p-4">
                    <div className="mb-4 flex justify-between items-start">
                        <h1 className="card-title flex gap-2 items-center">
                            Part List <StatusBadge status={order.status} />{" "}
                            <span className="text-slate-400 font-normal text-xs">({formatDateTime(order.updated_at)})</span>
                        </h1>
                        {["In Progress", "Completed", "Finished"].includes(order.status) && (
                            <div className="flex gap-2">
                                {!["Completed", "Finished"].includes(order.status) && user?.id === order.technician_id && (
                                    <Link href={`/order/add/${order_number}`}>
                                        <Button buttonType="success">Tambah Parts & Biaya</Button>
                                    </Link>
                                )}

                                {order.status === "Completed" && (
                                    <Link href={`/order/invoice/${order_number}`} target="_blank" className="small-button">
                                        <ReceiptTextIcon size={20} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                    <PartsTable parts={order.transaction} totalPrice={totalPrice} />
                    <h1 className="text-slate-500 text-sm">Teknisi: {order.technician?.name}</h1>
                    <hr className="border-slate-200 my-4" />
                    <div className="mb-4 flex justify-between items-start">
                        <h1 className="card-title flex gap-2 items-center mb-4">
                            Order Summary{" "}
                            <StatusBadge
                                status={!order.transaction?.payment_method || order.transaction?.payment_method === "Unpaid" ? "Pending" : "Completed"}
                                statusText={order.transaction?.payment_method ?? "Unpaid"}
                            />
                        </h1>
                        {order.status === "Finished" && (
                            <button
                                className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer text-sm"
                                onClick={() => setIsModalCreatePaymentOpen(true)}
                                hidden={order.status === "Completed"}
                            >
                                Input Pembayaran
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 flex items-center justify-between gap-2">
                        Subtotal: <span className="font-semibold">{formatNumber(totalPrice || 0)}</span>
                    </p>
                    <p className="text-sm text-red-500 flex items-center justify-between gap-2">
                        Discount: <span className="font-semibold">{formatNumber(-order?.journal?.sales_discount?.debit || 0)}</span>
                    </p>
                    <p className="text-sm text-slate-500 flex items-center justify-between gap-2">
                        Biaya Jasa Service: <span className="font-semibold">{formatNumber(order?.journal?.service_fee?.credit || 0)}</span>
                    </p>
                    <hr className="border-slate-200 my-2 border-dashed" />
                    <p className="text-sm font-semibold text-slate-800 flex items-center justify-between gap-2">
                        Total{" "}
                        <span className="">
                            {formatNumber(
                                Number(totalPrice || 0) + Number(order?.journal?.service_fee?.credit || 0) - Number(order?.journal?.sales_discount?.debit || 0)
                            )}
                        </span>
                    </p>
                </div>
                <div>
                    <div className="card p-4 mb-4">
                        <h1 className="card-title mb-2">Order Note</h1>
                        <p className="text-sm text-slate-500">{order.description}</p>
                    </div>
                    <div className="card p-4 mb-4">
                        <h1 className="card-title mb-2">Customer</h1>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                            <User2Icon size={`18`} /> {order.contact?.name}
                        </p>
                        <p className="text-sm font-semibold text-red-500 flex items-center gap-2 mb-2">
                            <SmartphoneIcon size={`18`} /> {order.phone_type?.toUpperCase()}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            {" "}
                            <ShoppingBagIcon size={`18`} />
                            <span className="font-semibold">{order.invoice || "-"}</span>
                        </p>
                    </div>
                    <div className="card p-4">
                        <h1 className="card-title mb-2">Contact Information</h1>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                            <MailIcon size={`18`} /> {order.contact?.mail || "-"}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                            {" "}
                            <PhoneCallIcon size={`18`} />
                            {order.contact?.phone_number || "-"}
                        </p>
                        <p className="text-sm text-slate-500">
                            {" "}
                            <span className="font-semibold block">Alamat Pengiriman & Penagihan:</span>
                            {order.contact?.address || "-"}
                        </p>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalCreatePaymentOpen} onClose={closeModal} modalTitle="Input Pembayaran" maxWidth="max-w-2xl">
                <CreatePaymentFrom
                    order={order}
                    isModalOpen={setIsModalCreatePaymentOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchOrder={fetchOrder}
                    totalPrice={totalPrice}
                    order_number={order_number}
                    warehouseId={warehouseId}
                />
            </Modal>
        </>
    );
};

export default OrderDetail;
