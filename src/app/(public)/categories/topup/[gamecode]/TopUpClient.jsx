"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    FiAlertCircle,
    FiCheck,
    FiLayers,
    FiLoader,
    FiShoppingBag,
} from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { getInfo } from "@/services/auth.service";
import { createOrder } from "@/services/order.service";

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

function normalizeInputFields(game) {
    if (Array.isArray(game?.input_fields) && game.input_fields.length > 0) {
        return game.input_fields.map((field, index) => ({
            key: field.name || `field_${index}`,
            label: field.label || field.name || `Trường ${index + 1}`,
            placeholder:
                field.placeholder || `Nhập ${field.label || field.name || "thông tin"}`,
        }));
    }

    return [
        {
            key: "uid",
            label: "UID / ID nhân vật",
            placeholder: "Nhập UID hoặc ID nhân vật",
        },
        {
            key: "server",
            label: "Máy chủ",
            placeholder: "Ví dụ: S1 hoặc Alpha",
        },
    ];
}

function resolvePrice(pkg, userLevel) {
    if (userLevel === 3 && pkg.price_plus) return Number(pkg.price_plus);
    if (userLevel === 2 && pkg.price_pro) return Number(pkg.price_pro);
    if (userLevel === 1 && pkg.price_basic) return Number(pkg.price_basic);
    return Number(pkg.price || 0);
}

