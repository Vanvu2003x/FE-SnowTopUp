"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiArrowRight,
    FiBarChart2,
    FiCreditCard,
    FiGrid,
    FiLayers,
    FiPackage,
    FiRefreshCw,
    FiUsers,
} from "react-icons/fi";

const navItems = [
    { href: "/admin", label: "Overview", icon: FiBarChart2 },
    { href: "/admin/orders", label: "Don hang", icon: FiLayers },
    { href: "/admin/wallet", label: "Nap vi", icon: FiCreditCard },
    { href: "/admin/users", label: "Nguoi dung", icon: FiUsers },
    { href: "/admin/games", label: "Game", icon: FiGrid },
    { href: "/admin/packages", label: "Goi nap", icon: FiPackage },
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
                                Lam moi
                            </button>
                        ) : null}
                        {actions}
                        <Link
                            href="/account"
                            className="btn-copy inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-2 text-[13px] text-white transition hover:bg-sky-700"
                        >
                            Khu thanh vien
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
