"use client";
import Button from "@/components/Button";
import Input from "@/components/Input";
import axios from "@/libs/axios";
import { useState, useEffect, useCallback } from "react";

const UpdateContact = ({ isModalOpen, notification, fetchContacts, contact }) => {
    const [loading, setLoading] = useState(false);
    const [updateContactData, setUpdateContactData] = useState({
        name: contact?.name,
        phone_number: contact?.phone_number,
        address: contact?.address,
        description: contact?.description,
        type: contact?.type,
    });

    const handleUpdateContact = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/contacts/${contact.id}`, updateContactData);
            notification("success", response.data.message);
            isModalOpen(false);
            fetchContacts();
        } catch (error) {
            notification("error", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleUpdateContact}>
            <div className="space-y-2">
                <div>
                    <label>Name</label>
                    <Input
                        type="text"
                        className={"w-full"}
                        value={updateContactData.name}
                        onChange={(e) => setUpdateContactData({ ...updateContactData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label>Phone Number</label>
                    <Input
                        type="text"
                        className={"w-full"}
                        value={updateContactData.phone_number}
                        onChange={(e) => setUpdateContactData({ ...updateContactData, phone_number: e.target.value })}
                    />
                </div>
                <div>
                    <label>Address</label>
                    <textarea
                        type="text"
                        className={
                            "w-full bg-white rounded-md p-2 border shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        }
                        value={updateContactData.address}
                        onChange={(e) => setUpdateContactData({ ...updateContactData, address: e.target.value })}
                    />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        type="text"
                        className={
                            "w-full bg-white rounded-md p-2 border shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        }
                        value={updateContactData.description}
                        onChange={(e) => setUpdateContactData({ ...updateContactData, description: e.target.value })}
                    />
                </div>
                <div>
                    <label>Type</label>
                    <select
                        className={
                            "w-full bg-white rounded-md p-2 border shadow-sm border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        }
                        value={updateContactData.type}
                        onChange={(e) => setUpdateContactData({ ...updateContactData, type: e.target.value })}
                    >
                        <option value="customer">Customer</option>
                        <option value="supplier">Supplier</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button buttonType="neutral" onClick={() => isModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" buttonType="success" disabled={loading} className={`${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                        Update
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default UpdateContact;
