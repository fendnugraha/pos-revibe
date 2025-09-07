import { CheckCircleIcon, CircleAlertIcon, InfoIcon } from "lucide-react";
import { useEffect } from "react";

const Notification = ({ type = "success", notification, title, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Auto-close after 3 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    // Conditional styles based on notification type
    let notificationTitle = "";
    let notificationStyles = "";
    let notificationIcon = null;

    // Set styles and icon based on notification type
    switch (type) {
        case "success":
            notificationTitle = "Success";
            notificationStyles = "";
            notificationIcon = <CheckCircleIcon size={42} className="text-green-500" />;
            break;
        case "error":
            notificationTitle = "Error !";
            notificationStyles = "";
            notificationIcon = <CircleAlertIcon size={42} className="text-red-500" />;
            break;
        default:
            notificationTitle = "Info";
            notificationStyles = "";
            notificationIcon = <InfoIcon size={42} className="text-teal-500" />;
    }

    return (
        <div
            className={`${notificationStyles} fixed bg-white/70 dark:bg-slate-600/70 backdrop-blur-sm top-4 sm:top-2 right-0 left-0 sm:left-auto sm:right-2 sm:w-96 z-[100000] border border-slate-500/50 rounded-3xl py-2 drop-shadow-sm`}
        >
            <div className="flex items-center gap-4 px-2">
                <div className="">
                    {/* <svg className={`fill-current h-6 w-5 text-white mr-4`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                    </svg> */}
                    {notificationIcon}
                </div>
                <div>
                    <p className="text-xs">
                        <span className="font-bold block">{title || notificationTitle}</span>
                        {notification}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Notification;
