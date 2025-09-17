"use client";
import { useAuth } from "@/libs/auth";
import Navigation from "./navigation";
import Loading from "@/components/Loading";
import TopBar from "./TopBar";

const AppLayout = ({ children }) => {
    const { user, authLoading } = useAuth({ middleware: "auth" });
    if (authLoading || !user) {
        return <Loading />;
    }
    return (
        <div className="h-screen overflow-hidden dark:bg-slate-700 dark:text-white">
            {/* <Navigation user={user} /> */}
            <TopBar user={user} />
            <div className="px-4 sm:px-12 py-4 h-[calc(100vh-80px)] overflow-auto">{children}</div>
        </div>
    );
};

export default AppLayout;
