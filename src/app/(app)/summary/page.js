import Breadcrumb from "@/components/Breadcrumb";
import RevenueReport from "./RevenueReport";
import { todayDate } from "@/libs/format";
import RevenueByUser from "./RevenueByUser";

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
            <div className="grid grid-cols-2 gap-4">
                <RevenueReport startDate={startDate} endDate={endDate} />
                <RevenueByUser startDate={startDate} endDate={endDate} />
            </div>
        </>
    );
};

export default SummaryPage;
