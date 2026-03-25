"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FiClock,
    FiCreditCard,
    FiGrid,
    FiHelpCircle,
    FiHome,
    FiList,
    FiLogIn,
    FiLogOut,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiUser,
} from "react-icons/fi";

import BrandLogo from "@/components/layout/BrandLogo";
import { siteConfig } from "@/config/site";
import { getInfo, Logout } from "@/services/auth.service";

const iconMap = {
    home: FiHome,
    games: FiGrid,
    search: FiSearch,
    list: FiList,
    help: FiHelpCircle,
    support: FiUser,
    wallet: FiCreditCard,
    history: FiRefreshCw,
    activity: FiClock,
    profile: FiUser,
    admin: FiShield,
};

function NavItem({ item, active, onNavigate }) {
    const Icon = iconMap[item.icon] || FiGrid;
    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 border-r-2 px-4 py-3 text-[14px] font-medium transition-all duration-200 ${
                active
                    ? "border-sky-600 bg-sky-100 text-sky-600"
                    : "border-transparent text-slate-600 hover:bg-sky-50 hover:text-sky-900"
            }`}
        >
            <Icon
                size={18}
                className={active ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}
            />
            <span>{item.label}</span>
        </Link>
    );
}

export default function SidebarNav({ onNavigate }) {
    const pathname = usePathname();
    const [user, setUser] = useState(null);

    useEffect(() => {
        getInfo()
            .then((data) => setUser(data?.user || data || null))
            .catch(() => setUser(null));
    }, []);

    const navigationSections = [
        ...(siteConfig.navigationSections || []),
        ...(user?.role === "admin"
            ? [
                  {
                      title: "Admin",
                      items: [{ label: "Admin panel", href: "/admin", icon: "admin" }],
                  },
              ]
            : []),
    ];

    const handleLogout = async () => {
        try {
            await Logout();
        } catch {}
        localStorage.removeItem("name");
        localStorage.removeItem("balance");
        window.location.href = "/";
    };

    return (
        <div className="flex h-full flex-col bg-white text-slate-900">
            <div className="border-b border-sky-100 p-6">
                <Link href="/" className="flex items-center" onClick={onNavigate}>
                    <BrandLogo />
                </Link>
            </div>

            {user && (
                <div className="mx-4 mt-6 rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.82)] p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 font-bold text-white">
                            {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">{user.username}</p>
                            <p className="text-[10px] font-black uppercase text-sky-600">TV</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
                {navigationSections.map((section, idx) => (
                    <div key={idx} className="mb-6">
                        {section.title && (
                            <p className="mb-2 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {section.title}
                            </p>
                        )}
                        <nav className="flex flex-col">
                            {section.items.map((item) => (
                                <NavItem
                                    key={item.href}
                                    item={item}
                                    active={pathname === item.href}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </nav>
                    </div>
                ))}
            </div>

            <div className="border-t border-sky-100 p-4">
                {user ? (
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-sky-100 bg-white py-2 text-sm font-bold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    >
                        <FiLogOut size={16} />
                        Đăng xuất
                    </button>
                ) : (
                    <div className="mb-3 grid gap-2">
                        <Link
                            href="/auth/login"
                            onClick={onNavigate}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-sky-100 bg-white py-2 text-sm font-bold text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        >
                            <FiLogIn size={16} />
                            Đăng nhập
                        </Link>
                        <Link
                            href="/auth/register"
                            onClick={onNavigate}
                            className="flex w-full items-center justify-center rounded-lg bg-sky-600 py-2 text-sm font-bold text-white shadow-md shadow-sky-100 transition hover:bg-sky-700"
                        >
                            Đăng ký
                        </Link>
                    </div>
                )}

                <div className="rounded-xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.86)] p-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Hỗ trợ
                    </p>
                    <p className="mb-3 text-xs text-slate-600">
                        Quản lý tài khoản, giao dịch và liên hệ hỗ trợ ngay tại đây.
                    </p>
                    <a
                        href={siteConfig.supportUrl || "#"}
                        target="_blank"
                        className="flex w-full items-center justify-center rounded-lg bg-sky-600 py-2 text-xs font-bold text-white shadow-md shadow-sky-100/40 transition hover:bg-sky-700"
                    >
                        Hỗ trợ khách hàng
                    </a>
                </div>
            </div>
        </div>
    );
}
