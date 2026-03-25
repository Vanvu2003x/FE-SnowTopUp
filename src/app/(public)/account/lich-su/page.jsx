"use client";

import { useEffect, useState } from "react";
import { FiArrowDownRight, FiArrowUpRight, FiRefreshCw } from "react-icons/fi";

import { getTransactionHistory } from "@/services/order.service";

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

export default function AccountHistoryPage() {
    const [data, setData] = useState({ transactions: [] });

    useEffect(() => {
        getTransactionHistory(1)
            .then((result) => setData(result || { transactions: [] }))
            .catch(() => setData({ transactions: [] }));
    }, []);

    return (
        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="rounded-[2.5rem] border border-sky-100 bg-white p-7 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        <span className="page-kicker">Lịch sử ví</span>
                        <h1 className="page-title">Biến động số dư</h1>
                        <p className="copy-sm max-w-3xl">
                            Chi tiết các giao dịch cộng, trừ và hoàn tiền vào ví của bạn. Mọi thay đổi về số dư đều được ghi lại minh bạch tại đây.
                        </p>
                    </div>
                    <div className="meta-label rounded-2xl border border-sky-100 bg-sky-50 px-4 py-2 text-sky-600">
                        {(data.transactions || []).length} Tổng giao dịch
                    </div>
                </div>
            </section>

            <section className="rounded-[2rem] border border-sky-100 bg-white p-2 sm:p-4 shadow-sm">
                <div className="hidden rounded-2xl border border-sky-100 bg-sky-50/50 px-6 py-4 lg:grid lg:grid-cols-[150px_minmax(0,1fr)_150px_150px_190px] lg:gap-4">
                    <span className="meta-label text-sky-400">Loại giao dịch</span>
                    <span className="meta-label text-sky-400">Nội dung chi tiết</span>
                    <span className="meta-label text-sky-400">Số tiền</span>
                    <span className="meta-label text-sky-400">Số dư sau</span>
                    <span className="meta-label text-sky-400">Thời gian</span>
                </div>

                <div className="mt-2 grid gap-2">
                    {(data.transactions || []).length > 0 ? (
                        data.transactions.map((item) => {
                            const positive = Number(item.amount) >= 0;

                            return (
                                <div
                                    key={item.id}
                                    className="group rounded-2xl border border-transparent bg-white p-4 transition-all hover:border-sky-100 hover:bg-sky-50/30 lg:grid lg:grid-cols-[150px_minmax(0,1fr)_150px_150px_190px] lg:items-center lg:gap-4 lg:px-6"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 ${
                                                positive
                                                    ? "bg-sky-100 text-sky-600"
                                                    : "bg-amber-50 text-amber-600"
                                            }`}
                                        >
                                            {positive ? (
                                                <FiArrowUpRight size={18} />
                                            ) : (
                                                <FiArrowDownRight size={18} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="card-title truncate uppercase group-hover:text-sky-600">
                                                {item.type || "Giao dịch"}
                                            </p>
                                            <p className="copy-xs mt-1 lg:hidden">
                                                {item.created_at
                                                    ? new Date(item.created_at).toLocaleString("vi-VN")
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 lg:mt-0">
                                        <p className="copy-sm truncate">
                                            {item.description || "Không có mô tả giao dịch."}
                                        </p>
                                    </div>

                                    <div className="mt-4 lg:mt-0">
                                        <p className="meta-label mb-1 text-sky-300 lg:hidden">Số tiền</p>
                                        <p
                                            className={`text-sm font-black ${
                                                positive ? "text-sky-600" : "text-amber-600"
                                            }`}
                                        >
                                            {positive ? "+" : ""}
                                            {formatCurrency(item.amount)}
                                        </p>
                                    </div>

                                    <div className="mt-4 lg:mt-0">
                                        <p className="meta-label mb-1 text-sky-300 lg:hidden">Số dư sau GD</p>
                                        <p className="inline-block rounded-lg bg-sky-50 px-3 py-1 text-sm font-bold text-sky-900 lg:bg-transparent lg:p-0">
                                            {formatCurrency(item.balance_after)}
                                        </p>
                                    </div>

                                    <div className="meta-label mt-4 flex items-center gap-2 text-sky-300 lg:mt-0">
                                        <FiRefreshCw size={13} className="text-sky-200" />
                                        <span>
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleString("vi-VN")
                                                : "-"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/30 py-14 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-sky-100 shadow-sm">
                                <FiRefreshCw size={28} />
                            </div>
                            <p className="meta-label text-sky-300">Chưa có biến động số dư nào.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
