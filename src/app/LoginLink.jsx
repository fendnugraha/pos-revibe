"use client";
import Link from "next/link";
import { useAuth } from "../libs/auth";

const LoginLink = () => {
    const { user } = useAuth({ middleware: "guest" });

    return (
        <div className="">
            {user ? (
                <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                    Dashboard
                </Link>
            ) : (
                <>
                    <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                        Login
                    </Link>
                </>
            )}
        </div>
    );
};

export default LoginLink;
