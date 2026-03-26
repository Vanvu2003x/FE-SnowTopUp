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

                <div className="relative overflow-hidden rounded-[20px] border border-[rgba(201,210,236,0.94)] bg-[linear-gradient(135deg,#f7f5ff_0%,#f2f5ff_48%,#eef8ff_100%)] px-3.5 py-3 shadow-[0_18px_40px_rgba(123,145,193,0.12)]">
                    <div className="absolute inset-y-0 left-0 w-[40%] bg-[linear-gradient(180deg,#31224f_0%,#49346f_100%)]" />
                    <div className="absolute left-[34%] top-0 h-full w-24 bg-[radial-gradient(circle_at_left,rgba(173,138,255,0.22),transparent_72%)]" />
                    <div className="relative flex items-center gap-3">
                        <div className="relative -mb-3 ml-[-8px] shrink-0 self-end">
                            <div className="absolute left-4 top-6 h-14 w-14 rounded-full bg-violet-300/25 blur-2xl" />
                            <img
                                src="/images/gojo.png"
                                alt="Gojo"
                                className="relative h-[110px] w-[84px] object-contain object-left-bottom drop-shadow-[0_10px_20px_rgba(40,20,73,0.34)]"
                            />
                        </div>

                        <div className="min-w-0 flex-1 py-1 pl-1.5">
                            <p className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">
                                Kênh cộng đồng
                            </p>
                            <h3 className="mt-1.5 text-[11px] font-semibold leading-4 tracking-[-0.02em] text-slate-700">
                                Vào nhóm
                            </h3>
                            <p className="text-[15px] font-black leading-[1.02] tracking-[-0.045em] text-slate-950">
                                SnowTopup
                            </p>
                            <p className="mt-1 max-w-[136px] text-[9px] font-medium leading-[1.35] text-slate-600">
                                Tin game hot, hỗ trợ nhanh.
                            </p>
                            <a
                                href={siteConfig.supportUrl || `mailto:${siteConfig.supportEmail}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex min-h-[34px] min-w-[118px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#46b5e2_0%,#3ec6b1_100%)] px-4 text-[11px] font-bold text-white shadow-[0_12px_24px_rgba(59,202,180,0.22)] transition hover:-translate-y-0.5 hover:brightness-105"
                            >
                                Vào nhóm
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
