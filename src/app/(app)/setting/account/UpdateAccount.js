"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import axios from "@/libs/axios";
import { useState } from "react";

const UpdateAccount = ({ isModalOpen, findSelectedAccountId, notification, fetchAccount }) => {
    const [formData, setFormData] = useState({
        id: findSelectedAccountId?.id,
        acc_name: findSelectedAccountId?.acc_name,
        st_balance: findSelectedAccountId?.st_balance,
    });

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/accounts/${findSelectedAccountId.id}`, formData);
            notification("success", response.data.message);
            isModalOpen(false);
            fetchAccount();
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        }
    };

    return (
        <form onSubmit={handleUpdateAccount}>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Account Name
                </label>
                <Input
                    type="text"
                    value={formData.acc_name}
                    onChange={(e) => setFormData({ ...formData, acc_name: e.target.value })}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="st_balance" className="block mb-2 text-sm font-medium text-gray-900">
                    Starting Balance
                </label>
                <Input
                    type="number"
                    value={formData.st_balance}
                    onChange={(e) => setFormData({ ...formData, st_balance: e.target.value })}
                    className="bg-gray-50 w-1/2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    required
                />
            </div>
            <Button buttonType="success">Update Account</Button>
        </form>
    );
};

export default UpdateAccount;
