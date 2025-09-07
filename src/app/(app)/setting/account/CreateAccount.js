"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import axios from "@/libs/axios";
import { useState } from "react";

const CreateAccount = ({ isModalOpen, notification, fetchAccount, categoryAccount }) => {
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        st_balance: 0,
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/accounts", formData);
            notification("success", response.data.message);
            if (response.status === 201) {
                // Reset form fields and close modal on success
                setFormData({
                    name: "",
                    category_id: "",
                    st_balance: 0,
                });
                isModalOpen(false);
                // console.log('Form reset:', newAccount, response.status)
                fetchAccount();
            }
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleCreateAccount}>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Account Name
                </label>
                <Input
                    type="text"
                    id="name"
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
                    placeholder="Nama Akun"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-900">
                    Category
                </label>
                <select
                    id="category"
                    value={formData.category_id}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            category_id: e.target.value,
                        })
                    }
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.category_id ? "border-red-500" : ""
                    }`}
                >
                    <option value="">Select Category</option>
                    {categoryAccount?.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs">{errors.category_id}</p>}
            </div>
            <div className="mb-4">
                <label htmlFor="st_balance" className="block mb-2 text-sm font-medium text-gray-900">
                    Starting Balance
                </label>
                <Input
                    type="number"
                    id="st_balance"
                    value={formData.st_balance}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            st_balance: e.target.value,
                        })
                    }
                    className={`bg-gray-100 border`}
                    placeholder="0"
                />
                {errors.st_balance && <p className="text-red-500 text-xs">{errors.st_balance}</p>}
            </div>
            <div className="flex justify-end gap-2">
                <Button buttonType="neutral" onClick={() => isModalOpen(false)}>
                    Cancel
                </Button>
                <Button buttonType="primary">Save</Button>
            </div>
        </form>
    );
};

export default CreateAccount;
