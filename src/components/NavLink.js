"use client";
import Link from "next/link";

const NavLink = ({ active = false, children, ...props }) => (
    <Link
        {...props}
        className={`flex items-center text-sm gap-1.5 py-1  ${
            active ? "text-red-500 hover:text-red-700 border-b border-red-500/80" : "text-slate-500 hover:text-slate-700"
        }`}
    >
        {children}
    </Link>
);

export default NavLink;
