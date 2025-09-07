import Image from "next/image";
import Link from "next/link";
import LoginLink from "./LoginLink";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-white text-gray-800">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4">
                <div>
                    <Image src="/revibe-logo.png" alt="Revibe Logo" width={100} height={24} priority />
                </div>
                <div>
                    <LoginLink />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center text-center px-4">
                <h1 className="text-4xl font-bold">Journal Apps for Phone Service</h1>
            </main>

            {/* Footer */}
            <footer className="text-center py-4 text-sm text-gray-500">Created by eightnite Studio</footer>
        </div>
    );
}
