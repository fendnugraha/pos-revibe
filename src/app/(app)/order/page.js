import Breadcrumb from "@/components/Breadcrumb";
import OrderListTable from "./components/OrderListTable";

export const metadata = {
    title: "Revibe | Order Page",
};

const OrderPage = () => {
    return (
        <>
            <Breadcrumb
                BreadcrumbArray={[
                    { name: "Order", href: "/order" },
                    { name: "List Order", href: "/order" },
                ]}
            />
            <OrderListTable />
        </>
    );
};

export default OrderPage;
