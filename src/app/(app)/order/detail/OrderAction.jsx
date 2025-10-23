import Button from "@/components/Button";
import axios from "@/libs/axios";
import { X, XCircle } from "lucide-react";

const OrderAction = ({ status, isLoading = false, setIsLoading, fetchOrder, notification, handleUpdateOrderStatus, user, orderTechnicianId, order_number }) => {
    const warehouseId = user?.role?.warehouse_id;

    const handleVoidOrder = async () => {
        setIsLoading(true);
        try {
            const response = await axios.delete(`/api/void-order`, {
                params: { order_number: order_number, warehouse_id: warehouseId },
            });
            notification({ type: "success", message: response.data.message });
            fetchOrder();
        } catch (error) {
            console.error("Error voiding order:", error);
            notification({ type: "error", message: error.response.data.message });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div>
            <div
                className="flex gap-2"
                hidden={["Finished", "Completed", "Canceled", "Rejected"].includes(status) || !["Technician", "Administrator"].includes(user?.role?.role)}
            >
                {status !== "In Progress" ? (
                    <>
                        <Button
                            buttonType="success"
                            disabled={isLoading}
                            onClick={() => {
                                if (confirm("Apakah anda yakin ingin memproses order ini?")) handleUpdateOrderStatus("In Progress");
                            }}
                        >
                            Proses
                        </Button>
                        <Button
                            buttonType="danger"
                            disabled={status === "Finished" || status === "Completed" || status === "Canceled" || status === "Rejected" || isLoading}
                            onClick={() => {
                                if (confirm("Apakah anda yakin ingin menolak order ini?")) handleUpdateOrderStatus("Rejected");
                            }}
                        >
                            Tolak
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            buttonType="dark"
                            disabled={isLoading}
                            hidden={user?.id === orderTechnicianId}
                            onClick={() => {
                                if (confirm("Apakah anda yakin ingin mengambil alih order ini?")) handleUpdateOrderStatus("Take Over");
                            }}
                        >
                            Ambil Alih
                        </Button>
                        <Button
                            buttonType="info"
                            disabled={isLoading}
                            hidden={user?.id !== orderTechnicianId}
                            onClick={() => {
                                if (confirm("Apakah anda yakin ingin menyelesaikan order ini?")) handleUpdateOrderStatus("Finished");
                            }}
                        >
                            Selesai
                        </Button>
                        <Button
                            buttonType="danger"
                            hidden={user?.id !== orderTechnicianId}
                            disabled={status === "Finished" || status === "Completed" || status === "Canceled" || status === "Rejected" || isLoading}
                            onClick={() => {
                                if (confirm("Apakah anda yakin ingin membatalkan order ini?")) handleUpdateOrderStatus("Canceled");
                            }}
                        >
                            Batalkan
                        </Button>
                    </>
                )}
            </div>
            <Button
                buttonType="dark"
                className={"flex items-center gap-2 justify-center"}
                disabled={isLoading}
                onClick={() => {
                    if (confirm("Apakah anda yakin ingin membatalkan order ini?")) handleVoidOrder();
                }}
                hidden={["Canceled", "In Progress", "Rejected", "Pending"].includes(status)}
            >
                <XCircle size={20} /> {isLoading ? "Sending..." : "Void Order"}
            </Button>
        </div>
    );
};

export default OrderAction;
