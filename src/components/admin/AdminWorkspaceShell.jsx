"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FiArrowRight,
    FiBarChart2,
    FiCreditCard,
    FiGrid,
    FiLayers,
    FiPackage,
    FiRefreshCw,
    FiShield,
    FiUsers,
} from "react-icons/fi";

import { getInfo } from "@/services/auth.service";

const navItems = [
    { href: "/admin", label: "Overview", icon: FiBarChart2 },
    { href: "/admin/orders", label: "Đơn hàng", icon: FiLayers },
    { href: "/admin/wallet", label: "Nạp ví", icon: FiCreditCard },
    { href: "/admin/users", label: "Người dùng", icon: FiUsers },
    { href: "/admin/games", label: "Game", icon: FiGrid },
    { href: "/admin/packages", label: "Gói nạp", icon: FiPackage },
];

export default function AdminWorkspaceShell({
    title,
    description,
    children,
    actions = null,
    onRefresh = null,
    refreshing = false,
}) {
    const pathname = usePathname();
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        let mounted = true;

        getInfo()
            .then((payload) => {
                if (!mounted) return;
                setUser(payload?.user || payload || null);
            })
            .catch(() => {
                if (!mounted) return;
                setUser(null);
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (user === undefined) {
        return (
            <section className="rounded-[1.5rem] border border-[var(--app-border)] bg-white/96 p-5 shadow-[0_12px_28px_rgba(77,157,255,0.07)]">
                <div className="flex items-center gap-3 text-slate-600">
                    <FiRefreshCw className="animate-spin text-sky-600" />
                    <span className="text-sm font-semibold">Đang tải workspace quản trị...</span>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="rounded-[1.5rem] border border-[var(--app-border)] bg-white/96 p-5 text-center shadow-[0_12px_28px_rgba(77,157,255,0.07)]">
                <p className="page-kicker">Admin</p>
                <h1 className="page-title mt-3">Bạn cần đăng nhập</h1>
                <p className="copy-sm mt-3">
                    Đăng nhập bằng tài khoản quản trị để truy cập khu điều hành SnowTopup.
                </p>
                <Link
                    href="/auth/login"
                    className="btn-copy mt-5 inline-flex rounded-full bg-sky-600 px-5 py-2.5 text-sm text-white transition hover:bg-sky-700"
                >
                    Đi tới đăng nhập
                </Link>
            </section>
        );
    }

    if (user.role !== "admin") {
        return (
            <section className="rounded-[1.5rem] border border-[var(--app-border)] bg-white/96 p-5 shadow-[0_12px_28px_rgba(77,157,255,0.07)]">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <FiShield size={20} />
                    </div>
                    <div>
                        <p className="page-kicker">Không đủ quyền</p>
                        <h1 className="page-title mt-3">Trang này chỉ dành cho quản trị viên</h1>
                        <p className="copy-sm mt-3 max-w-2xl">
                            Tài khoản hiện tại không có quyền truy cập khu admin SnowTopup.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/account"
                                className="btn-copy rounded-full border border-[var(--app-border)] bg-white px-4 py-2.5 text-sm text-slate-700 transition hover:bg-[rgba(244,249,255,0.8)]"
                            >
                                Về tài khoản
                            </Link>
                            <Link
                                href="/auth/login"
                                className="btn-copy rounded-full bg-sky-600 px-4 py-2.5 text-sm text-white transition hover:bg-sky-700"
                            >
                                Đăng nhập tài khoản khác
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div className="space-y-4">
            <section className="rounded-[1.6rem] border border-[var(--app-border)] bg-white/96 p-4 shadow-[0_14px_30px_rgba(77,157,255,0.08)] sm:p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-1.5">
                        <span className="page-kicker">SnowTopup Admin</span>
                        <h1 className="page-title">{title}</h1>
                        <p className="copy-xs max-w-3xl text-slate-500">{description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {onRefresh ? (
                            <button
                                type="button"
                                onClick={onRefresh}
                                disabled={refreshing}
                                className="btn-copy inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-white px-3 py-2 text-[13px] text-slate-700 transition hover:bg-[rgba(244,249,255,0.8)] disabled:opacity-60"
                            >
                                <FiRefreshCw className={refreshing ? "animate-spin" : ""} size={15} />
                                Làm mới
                            </button>
                        ) : null}
                        {actions}
                        <Link
                            href="/account"
                            className="btn-copy inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-2 text-[13px] text-white transition hover:bg-sky-700"
                        >
                            Khu thành viên
                            <FiArrowRight size={15} />
                        </Link>
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const itemPath = item.href.split("#")[0].split("?")[0];
                        const active =
                            pathname === itemPath ||
                            (itemPath !== "/admin" && pathname?.startsWith(itemPath));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold transition ${
                                    active
                                        ? "bg-sky-600 text-white shadow-md shadow-sky-100/40"
                                        : "border border-[var(--app-border)] bg-white text-slate-700 hover:bg-[rgba(244,249,255,0.85)]"
                                }`}
                            >
                                <Icon size={14} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </section>

            {children}
        </div>
    );
}
