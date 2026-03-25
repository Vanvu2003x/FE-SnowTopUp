"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowRight, FiLock, FiMail, FiUser } from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { Register } from "@/services/auth.service";

export default function RegisterPage() {
    const router = useRouter();
    const toast = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            await Register(name, email, password);
            toast.success("Đăng ký thành công. Hãy đăng nhập để tiếp tục.");
            router.push("/auth/login");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Đăng ký thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full rounded-[2.5rem] border border-sky-100 bg-white p-7 shadow-sm sm:p-8">
            <div className="mb-7">
                <span className="page-kicker">Tạo tài khoản</span>
                <h1 className="page-title mt-3">Đăng ký tài khoản</h1>
                <p className="copy-sm mt-3">
                    Tạo tài khoản mới để bắt đầu sử dụng ví và quản lý lịch sử nạp game của bạn.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4.5">
                <div>
                    <label className="meta-label mb-2 block text-sky-700">Họ và tên</label>
                    <div className="group flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 transition-all focus-within:border-sky-600 focus-within:bg-white focus-within:shadow-md focus-within:shadow-sky-50">
                        <FiUser className="text-sky-300 group-focus-within:text-sky-600" />
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Nguyễn Văn A"
                            className="w-full bg-transparent text-sm font-medium text-sky-900 outline-none placeholder:text-sky-300"
                            required
                        />
                    </div>
                </div>

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
                            placeholder="Tối thiểu 6 ký tự"
                            className="w-full bg-transparent text-sm font-medium text-sky-900 outline-none placeholder:text-sky-300"
                            required
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-copy flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-3.5 text-white shadow-lg shadow-sky-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
                        <FiArrowRight size={17} />
                    </button>
                </div>
            </form>

            <div className="mt-8 border-t border-sky-50 pt-6 text-center">
                <p className="copy-sm">
                    Đã có tài khoản?{" "}
                    <Link href="/auth/login" className="font-semibold text-sky-600 hover:text-sky-700">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
