const StatusBadge = ({ status, statusText }) => {
    let style = "bg-green-100 text-green-800";

    switch (status) {
        case "Pending":
            style = "bg-yellow-100 text-slate-800";
            break;
        case "In Progress":
            style = "bg-amber-100 text-amber-800";
            break;
        case "Completed":
            style = "bg-green-100 text-green-800";
            break;
        case "Canceled":
            style = "bg-red-100 text-red-800";
            break;
        case "Rejected":
            style = "bg-slate-800 dark:bg-slate-500 text-white";
            break;
        case "Finished":
            style = "bg-blue-100 text-blue-800";
            break;
        default:
            style = "bg-gray-100 text-gray-800";
    }
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full shadow ${style}`}>{statusText || status}</span>;
};

export default StatusBadge;
