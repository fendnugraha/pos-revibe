import { formatNumber, formatRupiah } from "@/libs/format";

const CashBankBalance = ({ accountBalance }) => {
    const totalCashBankBalance = accountBalance.data?.reduce((total, item) => total + item.balance, 0);
    return (
        <>
            <div className="card p-4 mb-4" hidden={accountBalance.data?.length === 1}>
                <h1 className="card-title">Total Kas & Bank</h1>
                <h1 className="text-4xl font-bold">{formatRupiah(totalCashBankBalance || 0)}</h1>
            </div>
            {accountBalance.data?.map((item) => (
                <div key={item.id} className="card px-4 py-2 mb-2">
                    <h1 className="text-sm">{item.acc_name}</h1>
                    <h1 className={`font-bold ${item.is_primary_cash ? "text-2xl" : "text-lg"}`}>{formatNumber(item.balance)}</h1>
                </div>
            ))}
        </>
    );
};

export default CashBankBalance;
