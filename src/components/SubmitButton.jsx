"use client";

import { useFormStatus } from "react-dom";

const SubmitButton = ({ children }) => {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={`flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm ${
                pending ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
        >
            {pending ? "Loading..." : children}
        </button>
    );
};

export default SubmitButton;
