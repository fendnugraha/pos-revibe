import StatusBadge from "@/components/StatusBadge";

const OrderStatus = ({ orders }) => {
    const filterOrderByStatus = (status) => orders.data?.filter((order) => order.status === status).length;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="flex justify-between items-center px-4 py-2 gap-4 bg-white rounded-3xl col-span-3">
                <div className="w-32 text-center">
                    <StatusBadge status="Pending" />
                    <h1 className="text-2xl font-bold mt-1">{filterOrderByStatus("Pending")}</h1>
                </div>
                <div className="w-32 text-center">
                    <StatusBadge status="In Progress" />
                    <h1 className="text-2xl font-bold mt-1">{filterOrderByStatus("In Progress")}</h1>
                </div>
                <div className="w-32 text-center">
                    <StatusBadge status="Finished" />
                    <h1 className="text-2xl font-bold mt-1">{filterOrderByStatus("Finished")}</h1>
                </div>
                <div className="w-32 text-center">
                    <StatusBadge status="Completed" />
                    <h1 className="text-2xl font-bold mt-1">{filterOrderByStatus("Completed")}</h1>
                </div>
                <div className="w-32 text-center">
                    <StatusBadge status="Canceled" />
                    <h1 className="text-2xl font-bold mt-1">{filterOrderByStatus("Canceled")}</h1>
                </div>
                <div className="w-32 text-center">
                    <StatusBadge status="Rejected" />
                    <h1 className="text-2xl font-bold mt-1">{filterOrderByStatus("Rejected")}</h1>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-500 text-white rounded-3xl">
                <h1 className="text-lg">Total Order</h1>
                <h1 className="text-2xl font-bold">{orders.data?.length}</h1>
            </div>
        </div>
    );
};

export default OrderStatus;
