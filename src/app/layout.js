// import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import DarkModeContextProvider from "@/context/DarkModeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Revibe",
    description: "Bring back your device alive!",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased bg-slate-100 text:slate-800 dark:bg-slate-900 dark:text-white`}>
                <DarkModeContextProvider>{children}</DarkModeContextProvider>
            </body>
        </html>
    );
}
