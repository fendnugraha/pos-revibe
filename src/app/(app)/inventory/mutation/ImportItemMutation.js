"use client";
import * as XLSX from "xlsx";
import { useState } from "react";
import axios from "@/libs/axios";
import Button from "@/components/Button";
import Label from "@/components/Label";
import { set } from "date-fns";

export default function ImportItemMutation({ isModalOpen, setNotification, setMutationCart, today, warehouses }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            // ambil sheet pertama
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // convert ke JSON
            const json = XLSX.utils.sheet_to_json(worksheet);
            setRows(json);
            console.log("Parsed Excel:", json);
        };

        reader.readAsArrayBuffer(file);
    };

    const [formData, setFormData] = useState({
        date_issued: today,
        from: "",
        to: "",
    });

    const uploadToServer = async () => {
        setLoading(true);
        try {
            await axios.post("/api/import-transfer-item", { ...formData, cart: rows });
            setNotification({ type: "success", message: "Data imported successfully!" });
            isModalOpen(false);
            setMutationCart([]);
        } catch (error) {
            console.error(error);
            setNotification({ type: "error", message: error.response?.data?.message || "Failed to import data." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <form onSubmit={uploadToServer}>
                    <div className="mb-2">
                        <Label htmlFor="date_issued">Tanggal:</Label>
                        <input
                            type="datetime-local"
                            className="form-control w-full"
                            id="date_issued"
                            value={formData.date_issued}
                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                        />
                    </div>
                    <div className="mb-2">
                        <Label htmlFor="from">Dari:</Label>
                        <select
                            className="form-control w-full"
                            id="from"
                            value={formData.from}
                            onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                        >
                            <option value="">Pilih cabang</option>
                            {warehouses.data
                                ?.filter((warehouse) => warehouse.id !== Number(formData.to))
                                .map((warehouse) => (
                                    <option key={warehouse.id} value={warehouse.id}>
                                        {warehouse.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="mb-2">
                        <Label htmlFor="to">Ke:</Label>
                        <select
                            className="form-control w-full"
                            id="to"
                            value={formData.to}
                            onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                            disabled={!formData.from}
                        >
                            <option value="">Pilih cabang</option>
                            {warehouses.data
                                ?.filter((warehouse) => warehouse.id !== Number(formData.from))
                                .map((warehouse) => (
                                    <option key={warehouse.id} value={warehouse.id}>
                                        {warehouse.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="to">File:</Label>
                        <input className="form-control w-full" type="file" accept=".xlsx,.xls" onChange={handleFileUpload} disabled={loading} />
                    </div>
                    <Button
                        buttonType="success"
                        onClick={uploadToServer}
                        disabled={loading || rows.length === 0 || !formData.from || !formData.to || !formData.date_issued || loading}
                    >
                        {loading ? "Uploading..." : "Upload to Server"}
                    </Button>
                </form>
                <div>
                    <h1 className="font-bold block">Preview:</h1>
                    {rows.length > 0 ? (
                        <pre className="bg-gray-100 dark:bg-slate-800 p-2 rounded max-h-64 overflow-y-auto text-xs">{JSON.stringify(rows, null, 2)}</pre>
                    ) : (
                        <p className="text-gray-500">No data to preview.</p>
                    )}
                </div>
            </div>
        </>
    );
}
