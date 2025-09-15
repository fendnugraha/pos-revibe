import Breadcrumb from "@/components/Breadcrumb";
import RevenueReport from "./components/RevenueReport";
import { todayDate } from "@/libs/format";
import RevenueByUser from "./components/RevenueByUser";
import WarehouseBalance from "./components/WarehouseBalance";
import CashBankBalance from "./components/CashBankBalance";

export const metadata = {
    title: "Revibe | Summary",
};

const SummaryPage = () => {
    const startDate = todayDate();
    const endDate = todayDate();
    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Summary", href: "/summary" },
                    { name: "Summary Report", href: "/summary" },
                ]}
            />
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="">
                    <CashBankBalance />
                </div>
                <WarehouseBalance endDate={endDate} />
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="col-span-2">
                    <RevenueReport startDate={startDate} endDate={endDate} />
                </div>
                <RevenueByUser startDate={startDate} endDate={endDate} />
            </div>
        </>
    );
};

export default SummaryPage;
