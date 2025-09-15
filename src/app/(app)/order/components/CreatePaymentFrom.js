import axios from "@/libs/axios";
import DateTimeNow from "@/libs/dateTimeNow";
import formatNumber from "@/libs/formatNumber";
import { useCallback, useEffect, useState } from "react";

const CreatePaymentFrom = ({ isModalOpen, notification, fetchOrder, totalPrice, order_number, warehouseId, warehousePrimaryCashAccountId }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        paymentMethod: "cash",
        paymentAccountID: warehousePrimaryCashAccountId,
        order_number: order_number,
        serviceFee: "",
        discount: "",
    });
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const fetchAccountByIds = useCallback(
        async ({ account_ids }) => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
                setAccounts(response.data.data);
            } catch (error) {
                notification("error", error.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        },
        [notification]
    );

    useEffect(() => {
        fetchAccountByIds({ account_ids: [1, 2] });
    }, [fetchAccountByIds]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`/api/make-payment`, formData);
            notification("success", response.data.message);
            fetchOrder();
            isModalOpen(false);
            setFormData({ date_issued: today, paymentMethod: "cash", paymentAccountID: "", order_number: order_number, serviceFee: "", discount: "" });
        } catch (error) {
            console.error("Error updating order status:", error);
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    const filterAccountByWarehouseId = accounts.filter((account) => account.warehouse_id === warehouseId);

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <div>
                        <input
                            type="datetime-local"
                            className="w-full border bg-white border-slate-200 px-4 py-2 rounded-xl mb-4"
                            value={formData.date_issued}
                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-900">Biaya Jasa Service</label>
                        <input
                            type="text"
                            className="w-full border bg-white border-slate-200 px-4 py-2 rounded-xl mb-4"
                            placeholder="Rp."
                            onChange={(e) => setFormData({ ...formData, serviceFee: e.target.value })}
                            value={formData.serviceFee}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-900">Discount</label>
                        <input
                            type="text"
                            className="w-full border bg-white border-slate-200 px-4 py-2 rounded-xl mb-4"
                            placeholder="Rp."
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            value={formData.discount}
                        />
                    </div>
                </div>
                <div>
                    <div className="mb-4 space-y-1 border border-slate-200 rounded-xl p-3">
                        <div className="flex justify-between text-sm">
                            <h1>Biaya Spareparts</h1>
                            <h1 className="font-bold">
                                <span className="font-light">Rp</span> {formatNumber(totalPrice || 0)}
                            </h1>
                        </div>
                        <div className="flex justify-between text-sm">
                            <h1>Biaya Jasa Service</h1>
                            <h1 className="font-bold">
                                <span className="font-light">Rp</span> {formatNumber(formData.serviceFee)}
                            </h1>
                        </div>
                        <div className="flex justify-between text-sm text-red-500">
                            <h1>Discount</h1>
                            <h1 className="font-bold">
                                <span className="font-light">Rp</span> {formatNumber(-formData.discount || 0)}
                            </h1>
                        </div>
                        <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
                            <h1>Total Tagihan</h1>
                            <h1 className="font-bold">
                                <span className="font-light">Rp</span>{" "}
                                {formatNumber(Number(totalPrice) + Number(formData.serviceFee) - Number(formData.discount))}
                            </h1>
                        </div>
                    </div>
                    <div className="flex bg-indigo-400 w-fit text-sm rounded-xl mb-2">
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
                    {formData.paymentMethod === "cash" && (
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-900">Account Pembayaran</label>
                            <select
                                className="w-full border bg-white border-slate-200 px-4 py-2 rounded-xl mb-4 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                value={formData.paymentAccountID}
                                onChange={(e) => setFormData({ ...formData, paymentAccountID: e.target.value })}
                                disabled={loading || formData.paymentMethod === "credit"}
                                required
                            >
                                <option value="">Pilih Akun Pembayaran</option>
                                {filterAccountByWarehouseId?.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.acc_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 cursor-pointer" disabled={loading} onClick={handlePayment}>
                {loading ? "Loading..." : "Submit Payment"}
            </button>
        </>
    );
};

export default CreatePaymentFrom;
