"use client";
import ResponsiveNavLink from "@/components/ResponsiveNavLink";
import { navMenu } from "@/constants/NavMenu";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MenuMobile = ({ userRole, pathName }) => {
    const [showMainMenu, setShowMainMenu] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMainMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);
    return (
        <div className="fixed bottom-0 sm:hidden min-h-16 w-fit px-2 pb-2 flex items-center gap-2 z-[99]">
            <div ref={menuRef}>
                <div
                    className={`w-full bg-white/30 backdrop-blur-sm rounded-3xl shadow border border-slate-300 ${
                        showMainMenu ? "h-fit p-4" : "h-0 overflow-hidden opacity-0"
                    } transition-all duration-300 ease-in-out`}
                >
                    <ul className={`flex flex-col gap-2 text-xs ${showMainMenu ? "opacity-100" : "opacity-0"} transition-all duration-200 ease-in`}>
                        {navMenu.mainMenu
                            .filter((item) => item.role.includes(userRole))
                            .map((item, index) => (
                                <li className="" key={index}>
                                    <ResponsiveNavLink href={item.href} active={pathName.startsWith(item.path)}>
                                        <item.icon size={20} className="mr-2 inline" /> {item.name}
                                    </ResponsiveNavLink>
                                </li>
                            ))}
                    </ul>
                </div>
                <button
                    className={`rounded-full mt-2 backdrop-blur-sm w-16 h-16 flex items-center justify-center shadow ${
                        showMainMenu ? "bg-red-500/90 text-white" : "bg-white/30 "
                    } transition-all duration-300 ease-in-out`}
                    onClick={() => setShowMainMenu(!showMainMenu)}
                >
                    <Menu size={24} />
                </button>
                {/* <button className="flex-1 bg-white/30 backdrop-blur-sm h-16 rounded-full flex items-center justify-center shadow">Add Order</button> */}
            </div>
        </div>
    );
};

export default MenuMobile;
