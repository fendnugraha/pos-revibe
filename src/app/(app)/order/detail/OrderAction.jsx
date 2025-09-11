import Button from "@/components/Button";
import { X } from "lucide-react";

const OrderAction = ({ status, isLoading = false, handleUpdateOrderStatus, user, orderUserId }) => {
    return (
        // <select
        //     disabled={status === "Finished" || status === "Completed" || status === "Canceled" || status === "Rejected" || isLoading}
        //     onChange={(e) => handleUpdateOrderStatus(e.target.value)}
        //     value={status}
        //     className="form-select w-1/4"
        // >
        //     <option value={"Pending"}>-Pilih tindakan-</option>
        //     {status !== "In Progress" ? (
        //         <>
        //             <option value="In Progress">Proses</option>
        //             <option value="Rejected">Tolak</option>
        //         </>
        //     ) : (
        //         <>
        //             <option value="Take Over">Ambil Alih</option>
        //             <option value="Canceled">Batalkan</option>
        //         </>
        //     )}
        // </select>
        <div>
            <div className="flex gap-2" hidden={["Finished", "Completed", "Canceled", "Rejected"].includes(status)}>
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
                            hidden={user?.id === orderUserId}
                            onClick={() => {
                                if (confirm("Apakah anda yakin ingin mengambil alih order ini?")) handleUpdateOrderStatus("Take Over");
                            }}
                        >
                            Ambil Alih
                        </Button>
                        <Button
                            buttonType="info"
                            disabled={isLoading}
                            hidden={user?.id !== orderUserId}
                            onClick={() => {
                                if (confirm("Apakah anda yakin ingin menyelesaikan order ini?")) handleUpdateOrderStatus("Finished");
                            }}
                        >
                            Selesai
                        </Button>
                        <button
                            className="small-button border !border-red-500 !hover:bg-red-400 text-red-500"
                            hidden={user?.id !== orderUserId}
                            disabled={status === "Finished" || status === "Completed" || status === "Canceled" || status === "Rejected" || isLoading}
                            onClick={() => {
                                if (confirm("Apakah anda yakin ingin membatalkan order ini?")) handleUpdateOrderStatus("Canceled");
                            }}
                        >
                            <X size={16} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderAction;
