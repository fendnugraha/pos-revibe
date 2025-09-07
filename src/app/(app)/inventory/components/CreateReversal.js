import axios from "@/libs/axios";
import formatNumber from "@/libs/formatNumber";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const CreateReversal = ({ isModalOpen, product, warehouse, notification, date, fetchWarehouseStock }) => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");

    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        product_id: product?.id,
        quantity: "",
        cost: product?.current_cost,
        price: product?.price,
        description: "",
        date: today,
        warehouse_id: warehouse,
        transaction_type: "Sales",
        account_id: "",
    });

    const fetchAccountByIds = async ({ account_ids }) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
            setAccounts(response.data.data);
        } catch (error) {
            notification({
                type: "error",
                message: error.response?.data?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountByIds({ account_ids: [1, 2] });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/stock-reversal", formData);
            notification({
                type: "success",
                message: response.data.message,
            });
            isModalOpen(false);
            fetchWarehouseStock();
            setFormData({
                product_id: product?.id,
                quantity: "",
                cost: product?.current_cost,
                price: product?.price,
                description: "",
                date: today,
                warehouse_id: warehouse,
                transaction_type: "Sales",
                account_id: "",
            });
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification({
                type: "error",
                message: error.response?.data?.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <h1 className="text-sm font-bold mb-4">{product?.name}</h1>
            <div className="flex rounded-full bg-slate-300 p-0.5 w-fit mb-2 text-sm">
                <button
                    className={`px-3 py-0.5 rounded-full ${
                        formData.transaction_type == "Sales" ? "bg-white text-green-500" : "text-slate-500"
                    } cursor-pointer w-32 flex items-center justify-center gap-2`}
                    onClick={() => setFormData({ ...formData, transaction_type: "Sales" })}
                >
                    <PlusIcon size={20} /> Penjualan
                </button>
                <button
                    className={`px-3 py-0.5 rounded-full ${
                        formData.transaction_type == "Purchase" ? "bg-white text-red-500" : "text-slate-500"
                    } cursor-pointer w-32 flex items-center justify-center gap-2`}
                    onClick={() => setFormData({ ...formData, transaction_type: "Purchase" })}
                >
                    <MinusIcon size={20} /> Pembelian
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-2">
                    <label className="text-sm" htmlFor="qty">
                        Tanggal
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div className="mb-2">
                    <label className="text-sm" htmlFor="qty">
                        Quantity
                    </label>
                    <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="mb-2">
                        <label className="text-sm" htmlFor="qty">
                            Harga Jual
                        </label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="form-control w-full"
                            required={formData.transaction_type == "Sales"}
                            disabled={formData.transaction_type == "Purchase"}
                        />
                    </div>
                    <div className="mb-2">
                        <label className="text-sm" htmlFor="cost">
                            Harga Modal
                        </label>
                        <input
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                            className="form-control w-full"
                            required
                        />
                    </div>
                </div>
                <div className="mb-2">
                    <label className="text-sm" htmlFor="description">
                        Account Reversal
                    </label>
                    <select
                        className="w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                        value={formData.account_id}
                        required
                    >
                        <option value="">Pilih Akun</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.acc_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="">
                    <label className="text-sm" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <h1 className="text-xs">
                    Stock: {formatNumber(product?.stock_movements_sum_quantity)} {" -> "}
                    <span className={formData.transaction_type == "Sales" ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                        {formatNumber(
                            Number(product?.stock_movements_sum_quantity) +
                                (formData.transaction_type == "Sales" ? Number(formData.quantity) : Number(formData.quantity) * -1)
                        )}
                    </span>
                </h1>
                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary disabled:bg-slate-500" disabled={loading}>
                        {loading ? "Loading..." : "Submit"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default CreateReversal;
