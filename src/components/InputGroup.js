const InputGroup = ({ InputIcon, maxWidth, className, ...props }) => {
    return (
        <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{InputIcon}</div>
            <input
                type={props.type || "text"}
                className={`block ${maxWidth} ${className} pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white rounded-3xl placeholder-gray-400 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                {...props}
            />
        </div>
    );
};

export default InputGroup;
