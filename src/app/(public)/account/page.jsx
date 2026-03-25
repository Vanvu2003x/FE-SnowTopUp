"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    FiArrowRight,
    FiCalendar,
    FiCreditCard,
    FiMail,
    FiShield,
    FiTrendingDown,
    FiTrendingUp,
    FiUser,
} from "react-icons/fi";

import { getInfo } from "@/services/auth.service";
import { getFinancialSummary } from "@/services/user.service";

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

export default function AccountOverviewPage() {
    const [user, setUser] = useState(null);
    const [financials, setFinancials] = useState(null);

    useEffect(() => {
        Promise.all([getInfo(), getFinancialSummary()])
            .then(([userData, financialData]) => {
                setUser(userData?.user || userData || null);
                setFinancials(financialData || null);
            })
            .catch(() => {
                setUser(null);
                setFinancials(null);
            });
    }, []);

    const stats = useMemo(
        () => [
            ["Số dư hiện tại", formatCurrency(user?.balance), FiCreditCard],
            ["Tổng tiền nạp", formatCurrency(financials?.tong_nap), FiTrendingUp],
            ["Đã chi tiêu", formatCurrency(financials?.tong_tieu), FiTrendingDown],
            ["Chi tháng này", formatCurrency(financials?.tong_tieu_thang), FiTrendingDown],
        ],
        [financials, user]
    );

    const infoItems = useMemo(
        () => [
            ["Họ và tên", user?.name || "Chưa cập nhật", FiUser],
            ["Email", user?.email || "Chưa cập nhật", FiMail],
            ["Vai trò", user?.role === "admin" ? "Quản trị viên" : "Thành viên", FiShield],
            [
                "Ngày tham gia",
                user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("vi-VN")
                    : "Chưa có dữ liệu",
                FiCalendar,
            ],
        ],
        [user]
    );

    if (!user) {
        return (
            <section className="panel-strong rounded-[2.2rem] border border-sky-100 p-6 text-center sm:p-8">
                <p className="page-kicker">Tài khoản</p>
                <h1 className="page-title mt-3">Bạn chưa đăng nhập</h1>
                <p className="copy-sm mt-3">
                    Đăng nhập để xem số dư, giao dịch nạp tiền và biến động ví của bạn.
                </p>
                <Link
                    href="/auth/login"
                    className="btn-copy mt-6 inline-flex rounded-full bg-sky-600 px-6 py-3 text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 active:scale-95"
                >
                    Đi tới đăng nhập
                </Link>
            </section>
        );
    }

    return (
        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="rounded-[2.5rem] border border-sky-100 bg-white p-7 shadow-sm">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-3">
                        <span className="page-kicker">Tổng quan ví</span>
                        <h1 className="page-title">Xin chào, {user.name || "bạn"}</h1>
                        <p className="copy-sm max-w-2xl">
                            Quản lý ví, theo dõi thống kê chi tiêu và lịch sử giao dịch của bạn một cách trực quan.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/account/nap-tien"
                            className="btn-copy flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-3 text-white shadow-lg shadow-sky-100 transition-all hover:scale-105 active:scale-95"
                        >
                            <FiCreditCard size={17} />
                            Nạp tiền vào ví
                        </Link>
                        <Link
                            href="/account/don-hang"
                            className="btn-copy flex items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 text-sky-700 transition-all hover:border-sky-300 hover:bg-white"
                        >
                            Lịch sử giao dịch
                        </Link>
                    </div>
                </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(([label, value, Icon]) => (
                    <div
                        key={label}
                        className="group rounded-3xl border border-sky-100 bg-white p-5 shadow-sm transition-all hover:border-sky-600 hover:shadow-md hover:shadow-sky-100"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="meta-label text-sky-400">{label}</p>
                                <p className="text-base font-black tracking-tight text-sky-900 transition-colors group-hover:text-sky-600">
                                    {value}
                                </p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm transition-transform group-hover:scale-110">
                                <Icon size={18} />
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <section className="grid gap-7 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2.5rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-7">
                    <div className="mb-7 flex items-center justify-between">
                        <h3 className="section-title">Thông tin hồ sơ</h3>
                        <Link
                            href="/account/thong-tin"
                            className="meta-label text-sky-500 underline decoration-2 underline-offset-4 hover:text-sky-600"
                        >
                            Xem đầy đủ
                        </Link>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {infoItems.map(([label, value, Icon]) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-sky-50 bg-sky-50/50 p-4 transition-colors hover:bg-sky-100/50"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-50 bg-white text-sky-600 shadow-sm">
                                        <Icon size={17} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="meta-label text-sky-400">{label}</p>
                                        <p className="mt-1 truncate text-sm font-bold text-sky-900">{value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-7">
                    <h3 className="section-title mb-7">Lối tắt nhanh</h3>
                    <div className="space-y-3">
                        {[
                            [
                                "/account/lich-su",
                                "Biến động số dư",
                                "Chi tiết cộng, trừ và hoàn tiền trong ví.",
                            ],
                            [
                                "/account/don-hang",
                                "Lịch sử giao dịch",
                                "Xem danh sách và trạng thái giao dịch.",
                            ],
                            [
                                "/account/thong-tin",
                                "TT cá nhân",
                                "Xem hồ sơ và thông tin tài khoản.",
                            ],
                        ].map(([href, title, desc]) => (
                            <Link
                                key={href}
                                href={href}
                                className="group flex items-center justify-between rounded-2xl border border-sky-50 bg-sky-50/50 p-4 transition-all hover:border-sky-300 hover:bg-white hover:shadow-md hover:shadow-sky-100"
                            >
                                <div>
                                    <p className="card-title transition-colors group-hover:text-sky-600">
                                        {title}
                                    </p>
                                    <p className="copy-xs mt-1">{desc}</p>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sky-300 shadow-sm transition-all group-hover:translate-x-1 group-hover:bg-sky-600 group-hover:text-white">
                                    <FiArrowRight size={13} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
