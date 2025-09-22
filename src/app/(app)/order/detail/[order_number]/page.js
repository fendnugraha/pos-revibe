"use client";
import Modal from "@/components/Modal";
import Notification from "@/components/Notification";
import StatusBadge from "@/components/StatusBadge";
import axios from "@/libs/axios";
import formatDateTime from "@/libs/formatDateTime";
import formatNumber from "@/libs/formatNumber";
import { ArrowLeftIcon, MailIcon, Pencil, PhoneCallIcon, ReceiptTextIcon, ShoppingBagIcon, SmartphoneIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import PartsTable from "../../components/PartsTable";
import CreatePaymentFrom from "../../components/CreatePaymentFrom";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
import { useAuth } from "@/libs/auth";
import OrderAction from "../OrderAction";
import PaymentEditForm from "./EditPayment";

const OrderDetail = ({ params }) => {
    const { user } = useAuth();
    const warehouseId = user?.role?.warehouse_id;
    const warehousePrimaryCashAccountId = user?.role?.warehouse?.primary_cash_account?.id;

    const { order_number } = use(params);
    const [notification, setNotification] = useState({
        type: "",
        message: "",
    });
    const [order, setOrder] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isModalCreatePaymentOpen, setIsModalCreatePaymentOpen] = useState(false);
    const [isModalEditPaymentOpen, setIsModalEditPaymentOpen] = useState(false);
    const closeModal = () => {
        setIsModalCreatePaymentOpen(false);
        setIsModalEditPaymentOpen(false);
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
    const totalPrice = order?.transaction?.stock_movements?.reduce((total, part) => total + part.price * -part.quantity, 0) || 0;
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
            <div className="mb-4 flex justify-between flex-col sm:flex-row items-start gap-4 sm:gap-0">
                <div>
                    <div className="flex items-center gap-2">
                        <Link className="underline hover:text-teal-500" href="/order">
                            <ArrowLeftIcon />
                        </Link>
                        <h1 className="text-slate-700">
                            <span className="tex-xs sm:text-xl font-bold">{order_number}</span>{" "}
                        </h1>
                        <div className="hidden sm:block">
                            <StatusBadge
                                status={!order?.payment_method || order?.payment_method === "Unpaid" ? "Pending" : "Completed"}
                                statusText={order?.payment_method ?? "Unpaid"}
                            />
                        </div>
                        <div className="hidden sm:block">
                            <StatusBadge status={order?.status} />
                        </div>
                    </div>
                    <div className="px-8 mt-1">
                        <p className="text-xs text-slate-400">
                            <span className="font-semibold">{order?.warehouse?.name}</span>, {formatDateTime(order?.date_issued)}{" "}
                            <span className="font-semibold">{order?.user?.name}</span>
                        </p>
                    </div>
                </div>
                {order && warehouseId === order?.warehouse_id && (
                    <OrderAction
                        status={order?.status}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        handleUpdateOrderStatus={handleUpdateOrderStatus}
                        user={user}
                        orderTechnicianId={order?.technician_id}
                        order_number={order?.order_number}
                        notification={setNotification}
                        fetchOrder={fetchOrder}
                    />
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-18 sm:mb-0">
                <div className="sm:col-span-2 card p-4">
                    <div className="mb-4 flex justify-between flex-col sm:flex-row gap-2 items-start">
                        <h1 className="card-title flex gap-2 items-center">
                            Part List <StatusBadge status={order?.status} />{" "}
                            <span className="text-slate-400 font-normal text-xs">({formatDateTime(order?.updated_at)})</span>
                        </h1>
                        {["In Progress", "Completed", "Finished"].includes(order?.status) && (
                            <div className="flex gap-2">
                                {!["Completed", "Finished"].includes(order?.status) && user?.id === order?.technician_id && (
                                    <Link href={`/order/add/${order_number}`}>
                                        <Button buttonType="success">Tambah Parts & Biaya</Button>
                                    </Link>
                                )}

                                {order?.status === "Completed" && (
                                    <Link href={`/order/invoice/${order_number}`} target="_blank" className="small-button">
                                        <ReceiptTextIcon size={20} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                    <PartsTable
                        parts={order?.transaction}
                        fetchOrder={fetchOrder}
                        notification={setNotification}
                        totalPrice={totalPrice}
                        orderId={order?.id}
                        orderStatus={order?.status}
                    />
                    <h1 className="text-slate-500 text-sm">Teknisi: {order?.technician?.name}</h1>
                    <hr className="border-slate-200 my-4" />
                    {!["Canceled", "Rejected"].includes(order?.status) && (
                        <>
                            <div className="mb-4 flex justify-between items-start flex-col sm:flex-row gap-2">
                                <h1 className="card-title flex gap-2 items-center mb-3">
                                    Order Summary{" "}
                                    <StatusBadge
                                        status={!order?.payment_method || order?.payment_method === "Unpaid" ? "Pending" : "Completed"}
                                        statusText={order?.payment_method ?? "Unpaid"}
                                    />
                                </h1>
                                {order?.status === "Finished" && warehouseId === order?.warehouse_id && (
                                    <button
                                        className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer text-sm"
                                        onClick={() => setIsModalCreatePaymentOpen(true)}
                                        hidden={order?.status === "Completed"}
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
                                        Number(totalPrice || 0) +
                                            Number(order?.journal?.service_fee?.credit || 0) -
                                            Number(order?.journal?.sales_discount?.debit || 0)
                                    )}
                                </span>
                            </p>
                        </>
                    )}
                    {order?.journal && (
                        <>
                            <hr className="border-slate-200 my-4" />
                            <div className="mt-4">
                                <h1 className="card-title mb-4">
                                    Payment Detail{"  "}
                                    <button className="small-button" onClick={() => setIsModalEditPaymentOpen(true)}>
                                        <Pencil size={12} />
                                    </button>
                                </h1>
                                <div className="">
                                    <p className="text-sm text-slate-500 flex items-center justify-between gap-2">
                                        <span className="font-semibold">Tanggal:</span> <span className="">{formatDateTime(order?.journal?.date_issued)}</span>
                                    </p>
                                    <p className="text-sm text-slate-500 flex items-center justify-between gap-2">
                                        <span className="font-semibold">Metode Pembayaran:</span> <span className="">{order?.payment_method}</span>
                                    </p>
                                    <p className="text-sm text-slate-500 flex items-center justify-between gap-2">
                                        <span className="font-semibold">Bank/Rekening:</span>{" "}
                                        <span className="">
                                            {order?.journal?.entries?.find((e) => [1, 2, 4, 5].includes(e?.chart_of_account?.account_id))?.chart_of_account
                                                ?.acc_name ?? "N/A"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div>
                    <div className="card p-4 mb-4">
                        <h1 className="card-title mb-2">Order Note</h1>
                        <p className="text-sm text-slate-500">{order?.description}</p>
                    </div>
                    <div className="card p-4 mb-4">
                        <h1 className="card-title mb-2">Customer</h1>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                            <User2Icon size={`18`} /> {order?.contact?.name}
                        </p>
                        <p className="text-sm font-semibold text-red-500 flex items-center gap-2 mb-2">
                            <SmartphoneIcon size={`18`} /> {order?.phone_type?.toUpperCase()}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            {" "}
                            <ShoppingBagIcon size={`18`} />
                            <span className="font-semibold">{order?.invoice || "-"}</span>
                        </p>
                    </div>
                    <div className="card p-4">
                        <h1 className="card-title mb-2">Contact Information</h1>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mb-1">
                            <MailIcon size={`18`} /> {order?.contact?.mail || "-"}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                            {" "}
                            <PhoneCallIcon size={`18`} />
                            {order?.contact?.phone_number || "-"}
                        </p>
                        <p className="text-sm text-slate-500">
                            {" "}
                            <span className="font-semibold block">Alamat Pengiriman & Penagihan:</span>
                            {order?.contact?.address || "-"}
                        </p>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalCreatePaymentOpen} onClose={closeModal} modalTitle="Input Pembayaran" maxWidth="max-w-3xl">
                <CreatePaymentFrom
                    order={order}
                    isModalOpen={setIsModalCreatePaymentOpen}
                    notification={(type, message) => setNotification({ type, message })}
                    fetchOrder={fetchOrder}
                    totalPrice={totalPrice}
                    order_number={order_number}
                    warehouseId={warehouseId}
                    warehousePrimaryCashAccountId={warehousePrimaryCashAccountId}
                />
            </Modal>
            <Modal isOpen={isModalEditPaymentOpen} onClose={closeModal} modalTitle="Edit Pembayaran" maxWidth="max-w-md">
                <PaymentEditForm
                    order={order}
                    isModalOpen={setIsModalEditPaymentOpen}
                    notification={setNotification}
                    fetchOrder={fetchOrder}
                    totalPrice={totalPrice}
                    order_number={order_number}
                    warehouseId={warehouseId}
                    warehousePrimaryCashAccountId={warehousePrimaryCashAccountId}
                />
            </Modal>
        </>
    );
};

export default OrderDetail;
