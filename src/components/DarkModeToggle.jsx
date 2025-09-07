"use client";

import { useContext } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { DarkMode } from "@/context/DarkModeContext";

export default function DarkModeToggle() {
    const { darkMode, setDarkMode } = useContext(DarkMode);

    return (
        <span
            onClick={() => setDarkMode(!darkMode)}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-black dark:text-white"
        >
            {darkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
        </span>
    );
}
