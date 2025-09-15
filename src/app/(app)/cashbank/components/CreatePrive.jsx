import Label from "@/components/Label";
import axios from "@/libs/axios";
import { todayDate } from "@/libs/format";
import { useEffect, useState } from "react";

const CreatePrive = ({ accounts, fetchRevenueByWarehouse, fetchJournalByWarehouse, isModalOpen, notification, today }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date_issued: today,
        debt_code: 15,
        cred_code: "",
        amount: "",
        journal_type: "Transaction",
        description: "",
    });
    const [errors, setErrors] = useState([]);

    const cashBank = accounts.filter((account) => [1, 2].includes(account.account_id));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation", formData);
            notification({
                type: "success",
                message: response.data.message,
            });
            fetchRevenueByWarehouse();
            fetchJournalByWarehouse();
            setFormData({
                date_issued: today,
                debt_code: 15,
                cred_code: "",
                amount: "",
                trx_type: "Transaction",
                description: "",
            });
            isModalOpen(false);
            setErrors([]);
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
        <form onSubmit={handleSubmit}>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Tanggal</Label>
                <div className="col-span-1 sm:col-span-2">
                    <input
                        className="w-full form-control"
                        type="datetime-local"
                        placeholder="Rp."
                        value={formData.date_issued || today}
                        onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                    />
                    {errors.date_issued && <span className="text-red-500 text-xs">{errors.date_issued}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Dari Akun</Label>
                <div className="col-span-1 sm:col-span-2">
                    <select
                        onChange={(e) => setFormData({ ...formData, cred_code: e.target.value })}
                        value={formData.cred_code}
                        className="w-full form-control"
                    >
                        <option value="">--Pilih Akun--</option>
                        {cashBank.map((cashBank) => (
                            <option key={cashBank.id} value={cashBank.id}>
                                {cashBank.acc_name}
                            </option>
                        ))}
                    </select>
                    {errors.cred_code && <span className="text-red-500 text-xs">{errors.cred_code}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Jumlah</Label>
                <div className="col-span-1 sm:col-span-2">
                    <input
                        type="number"
                        className="w-full form-control"
                        placeholder="Rp."
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                    {errors.amount && <span className="text-red-500 text-xs">{errors.amount}</span>}
                </div>
            </div>
            <div className="mb-2 grid grid-cols-1 sm:grid-cols-3 sm:gap-4 items-center">
                <Label>Keterangan</Label>
                <div className="col-span-1 sm:col-span-2">
                    <textarea
                        className="w-full form-control"
                        type="text"
                        placeholder="(Optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => isModalOpen(false)}
                    type="button"
                    className="bg-white border border-red-300 hover:bg-red-200 rounded-xl px-8 py-3 text-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-indigo-500 hover:bg-indigo-600 rounded-xl px-8 py-3 text-white disabled:bg-slate-300 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Simpan"}
                </button>
            </div>
        </form>
    );
};

export default CreatePrive;
