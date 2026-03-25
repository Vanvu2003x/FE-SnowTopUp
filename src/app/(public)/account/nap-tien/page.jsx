"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiCopy, FiCreditCard, FiShield, FiTrendingUp } from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { getUrlPayment } from "@/services/payment.service";
import { getLogByUser } from "@/services/toup-wallet-logs.service";

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

export default function AccountTopupPage() {
    const toast = useToast();
    const [amount, setAmount] = useState("100000");
    const [qrData, setQrData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getLogByUser(1)
            .then((result) =>
                setLogs(result?.logs || result?.data || result?.walletLogs || [])
            )
            .catch(() => setLogs([]));
    }, []);

    const handleCreateQr = async () => {
        setLoading(true);
        try {
            const result = await getUrlPayment({
                amount: Number(amount),
                description: "Nạp tiền vào ví SnowTopup",
            });
            setQrData(result || null);
            toast.success("Đã tạo mã QR thanh toán.");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Không thể tạo mã QR.");
        } finally {
            setLoading(false);
        }
    };

    const copy = async (value) => {
        await navigator.clipboard.writeText(value);
        toast.success("Đã sao chép.");
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 space-y-7 fade-in duration-700">
            <section className="rounded-[2.5rem] border border-[var(--app-border)] bg-white/95 p-7 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                <span className="page-kicker">Nạp ví</span>
                <h1 className="page-title mt-3">Nạp tiền vào ví</h1>
                <p className="copy-sm mt-3 max-w-3xl">
                    Sử dụng mã QR để nạp tiền vào ví nội bộ. Hệ thống sẽ tự động cập
                    nhật số dư của bạn ngay sau khi nhận được thanh toán.
                </p>
            </section>

            <section className="grid gap-7 xl:grid-cols-[1fr_1.15fr]">
                <div className="rounded-[2.5rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)] sm:p-7">
                    <div className="mb-7 flex items-center gap-3">
                        <span className="meta-label flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-100/50">
                            01
                        </span>
                        <h2 className="section-title">Chọn số tiền</h2>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        {["100000", "200000", "500000"].map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => setAmount(preset)}
                                className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                                    amount === preset
                                        ? "scale-[1.03] bg-sky-600 text-white shadow-lg shadow-sky-200/50"
                                        : "border border-[var(--app-border)] bg-[rgba(244,249,255,0.85)] text-slate-700 hover:border-sky-200 hover:bg-white"
                                }`}
                            >
                                {formatCurrency(preset)}
                            </button>
                        ))}
                    </div>

                    <div className="mt-6">
                        <label className="meta-label mb-2 block text-slate-600">
                            Số tiền tùy chỉnh
                        </label>
                        <div className="group flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.88)] px-4 py-4 transition-all focus-within:border-sky-500 focus-within:bg-white focus-within:shadow-md focus-within:shadow-sky-100/40">
                            <span className="font-black text-sky-600">VNĐ</span>
                            <input
                                type="number"
                                min="10000"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                className="w-full bg-transparent text-base font-black text-slate-900 outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateQr}
                        disabled={loading}
                        className="btn-copy mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-3.5 text-white shadow-xl shadow-sky-200/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                    >
                        <FiCreditCard size={17} />
                        {loading ? "Đang xử lý..." : "Tạo mã QR nạp tiền"}
                    </button>

                    <div className="mt-7 flex items-start gap-4 rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.85)] p-5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                            <FiShield size={17} />
                        </span>
                        <div>
                            <p className="card-title">Lưu ý quan trọng</p>
                            <p className="copy-xs mt-1 text-slate-600">
                                Hãy đảm bảo chuyển khoản đúng nội dung và số tiền đã tạo để
                                hệ thống tự động cộng tiền vào ví của bạn.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-7">
                    <div className="rounded-[2.5rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)] sm:p-7">
                        <div className="mb-7 flex items-center gap-3">
                            <span className="meta-label flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-100/50">
                                02
                            </span>
                            <h2 className="section-title">Quét mã thanh toán</h2>
                        </div>

                        {qrData ? (
                            <div className="grid gap-7 md:grid-cols-[220px_1fr]">
                                <div className="space-y-4">
                                    <div className="aspect-square w-full overflow-hidden rounded-2xl border-4 border-sky-100/70 bg-white p-2 shadow-md shadow-sky-100/30">
                                        <img
                                            src={qrData.urlPayment || qrData.qrCode}
                                            alt="QR thanh toán"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <p className="meta-label text-center text-slate-500">
                                        Mở ứng dụng ngân hàng
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        ["Ngân hàng", qrData.bank_name || qrData.bankName || "MB Bank"],
                                        ["Số tài khoản", qrData.accountNumber || "-"],
                                        ["Nội dung", qrData.memo || qrData.description || "-"],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-5 py-4 transition-colors hover:border-sky-200 hover:bg-white"
                                        >
                                            <div className="min-w-0">
                                                <p className="meta-label text-slate-500">{label}</p>
                                                <p className="mt-1 truncate text-sm font-black text-slate-900">
                                                    {value}
                                                </p>
                                            </div>
                                            {value && value !== "-" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => copy(value)}
                                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm transition-all hover:bg-sky-600 hover:text-white"
                                                    title="Sao chép"
                                                >
                                                    <FiCopy size={15} />
                                                </button>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-14 text-center">
                                <div className="mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-[rgba(244,249,255,0.9)] text-sky-400">
                                    <FiCreditCard size={34} />
                                </div>
                                <p className="meta-label text-slate-500">
                                    Vui lòng thực hiện bước 1
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-[2.5rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)] sm:p-7">
                        <div className="mb-7 flex items-center justify-between">
                            <h3 className="section-title">Lịch sử nạp</h3>
                            <Link
                                href="/account/lich-su"
                                className="meta-label text-sky-600 underline decoration-2 underline-offset-4 hover:text-sky-700"
                            >
                                Tất cả
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {logs.length > 0 ? (
                                logs.slice(0, 5).map((log, index) => (
                                    <div
                                        key={log.id || index}
                                        className="flex items-center justify-between rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4 transition-colors hover:border-sky-200 hover:bg-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                                                <FiTrendingUp size={17} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black leading-none text-slate-900">
                                                    {formatCurrency(log.amount)}
                                                </p>
                                                <p className="copy-xs mt-1 text-slate-500">
                                                    {log.created_at
                                                        ? new Date(log.created_at).toLocaleString("vi-VN")
                                                        : "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`meta-label rounded-full px-3 py-1 ${
                                                log.status === "success"
                                                    ? "bg-sky-100 text-sky-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            {log.status === "success"
                                                ? "Thành công"
                                                : log.status || "Đang xử lý"}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-9 text-center">
                                    <p className="meta-label text-slate-500">
                                        Chưa có giao dịch.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
