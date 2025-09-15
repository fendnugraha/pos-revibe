"use client";
import DarkModeToggle from "@/components/DarkModeToggle";
import NavLink from "@/components/NavLink";
import { navMenu } from "@/constants/NavMenu";
import { useAuth } from "@/libs/auth";
import { PowerIcon, User2Icon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const TopBar = ({ user }) => {
    const { logout } = useAuth();
    const pathName = usePathname();
    const userRole = user?.role?.role;
    const warehouseName = user?.role?.warehouse?.name;
    return (
        <>
            <nav className="flex items-center justify-between px-4 sm:px-12 h-20 w-full">
                <div className="flex items-center gap-4">
                    <div className="w-[50px] sm:w-[100px]">
                        <Image src="/revibe-logo.png" alt="Logo" width={75} height={32} priority />
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                        <ul className="flex items-center gap-4 bg-white/75 dark:bg-slate-600 hover:outline outline-slate-300 backdrop-blur-sm px-6 py-2 rounded-full shadow">
                            {navMenu.mainMenu
                                .filter((item) => item.role.includes(userRole))
                                .map((item, index) => (
                                    <li key={index} className="">
                                        <NavLink href={item.href} active={pathName.startsWith(item.path)}>
                                            <item.icon size={20} className="" />
                                            <span className="text-nowrap overflow-hidden">{item.name}</span>
                                        </NavLink>
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-4 w-[270px]">
                    <div className="flex items-center gap-4 rounded-full bg-white/75 dark:bg-slate-600 hover:outline outline-slate-300 backdrop-blur-sm px-4 py-1 text-sm shadow">
                        <User2Icon size={20} />
                        <h1 className="font-bold text-nowrap overflow-hidden">
                            {user.name}
                            <span className="text-xs font-light block"> {warehouseName}</span>
                        </h1>
                        <DarkModeToggle />
                    </div>
                    <div onClick={logout} className="">
                        <button className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full shadow cursor-pointer">
                            <PowerIcon size={20} className="" />
                        </button>
                    </div>
                </div>
            </nav>
            <div className="fixed bottom-0 sm:hidden h-16 w-full bg-slate-300/50 backdrop-blur-sm px-6 py-2 rounded-3xl shadow"></div>
        </>
    );
};

export default TopBar;
