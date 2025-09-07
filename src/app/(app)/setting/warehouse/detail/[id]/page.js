"use client";
import MainPage from "@/app/(app)/main";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Notification from "@/components/Notification";
import axios from "@/libs/axios";
import { use, useCallback, useEffect, useState } from "react";

const WarehouseDetail = ({ params }) => {
    const [warehouse, setWarehouse] = useState({});
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: "", message: "" });

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        chart_of_account_id: "",
    });

    const { id } = use(params);

    const fetchWarehouse = useCallback(
        async (url = `/api/warehouse/${id}`) => {
            setLoading(true);
            try {
                const response = await axios.get(url);
                setWarehouse(response.data.data);
                setFormData({
                    name: response.data.data.name,
                    address: response.data.data.address,
                    chart_of_account_id: response.data.data.chart_of_account_id,
                });
            } catch (error) {
                notification(error.response?.data?.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        },
        [id]
    );

    useEffect(() => {
        fetchWarehouse();
    }, [fetchWarehouse]);

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

    const availableAccounts = accounts.filter((item) => item.warehouse_id === null || Number(item.warehouse_id) === Number(id));

    return (
        <MainPage headerTitle={`${warehouse.name}`}>
            <div className="p-4">
                {notification.message && (
                    <Notification type={notification.type} notification={notification.message} onClose={() => setNotification({ type: "", message: "" })} />
                )}
            </div>
            <div className="overflow-y-auto bg-white rounded-2xl p-4 w-1/2 drop-shadow-sm">
                <h1 className="text-xl font-bold">Update warehouse</h1>
                <form>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <Input type="text" className={"w-full"} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Chart of Account</label>
                        <select
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            value={formData.chart_of_account_id}
                            onChange={(e) => setFormData({ ...formData, chart_of_account_id: e.target.value })}
                        >
                            <option value="">Select Chart of Account</option>
                            {availableAccounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.acc_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div className="mt-4">
                        <Button buttonType="success">Update</Button>
                    </div>
                </form>
            </div>
        </MainPage>
    );
};

export default WarehouseDetail;
