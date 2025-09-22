import { LoaderCircle } from "lucide-react";

const LoadingData = ({ loading, message = "Loading data..." }) => {
    return (
        <>
            {loading && (
                <div className="sm:fixed bottom-0 right-0 z-50">
                    <div className="flex items-center space-x-2 gap-2 border border-slate-300 bg-white py-2 px-4 rounded-tl-lg shadow-lg">
                        <LoaderCircle className="animate-spin" /> {message}
                    </div>
                </div>
            )}
        </>
    );
};

export default LoadingData;
