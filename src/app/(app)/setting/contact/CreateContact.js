import Input from "@/components/Input";
import { useState } from "react";
import axios from "@/libs/axios";
import Button from "@/components/Button";

const CreateContact = ({ isModalOpen, notification, fetchContacts }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        phone_number: "",
        address: "",
        type: "",
    });

    const handleCreateContact = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/contacts", formData);
            notification("success", response.data.message);
            isModalOpen(false);
            fetchContacts();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
                    Name
                </label>
                <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.name ? "border-red-500" : ""
                    }`}
                    autoComplete="off"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="mb-4">
                <label htmlFor="phone_number" className="block mb-2 text-sm font-medium text-gray-900">
                    Phone Number
                </label>
                <Input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.phone_number ? "border-red-500" : ""
                    }`}
                    autoComplete="off"
                />
                {errors.phone_number && <p className="text-red-500 text-xs">{errors.phone_number}</p>}
            </div>

            <div className="mb-4">
                <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900">
                    Address
                </label>
                <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.address ? "border-red-500" : ""
                    }`}
                    autoComplete="off"
                />
                {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>

            <div className="mb-4">
                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">
                    Description
                </label>
                <textarea
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.description ? "border-red-500" : ""
                    }`}
                    autoComplete="off"
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
            </div>

            <div className="mb-4 w-1/2">
                <label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-900">
                    Type
                </label>
                <select
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    value={formData.type}
                    className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                        errors.type ? "border-red-500" : ""
                    }`}
                >
                    <option value="">Select type</option>
                    <option value="Customer">Customer (Pelanggan)</option>
                    <option value="Supplier">Supplier (Vendor)</option>
                    <option value="Employee">Employee (Karyawan)</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
            </div>

            <div className="flex justify-end">
                <Button buttonType="primary" onClick={handleCreateContact} disabled={loading} className={`${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                    {loading ? "Loading..." : "Create Contact"}
                </Button>
            </div>
        </form>
    );
};

export default CreateContact;
