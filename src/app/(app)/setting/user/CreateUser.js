import React, { useCallback, useEffect, useState } from "react";
import Input from "@/components/Input";
import Label from "@/components/Label";
import axios from "@/libs/axios";
import Button from "@/components/Button";

const CreateUser = ({ isModalOpen, notification, fetchUsers }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        warehouse: "",
        role: "",
    });
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Add form validation logic here
    const fetchWarehouses = useCallback(async () => {
        try {
            const response = await axios.get("/api/get-all-warehouses");
            setWarehouses(response.data.data);
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    }, []);

    useEffect(() => {
        fetchWarehouses();
    }, [fetchWarehouses]);

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/users", formData);
            if (response.status === 201) {
                notification("success", response.data.message);
                fetchUsers();
                isModalOpen(false);
            }
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form>
            <div className="mb-4">
                <Label htmlFor="name">Name</Label>
                <Input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Name" className="w-full" />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="mb-4">
                <Label htmlFor="email">Email</Label>
                <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full" />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full"
                    />
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                <div className="">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full"
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <Label htmlFor="warehouse">Gudang / Cabang</Label>
                    <select
                        name="warehouse"
                        required
                        value={formData.warehouse}
                        onChange={handleChange}
                        className="w-full rounded-md shadow-sm border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="">Select warehouse</option>
                        {warehouses?.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </select>
                    {errors.warehouse && <p className="text-xs text-red-500">{errors.warehouse}</p>}
                </div>
                <div>
                    <Label htmlFor="role">Role</Label>
                    <select
                        name="role"
                        required
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full rounded-md shadow-sm border p-2 border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="">Select role</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Staff">Staff</option>
                    </select>
                    {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                </div>
            </div>
            <div className="flex justify-end">
                <Button buttonType="primary" onClick={handleSubmit} disabled={loading} className={loading ? "opacity-50 cursor-not-allowed" : ""}>
                    {loading ? "Loading..." : "Create User"}
                </Button>
            </div>
        </form>
    );
};

export default CreateUser;
