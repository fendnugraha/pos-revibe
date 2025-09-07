"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/libs/auth";
import Image from "next/image";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const { login, error: authError } = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/order",
    });

    useEffect(() => {
        if (authError) {
            setStatus(authError.message);
        }
    }, [authError]);

    useEffect(() => {
        if (router.reset?.length > 0 && errors.length === 0) {
            setStatus(atob(router.reset));
        } else {
            setStatus(null);
        }
    }, [router.reset, errors]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login({ email, password, setErrors, setStatus, setMessage, setLoading });
    };
    return (
        <div className="w-1/2 flex items-center flex-col">
            <Image src="/revibe-logo.png" alt="Revibe Logo" className="inline" width={100} height={24} priority />
            <h1 className="text-lg mt-4">Login to your account</h1>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 mt-4 mb-2 w-full">
                    <div className="space-y-2">
                        <label className="text-xs text-red-500 block font-semibold">Email Address</label>
                        <input
                            className="px-6 py-4 rounded-2xl border border-white focus:border-red-400 outline-none w-96 bg-slate-200 text-red-500"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-red-500 block font-semibold">Password</label>
                        <input
                            className="px-6 py-4 rounded-2xl border border-white focus:border-red-400 outline-none w-96 bg-slate-200 text-red-500"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <button
                    disabled={loading || message === "Login successful!"}
                    className="px-4 py-3 mt-4 w-full bg-red-600 text-white rounded-2xl hover:bg-red-500 cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed"
                    type="submit"
                >
                    {loading || message === "Login successful!" ? "Loging in ..." : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
