"use client";
import * as XLSX from "xlsx";
import { useState } from "react";
import axios from "@/libs/axios";
import Button from "@/components/Button";
import Notification from "@/components/Notification";

export default function ImportCategoryProducts({ isModalOpen, fetchData, setNotification }) {
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

    const uploadToServer = async () => {
        setLoading(true);
        try {
            await axios.post("/api/import-category", { data: rows });
            setNotification({ type: "success", message: "Data imported successfully!" });
            isModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            setNotification({ type: "error", message: "Failed to import data." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-4">
                <input className="form-control w-full" type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
                <Button buttonType="success" onClick={uploadToServer} disabled={loading || rows.length === 0}>
                    {loading ? "Uploading..." : "Upload to Server"}
                </Button>

                {rows.length > 0 && <pre className="bg-gray-100 p-2 rounded max-h-64 overflow-y-auto text-xs">{JSON.stringify(rows, null, 2)}</pre>}
            </div>
        </>
    );
}
