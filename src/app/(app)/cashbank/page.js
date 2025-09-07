import Breadcrumb from "@/components/Breadcrumb";
import CashBank from "./components/CashBank";

export const metadata = {
    title: "Revibe | Cash & Bank",
};
const CashBankPage = () => {
    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Cash Bank", href: "/cashbank" },
                    { name: "Revenue Report", href: "/cashbank" },
                ]}
            />
            <CashBank />
        </>
    );
};

export default CashBankPage;
