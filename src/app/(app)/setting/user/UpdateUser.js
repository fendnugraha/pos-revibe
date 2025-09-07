"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import axios from "@/libs/axios";
import { useState, useEffect, useCallback } from "react";

const UpdateUser = ({ isModalOpen, notification, fetchUsers, findSelectedAccountId }) => {
    const [loading, setLoading] = useState(true);
    const [updateUserData, setUpdateUserData] = useState({
        name: findSelectedAccountId?.name,
        email: findSelectedAccountId?.email,
        warehouse: findSelectedAccountId?.role?.warehouse_id,
        role: findSelectedAccountId?.role?.role,
    });
    const [warehouses, setWarehouses] = useState([]);
    const id = findSelectedAccountId?.id;

    // Add form validation logic here
    const fetchWarehouses = useCallback(async () => {
        try {
            const response = await axios.get("/api/get-all-warehouses");
            setWarehouses(response.data.data);
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/users/${id}`, updateUserData);
            notification("success", response.data.message);
            isModalOpen(false);
            fetchUsers();
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form>
            <div className="my-4">
                <label>Name</label>
                <Input
                    className={"w-full"}
                    type="text"
                    onChange={(e) => setUpdateUserData({ ...updateUserData, name: e.target.value })}
                    value={updateUserData.name}
                />
            </div>
            <div className="mb-4">
                <label>Email</label>
                <Input
                    className={"w-full"}
                    type="email"
                    onChange={(e) => setUpdateUserData({ ...updateUserData, email: e.target.value })}
                    value={updateUserData.email}
                />
            </div>
            <div className="mb-4">
                <label>Warehouse</label>
                <select
                    className=" w-full rounded-md border p-2 shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    onChange={(e) => setUpdateUserData({ ...updateUserData, warehouse: e.target.value })}
                    value={updateUserData.warehouse}
                >
                    {warehouses?.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label>Role</label>
                <div className="flex gap-4">
                    <div className="flex justify-center items-center gap-2">
                        <input
                            type="radio"
                            name="role"
                            id="Administrator"
                            value="Administrator"
                            checked={updateUserData.role === "Administrator"}
                            onChange={(e) => setUpdateUserData({ ...updateUserData, role: e.target.value })}
                        />
                        <label htmlFor="Administrator">Administrator</label>
                    </div>
                    <div className="flex justify-center items-center gap-2">
                        <input
                            type="radio"
                            name="role"
                            id="Staff"
                            value="Staff"
                            checked={updateUserData.role === "Staff"}
                            onChange={(e) => setUpdateUserData({ ...updateUserData, role: e.target.value })}
                        />
                        <label htmlFor="Staff">Staff</label>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button buttonType="neutral" onClick={() => isModalOpen(false)}>
                    Cancel
                </Button>
                <Button buttonType="success" onClick={handleUpdateUser}>
                    Update
                </Button>
            </div>
        </form>
    );
};

export default UpdateUser;
