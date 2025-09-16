import Label from "@/components/Label";
import axios from "@/libs/axios";
import DateTimeNow from "@/libs/dateTimeNow";
import { useCallback, useEffect, useState } from "react";
const PaymentEditForm = ({ order, isModalOpen, notification, fetchOrder, totalPrice, order_number, warehouseId, warehousePrimaryCashAccountId }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: "",
        paymentAccountID: "",
        oldPaymentAccountID: "",
        order_number: order_number,
        note: "",
    });

    useEffect(() => {
        setFormData({
            date_issued: order.journal?.date_issued,
            paymentAccountID: order?.journal?.entries?.find((e) => [1, 2].includes(e?.chart_of_account?.account_id))?.chart_of_account?.id,
            oldPaymentAccountID: order?.journal?.entries?.find((e) => [1, 2].includes(e?.chart_of_account?.account_id))?.chart_of_account?.id,
            order_number: order_number,
        });
    }, [order_number, order]);

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

    const filterAccountByWarehouseId = accounts.filter((account) => account.warehouse_id === warehouseId);

    const handleEditPayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`/api/update-payment-order/${order_number}`, formData);
            fetchOrder();
            notification({ type: "success", message: "Pembayaran berhasil diupdate." });
        } catch (error) {
            notification({ type: "error", message: "Something went wrong." });
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form>
            <div className="mb-4">
                <Label>Tanggal</Label>
                <input
                    type="datetime-local"
                    value={formData.date_issued}
                    onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                    className={"form-control w-full"}
                />
            </div>
            <div className="mb-4">
                <Label>Akun Pembayaran</Label>
                <select
                    value={formData.paymentAccountID}
                    onChange={(e) => setFormData({ ...formData, paymentAccountID: e.target.value })}
                    className="form-select w-full"
                    disabled={order?.payment_method === "Credit"}
                >
                    <option value="">Pilih Akun</option>
                    {filterAccountByWarehouseId.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.acc_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <Label>Notes</Label>
                <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} className="form-control w-full"></textarea>
            </div>
            <div className="flex gap-2">
                <button type="button" className="btn btn-primary" onClick={() => isModalOpen(false)} disabled={loading}>
                    Batal
                </button>
                <button type="button" className="btn btn-primary" onClick={handleEditPayment} disabled={loading}>
                    {loading ? "Loading..." : "Simpan"}
                </button>
            </div>
        </form>
    );
};

export default PaymentEditForm;
