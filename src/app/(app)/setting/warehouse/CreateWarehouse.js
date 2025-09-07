import Button from "@/components/Button";
import Input from "@/components/Input";
import axios from "@/libs/axios";
import { useCallback, useEffect, useState } from "react";

const CreateWarehouse = ({ isModalOpen, notification, fetchWarehouses }) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        address: "",
        acc_code: "",
    });
    const [errors, setErrors] = useState([]);

    const fetchAccountByIds = useCallback(async ({ account_ids }) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/get-account-by-account-id`, { params: { account_ids } });
            setAccounts(response.data.data);
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccountByIds({ account_ids: [1, 2] });
    }, [fetchAccountByIds]);

    const availableAccounts = accounts.filter((item) => item.warehouse_id === null);

    const handleCreateWarehouse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/warehouse", formData);
            notification("success", response.data.message);
            if (response.status === 201) {
                // Reset form fields and close modal on success
                setFormData({
                    code: "",
                    name: "",
                    address: "",
                    acc_code: "",
                });
                isModalOpen(false);
                fetchWarehouses();
            }
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message);
        }
    };
    return (
        <form onSubmit={handleCreateWarehouse}>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Code
                </label>
                <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            code: e.target.value,
                        })
                    }
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.code ? "border-red-500" : ""
                    }`}
                    placeholder="Kode Cabang"
                    required
                    autoComplete="off"
                />
                {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Name
                </label>
                <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            name: e.target.value,
                        })
                    }
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.name ? "border-red-500" : ""
                    }`}
                    placeholder="Nama Cabang"
                    required
                    autoComplete="off"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Cash Account
                </label>
                <select
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.acc_code ? "border-red-500" : ""
                    }`}
                    value={formData.acc_code}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            acc_code: e.target.value,
                        })
                    }
                    required
                >
                    <option value="">-Pilih Akun-</option>
                    {availableAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.acc_name}
                        </option>
                    ))}
                </select>
                {errors.acc_code && <p className="text-red-500 text-xs">{errors.acc_code}</p>}
            </div>
            {/* Adress textarea */}
            <div className="mb-4">
                <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900">
                    Address
                </label>
                <textarea
                    value={formData.address}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            address: e.target.value,
                        })
                    }
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.address ? "border-red-500" : ""
                    }`}
                    placeholder="Alamat Cabang"
                    required
                    autoComplete="off"
                />
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>
            <div className="flex justify-end">
                <Button buttonType="primary">Create</Button>
            </div>
        </form>
    );
};

export default CreateWarehouse;
