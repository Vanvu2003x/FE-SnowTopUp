"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiCreditCard, FiMail, FiShield, FiUser } from "react-icons/fi";

import { getInfo } from "@/services/auth.service";
import { getFinancialSummary } from "@/services/user.service";

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

export default function AccountProfilePage() {
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
            <section className="rounded-[2.2rem] border border-sky-100 p-6 text-center sm:p-8">
                <p className="page-kicker">Thông tin cá nhân</p>
                <h1 className="page-title mt-3">Bạn chưa đăng nhập</h1>
                <p className="copy-sm mt-3">
                    Đăng nhập để xem thông tin tài khoản, email và số dư hiện tại.
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
                <span className="page-kicker">Hồ sơ thành viên</span>
                <h1 className="page-title mt-3">Thông tin cá nhân</h1>
                <p className="copy-sm mt-3 max-w-3xl">
                    Đây là khu vực tổng hợp hồ sơ thành viên, vai trò hiện tại và các thông số ví để bạn theo dõi nhanh.
                </p>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    ["Số dư hiện tại", formatCurrency(user?.balance), FiCreditCard],
                    ["Tổng tiền nạp", formatCurrency(financials?.tong_nap), FiCreditCard],
                    ["Đã chi tiêu", formatCurrency(financials?.tong_tieu), FiCreditCard],
                    ["Chi tháng này", formatCurrency(financials?.tong_tieu_thang), FiCreditCard],
                ].map(([label, value, Icon]) => (
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
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm">
                                <Icon size={18} />
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <section className="grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[2.5rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-7">
                    <div className="mb-7 flex items-center justify-between">
                        <h2 className="section-title">Hồ sơ thành viên</h2>
                        <span className="meta-label rounded-full bg-sky-50 px-4 py-2 text-sky-500">
                            TV
                        </span>
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
                    <h2 className="section-title">Đi nhanh</h2>
                    <div className="mt-5 space-y-3">
                        {[
                            ["/account/nap-tien", "Nạp tiền", "Tạo QR nạp ví trong vài giây."],
                            [
                                "/account/don-hang",
                                "Lịch sử giao dịch",
                                "Xem danh sách đơn và tình trạng xử lý.",
                            ],
                            [
                                "/account/lich-su",
                                "Biến động số dư",
                                "Theo dõi cộng trừ và hoàn tiền trong ví.",
                            ],
                        ].map(([href, title, desc]) => (
                            <Link
                                key={href}
                                href={href}
                                className="block rounded-2xl border border-sky-50 bg-sky-50/50 p-4 transition-all hover:border-sky-300 hover:bg-white hover:shadow-md hover:shadow-sky-100"
                            >
                                <p className="card-title">{title}</p>
                                <p className="copy-xs mt-1">{desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
