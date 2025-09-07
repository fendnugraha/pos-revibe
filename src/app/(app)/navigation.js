"use client";
import {
    ArrowLeftRightIcon,
    BoxesIcon,
    ChartAreaIcon,
    CogIcon,
    DollarSignIcon,
    LayoutDashboardIcon,
    Menu,
    PowerIcon,
    ScaleIcon,
    StoreIcon,
} from "lucide-react";
import { useState } from "react";
import NavLink from "@/components/NavLink";
import { usePathname } from "next/navigation";
import { useAuth } from "@/libs/auth";
import DarkModeToggle from "@/components/DarkModeToggle";
import { navMenu } from "@/config/NavMenu";

const Navigation = ({ user }) => {
    const { logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathName = usePathname();
    const userRole = user?.role?.role;
    return (
        <>
            <nav
                className={`bg-white dark:bg-slate-700 dark:text-white hidden sm:flex sm:flex-col ${
                    isMenuOpen ? "w-64" : "w-16"
                } h-screen justify-between transition-all duration-200 ease-in`}
            >
                {/* Header */}
                <button className="flex items-center cursor-pointer text-sky-800 dark:text-yellow-300">
                    {/* Tombol Toggle */}
                    <span
                        className="w-16 h-16 flex items-center justify-center flex-shrink-0 text-slate-700 dark:text-white"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu size={28} />
                    </span>

                    {/* Logo Text */}
                    <div
                        className={`flex w-full pr-4 justify-between items-center transition-all duration-300 origin-left ${
                            isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        }`}
                    >
                        <h1 className={`text-xl font-bold text-nowrap`}>Revibe ID</h1>
                        <DarkModeToggle />
                    </div>
                </button>
                {/* Middle Menu */}
                <div className="">
                    <div className="">
                        <ul className="py-4">
                            {navMenu.mainMenu.map((item, index) => (
                                <li key={index}>
                                    <NavLink href={item.href} active={pathName.startsWith(item.path)}>
                                        <span className="w-16 h-16 flex items-center justify-center flex-shrink-0 text-slate-500">
                                            <item.icon size={20} className="" />
                                        </span>
                                        <span
                                            className={`text-sm transition-all duration-300 origin-left ${
                                                isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"
                                            }`}
                                        >
                                            {item.name}
                                        </span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        {userRole === "Administrator" && (
                            <ul className="mt-4 border-t border-slate-300 py-4">
                                <li>
                                    <NavLink href="/setting" active={pathName.startsWith("/setting")}>
                                        <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-slate-500">
                                            <CogIcon size={20} className="" />
                                        </span>
                                        <span
                                            className={`text-sm transition-all duration-300 origin-left ${
                                                isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                            }`}
                                        >
                                            Setting
                                        </span>
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>

                {/* Footer */}
                {/* <NavLink href="/user/profile" active={pathName.startsWith("/user/profile")}>
                        <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-slate-500">
                            <UserIcon size={20} className="" />
                        </span>
                        <span
                            className={`text-sm text-nowrap transition-all duration-300 origin-left ${
                                isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                            }`}
                        >
                            My Profile
                        </span>
                    </NavLink> */}
                <button onClick={logout} className="flex items-center cursor-pointer">
                    {/* Tombol Toggle */}
                    <span className="w-16 h-14 flex items-center justify-center flex-shrink-0 text-red-500 hover:text-red-400">
                        <PowerIcon size={24} strokeWidth={3} />
                    </span>

                    {/* Logo Text */}
                    <h1
                        className={`text-sm transition-all duration-300 text-red-500 hover:text-red-400 origin-left ${
                            isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        }`}
                    >
                        Logout
                    </h1>
                </button>
            </nav>
        </>
    );
};

export default Navigation;
