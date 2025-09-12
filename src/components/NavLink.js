"use client";
import Link from "next/link";

const NavLink = ({ active = false, children, ...props }) => (
    <Link
        {...props}
        className={`flex items-center text-sm gap-1.5 py-1  ${
            active
                ? "text-red-500 dark:text-yellow-300 hover:text-red-700 dark:hover:text-yellow-200 border-b border-red-500/80 dark:border-yellow-300"
                : "text-slate-500 dark:text-white hover:text-slate-700 dark:hover:text-red-200"
        }`}
    >
        {children}
    </Link>
);

export default NavLink;
