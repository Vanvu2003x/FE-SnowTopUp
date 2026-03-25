"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLogOut, FiMenu, FiSearch, FiUser } from "react-icons/fi";

import BrandLogo from "@/components/layout/BrandLogo";
import { siteConfig } from "@/config/site";
import { getInfo, Logout } from "@/services/auth.service";

export default function Header({ onMenuToggle }) {
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        getInfo()
            .then((data) => setUser(data?.user || data || null))
            .catch(() => setUser(null));
    }, [pathname]);

    const handleLogout = async () => {
        try {
            await Logout();
        } catch { }
        localStorage.removeItem("name");
        localStorage.removeItem("balance");
        window.location.href = "/";
    };

    return (
        <header className="sticky top-0 z-40 h-16 border-b border-sky-100 bg-white/80 backdrop-blur-md">
            <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 lg:hidden">
                    <button
                        type="button"
                        onClick={onMenuToggle}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-sky-200 bg-white text-sky-600 shadow-sm"
                    >
                        <FiMenu size={20} />
                    </button>
                    <Link href="/">
                        <BrandLogo compact />
                    </Link>
                </div>

                <div className="hidden flex-1 justify-center lg:flex">
                    <div className="relative w-full max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
                        <input
                            type="text"
                            placeholder="Nhập tên game cần nạp..."
                            className="h-10 w-full rounded-full border border-sky-100 bg-sky-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden text-right leading-none sm:block">
                                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                <p className="text-xs text-sky-600 font-medium">
                                    {user.balance?.toLocaleString() || 0} VND
                                </p>
                            </div>
                            <Link
                                href="/account"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-white transition hover:bg-sky-50 hover:border-sky-300 shadow-sm"
                            >
                                <FiUser size={20} className="text-sky-700" />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/auth/login"
                                className="rounded-full px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href="/auth/register"
                                className="rounded-full bg-sky-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 active:scale-95"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
