import { Activity, AlarmClockCheck, Award, Ban, CheckCheck, ClipboardClock, DotIcon, X } from "lucide-react";

const StatusBadge = ({ status, statusText }) => {
    let icon = (
        <span className="flex items-center gap-1 bg-slate-500 text-slate-100 rounded-full p-0.5">
            <Award size={12} strokeWidth={2} />
        </span>
    );
    let style = "bg-green-100 text-green-800";

    switch (status) {
        case "Pending":
            icon = (
                <span className="flex items-center gap-1 bg-yellow-500 text-yellow-100 rounded-full p-0.5">
                    <ClipboardClock size={12} strokeWidth={2} />
                </span>
            );
            style = "bg-yellow-100 text-yellow-800";
            break;
        case "In Progress":
            icon = (
                <span className="flex items-center gap-1 bg-amber-500 text-amber-100 rounded-full p-0.5">
                    <Activity size={12} strokeWidth={2} />
                </span>
            );
            style = "bg-amber-100 text-amber-800";
            break;
        case "Completed":
            icon = (
                <span className="flex items-center gap-1 bg-green-500 text-green-100 rounded-full p-0.5">
                    <CheckCheck size={12} strokeWidth={2} />
                </span>
            );
            style = "bg-green-100 text-green-800";
            break;
        case "Canceled":
            icon = (
                <span className="flex items-center gap-1 bg-red-500 text-red-100 rounded-full p-0.5">
                    <X size={12} strokeWidth={2} />
                </span>
            );
            style = "bg-red-100 text-red-800";
            break;
        case "Rejected":
            icon = (
                <span className="flex items-center gap-1 bg-red-500 text-red-100 rounded-full p-0.5">
                    <Ban size={12} strokeWidth={2} />
                </span>
            );
            style = "bg-slate-800 dark:bg-slate-500 text-white";
            break;
        case "Finished":
            icon = (
                <span className="flex items-center gap-1 bg-blue-500 text-blue-100 rounded-full p-0.5">
                    <AlarmClockCheck size={12} strokeWidth={2} />
                </span>
            );
            style = "bg-blue-100 text-blue-800";
            break;
        default:
            style = "bg-gray-100 text-gray-800";
    }
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 items-center gap-1 font-semibold rounded-full shadow ${style}`}>
            {icon}
            {statusText || status}
        </span>
    );
};

export default StatusBadge;
