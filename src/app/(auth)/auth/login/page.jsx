"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { Login } from "@/services/auth.service";

export default function LoginPage() {
    const router = useRouter();
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const result = await Login(email, password);
            if (result?.user) {
                localStorage.setItem("name", result.user.name || "");
                localStorage.setItem("balance", String(result.user.balance || 0));
            }
            toast.success("Đăng nhập thành công.");
            const nextPath =
                typeof window !== "undefined"
                    ? new URLSearchParams(window.location.search).get("next")
                    : null;
            router.push(nextPath || "/account");
            router.refresh();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Đăng nhập thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full rounded-[2.5rem] border border-sky-100 bg-white p-7 shadow-sm sm:p-8">
            <div className="mb-7">
                <span className="page-kicker">Chào mừng trở lại</span>
                <h1 className="page-title mt-3">Đăng nhập tài khoản</h1>
                <p className="copy-sm mt-3">
                    Truy cập vào hệ thống để tiếp tục quản lý ví và đặt đơn nạp game nhanh chóng.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="meta-label mb-2 block text-sky-700">Email</label>
                    <div className="group flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 transition-all focus-within:border-sky-600 focus-within:bg-white focus-within:shadow-md focus-within:shadow-sky-50">
                        <FiMail className="text-sky-300 group-focus-within:text-sky-600" />
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="ban@example.com"
                            className="w-full bg-transparent text-sm font-medium text-sky-900 outline-none placeholder:text-sky-300"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="meta-label mb-2 block text-sky-700">Mật khẩu</label>
                    <div className="group flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 transition-all focus-within:border-sky-600 focus-within:bg-white focus-within:shadow-md focus-within:shadow-sky-50">
                        <FiLock className="text-sky-300 group-focus-within:text-sky-600" />
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Nhập mật khẩu của bạn"
                            className="w-full bg-transparent text-sm font-medium text-sky-900 outline-none placeholder:text-sky-300"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <Link href="#" className="text-xs font-semibold text-sky-600 hover:text-sky-700">
                        Quên mật khẩu?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-copy flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-3.5 text-white shadow-lg shadow-sky-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
                    <FiArrowRight size={17} />
                </button>
            </form>

        </div>
    );
}
