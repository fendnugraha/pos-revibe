import { formatDateTime, TimeAgo } from "@/libs/format";
import { Activity, AlarmClockCheck, Ban, CheckCheck, ClipboardClock, DotIcon, X } from "lucide-react";
import Link from "next/link";

const StatusCard = ({ order }) => {
    let icon = (
        <span className="flex items-center gap-1 bg-slate-500 text-slate-100 rounded-full p-2">
            <DotIcon size={28} strokeWidth={2} />
        </span>
    );
    let style = "bg-green-100 text-green-800";
    let status = order?.status;

    switch (status) {
        case "Pending":
            icon = (
                <span className="flex items-center gap-1 bg-yellow-500 text-yellow-100 rounded-full p-2">
                    <ClipboardClock size={28} strokeWidth={2} />
                </span>
            );
            style = "bg-yellow-100 text-yellow-800";
            break;
        case "In Progress":
            icon = (
                <span className="flex items-center gap-1 bg-amber-500 text-amber-100 rounded-full p-2">
                    <Activity size={28} strokeWidth={2} />
                </span>
            );
            style = "bg-amber-100 text-amber-800";
            break;
        case "Completed":
            icon = (
                <span className="flex items-center gap-1 bg-green-500 text-green-100 rounded-full p-2">
                    <CheckCheck size={28} strokeWidth={2} />
                </span>
            );
            style = "bg-green-100 text-green-800";
            break;
        case "Canceled":
            icon = (
                <span className="flex items-center gap-1 bg-red-500 text-red-100 rounded-full p-2">
                    <X size={28} strokeWidth={2} />
                </span>
            );
            style = "bg-red-100 text-red-800";
            break;
        case "Rejected":
            icon = (
                <span className="flex items-center gap-1 bg-red-500 text-red-100 rounded-full p-2">
                    <Ban size={28} strokeWidth={2} />
                </span>
            );
            style = "bg-slate-800 dark:bg-slate-500 text-white";
            break;
        case "Finished":
            icon = (
                <span className="flex items-center gap-1 bg-blue-500 text-blue-100 rounded-full p-2">
                    <AlarmClockCheck size={28} strokeWidth={2} />
                </span>
            );
            style = "bg-blue-100 text-blue-800";
            break;
        default:
            style = "bg-gray-100 text-gray-800";
    }
    return (
        <div className={`flex items-center justify-between gap-2 px-2 py-1 mb-2 rounded-full ${style}`}>
            <div className="flex items-center gap-2">
                {icon}
                <div>
                    <Link href={`/order/detail/${order?.order_number}`} className="hover:underline font-bold text-xs">
                        #{order.order_number}
                    </Link>
                    <div className="font-bold text-xs flex flex-col">
                        <h1 className="font-normal">{order.technician?.name || "-"}</h1>
                        <span className="font-normal">
                            <TimeAgo timestamp={formatDateTime(order?.updated_at)} />
                        </span>
                    </div>
                </div>
            </div>
            <h1 className="text-sm font-semibold mr-4">{order?.status}</h1>
        </div>
    );
};

export default StatusCard;