export default function TopUpClient({ game, packages = [], allGames = [] }) {
    const router = useRouter();
    const toast = useToast();
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [fields, setFields] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        getInfo()
            .then((data) => setUser(data?.user || data || null))
            .catch(() => setUser(null));
    }, []);

    const normalizedFields = useMemo(() => normalizeInputFields(game), [game]);
    const userLevel = Number(user?.level || 1);

    const preparedPackages = useMemo(
        () =>
            packages
                .filter((pkg) => pkg.status === "active")
                .map((pkg) => ({
                    ...pkg,
                    displayPrice: resolvePrice(pkg, userLevel),
                })),
        [packages, userLevel]
    );

    useEffect(() => {
        if (!selectedPackage && preparedPackages.length > 0) {
            setSelectedPackage(preparedPackages[0]);
        }
    }, [preparedPackages, selectedPackage]);

    const canSubmit =
        selectedPackage &&
        normalizedFields.every((field) => String(fields[field.key] || "").trim());
    const insufficientBalance =
        user && selectedPackage
            ? Number(user.balance || 0) < Number(selectedPackage.displayPrice || 0)
            : false;

    const handleSubmit = async () => {
        if (!user) {
            toast.warning("Vui lòng đăng nhập trước khi tạo đơn nạp.");
            router.push("/auth/login");
            return;
        }

        if (!canSubmit) {
            toast.warning("Vui lòng điền đầy đủ thông tin tài khoản game.");
            return;
        }

        if (insufficientBalance) {
            toast.warning("Số dư hiện tại không đủ để tạo đơn nạp này.");
            return;
        }

        setSubmitting(true);
        try {
            const accountInfo = {
                ...fields,
                game_name: game?.name,
                payment_method: "wallet-balance",
                payment_method_label: "Số dư tài khoản",
            };

            await createOrder({
                package_id: selectedPackage.id,
                amount: Number(selectedPackage.displayPrice || selectedPackage.price || 0),
                account_info: JSON.stringify(accountInfo),
            });

            toast.success("Đã tạo đơn nạp thành công.");
            router.push("/account/don-hang");
            router.refresh();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Không thể tạo đơn nạp.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!game) {
        return (
            <div className="panel rounded-[2rem] p-8 text-center text-slate-500">
                Không tìm thấy game này. Hãy quay lại trang chủ để chọn game khác.
            </div>
        );
    }

    const heroImage = game.thumbnail?.startsWith("http")
        ? game.thumbnail
        : `${baseApiUrl}${game.thumbnail || ""}`;

    return (
        <div className="space-y-7 pb-20">
            <section className="relative h-60 overflow-hidden rounded-[2.5rem] border border-[var(--app-border)] bg-white shadow-[0_18px_42px_rgba(77,157,255,0.08)] sm:h-72">
                {game.thumbnail ? (
                    <img src={heroImage} alt={game.name} className="h-full w-full object-cover opacity-90" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[rgba(244,249,255,0.9)] text-sky-400">
                        <FiLayers size={56} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/78 via-slate-900/16 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <div className="flex items-center gap-4">
                        <img
                            src={heroImage}
                            alt={game.name}
                            className="h-14 w-14 rounded-2xl border-4 border-white shadow-lg sm:h-20 sm:w-20"
                        />
                        <div>
                            <p className="page-kicker text-white/75">Nạp game tự động</p>
                            <h1 className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">
                                {game.name}
                            </h1>
                            <p className="mt-1 text-xs font-medium text-white/82 sm:text-sm">
                                Xử lý tự động 24/7, thao tác nhanh và gọn.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-7">
                    <div className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                        <div className="mb-6 flex items-center gap-4">
                            <span className="meta-label flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-100/50">
                                1
                            </span>
                            <h2 className="section-title">Chọn gói nạp</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {preparedPackages.map((pkg) => {
                                const active = selectedPackage?.id === pkg.id;
                                return (
                                    <button
                                        key={pkg.id}
                                        onClick={() => setSelectedPackage(pkg)}
                                        className={`relative flex flex-col rounded-2xl border-2 p-4 text-left transition-all ${
                                            active
                                                ? "border-sky-600 bg-[rgba(239,247,255,0.96)] shadow-md shadow-sky-100/40"
                                                : "border-[var(--app-border)] bg-white hover:border-sky-200 hover:bg-[rgba(244,249,255,0.85)]"
                                        }`}
                                    >
                                        <span
                                            className={`text-sm font-bold line-clamp-2 ${
                                                active ? "text-slate-900" : "text-slate-700"
                                            }`}
                                        >
                                            {pkg.package_name}
                                        </span>
                                        <span
                                            className={`mt-2 text-sm font-black ${
                                                active ? "text-sky-700" : "text-slate-600"
                                            }`}
                                        >
                                            {formatCurrency(pkg.displayPrice)}
                                        </span>
                                        {active && (
                                            <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white shadow-sm ring-4 ring-white">
                                                <FiCheck size={14} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-7">
                    <div className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                        <div className="mb-6 flex items-center gap-4">
                            <span className="meta-label flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-100/50">
                                2
                            </span>
                            <h2 className="section-title">Thông tin tài khoản</h2>
                        </div>
                        <div className="grid gap-5">
                            {normalizedFields.map((field) => (
                                <div key={field.key}>
                                    <label className="meta-label mb-2 block text-slate-600">
                                        {field.label}
                                    </label>
                                    <input
                                        value={fields[field.key] || ""}
                                        onChange={(e) =>
                                            setFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                                        }
                                        placeholder={field.placeholder}
                                        className="h-11 w-full rounded-xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.88)] px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white placeholder:text-slate-400"
                                    />
                                </div>
                            ))}
                            {game.server?.length > 0 && (
                                <div>
                                    <label className="meta-label mb-2 block text-slate-600">
                                        Máy chủ
                                    </label>
                                    <select
                                        value={fields.server || ""}
                                        onChange={(e) =>
                                            setFields((prev) => ({ ...prev, server: e.target.value }))
                                        }
                                        className="h-11 w-full rounded-xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.88)] px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
                                    >
                                        <option value="">Chọn máy chủ</option>
                                        {game.server.map((s, i) => (
                                            <option key={i} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                        <div className="mb-6 flex items-center gap-4">
                            <span className="meta-label flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-100/50">
                                3
                            </span>
                            <h2 className="section-title">Thanh toán</h2>
                        </div>
                        <div className="rounded-2xl border border-sky-200 bg-[rgba(239,247,255,0.92)] p-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                                        <FiShoppingBag size={21} />
                                    </div>
                                    <div>
                                        <p className="card-title uppercase">Số dư ví</p>
                                        <p className="copy-xs mt-1 text-slate-600">
                                            Thanh toán ngay qua hệ thống SnowTopup
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-sky-700">
                                        {formatCurrency(user?.balance || 0)}
                                    </p>
                                    <p className="meta-label mt-1 text-slate-500">Khả dụng</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                        <div className="mb-6 flex items-center gap-4">
                            <span className="meta-label flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white shadow-md shadow-sky-100/50">
                                4
                            </span>
                            <h2 className="section-title">Hoàn tất đơn hàng</h2>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="space-y-1">
                                <p className="meta-label text-slate-500">Tổng tiền cần trả</p>
                                <p className="text-xl font-black tracking-tight text-sky-700">
                                    {formatCurrency(selectedPackage?.displayPrice || 0)}
                                </p>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={!canSubmit || submitting || insufficientBalance}
                                className="btn-copy flex h-12 items-center justify-center gap-3 rounded-2xl bg-sky-600 px-6 text-white shadow-xl shadow-sky-200/45 transition-all hover:scale-[1.02] hover:bg-sky-700 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                            >
                                {submitting ? (
                                    <FiLoader className="animate-spin" />
                                ) : (
                                    <FiShoppingBag size={18} />
                                )}
                                {submitting ? "Đang xử lý..." : "Nạp ngay"}
                            </button>
                        </div>
                        {insufficientBalance && (
                            <div className="mt-6 flex gap-3 rounded-xl border border-sky-200 bg-[rgba(244,249,255,0.92)] p-4 text-sm font-medium text-slate-700">
                                <FiAlertCircle className="mt-0.5 shrink-0 text-sky-600" size={18} />
                                <p>
                                    Số dư không đủ. Vui lòng{" "}
                                    <Link
                                        href="/account/nap-tien"
                                        className="font-black text-sky-700 underline decoration-2 underline-offset-4"
                                    >
                                        nạp thêm tiền
                                    </Link>{" "}
                                    vào ví.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                        <h3 className="section-title mb-6">Khám phá thêm</h3>
                        <div className="space-y-3">
                            {allGames.slice(0, 10).map((g) => (
                                <Link
                                    key={g.id}
                                    href={`/categories/topup/${g.gamecode}`}
                                    className={`flex items-center gap-3 rounded-xl p-2 transition-all hover:translate-x-1 ${
                                        g.gamecode === game.gamecode
                                            ? "bg-[rgba(239,247,255,0.96)] text-sky-700"
                                            : "hover:bg-[rgba(244,249,255,0.85)]"
                                    }`}
                                >
                                    <img
                                        src={
                                            g.thumbnail?.startsWith("http")
                                                ? g.thumbnail
                                                : `${baseApiUrl}${g.thumbnail}`
                                        }
                                        alt={g.name}
                                        className="h-10 w-10 rounded-lg object-cover shadow-sm"
                                    />
                                    <span
                                        className={`text-xs font-black tracking-tight ${
                                            g.gamecode === game.gamecode
                                                ? "text-sky-700"
                                                : "text-slate-700"
                                        }`}
                                    >
                                        {g.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
