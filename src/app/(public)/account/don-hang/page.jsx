"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiClock, FiRefreshCw, FiXCircle } from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { CancelOrder, getOrdersByUserId } from "@/services/order.service";

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

const statusClasses = {
    pending: "bg-amber-50 text-amber-600 border border-amber-100",
    processing: "bg-sky-100 text-sky-700 border border-sky-200",
    success: "bg-sky-600 text-white shadow-sm",
    failed: "bg-rose-50 text-rose-600 border border-rose-100",
    cancel: "bg-sky-50 text-sky-400 border border-sky-100",
};

export default function AccountOrdersPage() {
    const toast = useToast();
    const [orders, setOrders] = useState([]);

    const loadOrders = async () => {
        try {
            const result = await getOrdersByUserId(1);
            setOrders(result?.orders || []);
        } catch {
            setOrders([]);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const pendingCount = useMemo(
        () => orders.filter((order) => order.status === "pending").length,
        [orders]
    );

    const handleCancel = async (id) => {
        try {
            await CancelOrder(id);
            toast.success(`Đã hủy đơn #${id}.`);
            loadOrders();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Không thể hủy đơn.");
        }
    };

    return (
        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="rounded-[2.5rem] border border-sky-100 bg-white p-7 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-3">
                        <span className="page-kicker">Giao dịch</span>
                        <h1 className="page-title">Lịch sử giao dịch</h1>
                        <p className="copy-sm max-w-3xl">
                            Theo dõi chi tiết các đơn nạp game của bạn. Hệ thống tự động cập nhật trạng thái và xử lý hoàn tiền nếu có sự cố.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <span className="meta-label rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 text-sky-700">
                            {orders.length} Tổng giao dịch
                        </span>
                        <span className="meta-label rounded-2xl border border-sky-600 bg-sky-600 px-4 py-2 text-white shadow-md shadow-sky-100">
                            {pendingCount} Đang chờ
                        </span>
                    </div>
                </div>
            </section>

            <section className="grid gap-3">
                {orders.length > 0 ? (
                    orders.map((order) => {
                        const statusClass =
                            statusClasses[order.status] || "bg-sky-50 text-sky-600";

                        return (
                            <div
                                key={order.id}
                                className="group rounded-[2rem] border border-sky-100 bg-white p-5 shadow-sm transition-all hover:border-sky-600 hover:shadow-md hover:shadow-sky-100"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex flex-1 gap-5">
                                        <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-[1.15rem] bg-sky-50 text-sky-600 shadow-sm transition-all group-hover:bg-sky-600 group-hover:text-white sm:flex">
                                            <FiClock size={21} />
                                        </div>
                                        <div className="min-w-0 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="meta-label text-sky-300">Order #{order.id}</span>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClass}`}
                                                >
                                                    {order.status || "pending"}
                                                </span>
                                            </div>
                                            <h3 className="section-title truncate">
                                                {order.game_name || order.package_name || "Đơn hàng nạp game"}
                                            </h3>
                                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                <div className="meta-label flex items-center gap-2 text-sky-400">
                                                    <FiClock className="text-sky-200" />
                                                    {order.create_at
                                                        ? new Date(order.create_at).toLocaleString("vi-VN")
                                                        : "-"}
                                                </div>
                                                <div className="meta-label flex items-center gap-2 text-sky-400">
                                                    <FiRefreshCw size={13} className="text-sky-200" />
                                                    {formatCurrency(order.amount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 lg:flex-row-reverse">
                                        <div className="flex-1 lg:flex-none">
                                            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-3 text-center">
                                                <p className="meta-label mb-1 text-sky-300">Thành tiền</p>
                                                <p className="text-base font-black text-sky-600">
                                                    {formatCurrency(order.amount)}
                                                </p>
                                            </div>
                                        </div>
                                        {order.status === "pending" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleCancel(order.id)}
                                                className="btn-copy flex h-[48px] items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white px-5 text-sky-400 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white"
                                            >
                                                <FiXCircle size={17} />
                                                <span className="hidden sm:inline">Hủy đơn</span>
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-[2.5rem] border border-dashed border-sky-200 bg-white p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-200">
                            <FiClock size={34} />
                        </div>
                        <h3 className="section-title mb-2">Chưa có giao dịch</h3>
                        <p className="copy-sm mx-auto mb-7 max-w-xs">
                            Bạn chưa có giao dịch nào được thực hiện. Khám phá các gói nạp hấp dẫn ngay.
                        </p>
                        <Link
                            href="/"
                            className="btn-copy inline-flex items-center gap-3 rounded-2xl bg-sky-600 px-7 py-3.5 text-white shadow-xl shadow-sky-100 transition-all hover:scale-105 active:scale-95"
                        >
                            Khám phá ngay
                            <FiRefreshCw />
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
