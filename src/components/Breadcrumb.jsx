import { ArrowRight, ChevronsRightIcon } from "lucide-react";

const Breadcrumb = ({ BreadcrumbArray }) => {
    return (
        <nav aria-label="Breadcrumb" className="px-4 pb-6">
            <ol role="list" className="flex items-center">
                {BreadcrumbArray.map((breadcrumb, index) => {
                    const isLast = index === BreadcrumbArray.length - 1;

                    return (
                        <li key={index} className="flex items-center text-sm">
                            {isLast ? (
                                <span className="text-gray-500 dark:text-gray-400 font-medium" aria-current="page">
                                    {breadcrumb.name}
                                </span>
                            ) : (
                                <>
                                    <a
                                        href={breadcrumb.href}
                                        className={`${
                                            isLast ? "text-gray-200" : "text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-slate-300"
                                        }`}
                                    >
                                        {breadcrumb.name}
                                    </a>
                                    <ChevronsRightIcon className="w-4 h-4 mx-2" />
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
