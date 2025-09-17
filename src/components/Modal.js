import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";

export default function Modal({
    children,
    isOpen,
    modalTitle,
    onClose,
    maxWidth,
    bgColor = "bg-white dark:bg-slate-700/80 dark:backdrop-blur-sm",
    textColor = "text-black dark:text-white",
}) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-[999]">
            {/* Overlay */}
            <DialogBackdrop transition className="fixed inset-0 bg-black/50 duration-300 ease-out data-closed:opacity-0" />

            {/* Modal Content */}
            <div className="fixed inset-0 flex items-center justify-center">
                <DialogPanel
                    transition
                    className={`${bgColor} ${textColor} w-full ${
                        maxWidth ? maxWidth : "max-w-2xl"
                    } rounded-2xl shadow-lg duration-300 ease-out data-closed:scale-95 data-closed:opacity-0`}
                >
                    {/* Modal Header */}
                    <div className="flex justify-between items-center py-4 px-6 border-b border-slate-200 dark:border-slate-600">
                        <DialogTitle className="text-xl font-bold">{modalTitle}</DialogTitle>
                        <button onClick={onClose} aria-label="Close Modal">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-6 h-6  hover:rotate-180 hover:scale-110 transition duration-300 ease-out"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-4 sm:p-6">{children}</div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
