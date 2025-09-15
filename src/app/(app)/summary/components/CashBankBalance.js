"use client";
import SimplePagination from "@/components/SimplePagination";
import useCashBankBalance from "@/libs/cashBankBalance";
import { formatNumber, formatRupiah, todayDate } from "@/libs/format";
import { useState } from "react";

const CashBankBalance = () => {
    const { accountBalance } = useCashBankBalance(1, todayDate());
    const totalCashBankBalance = accountBalance.data?.reduce((total, item) => total + item.balance, 0);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const totalItems = accountBalance?.data?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = accountBalance?.data?.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    return (
        <>
            <div className="card p-4">
                <h1 className="card-title">Total Kas & Bank</h1>
                <h1 className="text-2xl font-bold">{formatRupiah(totalCashBankBalance || 0)}</h1>
                <div className="overflow-x-auto mt-4">
                    <table className="table w-full text-xs">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems?.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.acc_name}</td>
                                    <td className="text-right">{formatNumber(item.balance)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div>
                    {totalPages > 1 && (
                        <SimplePagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} />
                    )}
                </div>
            </div>
        </>
    );
};

export default CashBankBalance;
