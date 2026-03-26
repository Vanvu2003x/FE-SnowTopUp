"use client";

import { useEffect, useMemo, useState } from "react";
import {
    FiLoader,
    FiPackage,
    FiRefreshCw,
    FiSave,
    FiSearch,
    FiSlash,
} from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { changeStatus, getPackagesByGameId, updatePkg } from "@/services/toup_package.service";

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

const toNumber = (value, fallback = 0) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

const calcPrice = (originPrice, percent) =>
    Math.max(0, Math.ceil(toNumber(originPrice, 0) * (1 + toNumber(percent, 0) / 100)));

const buildDraft = (pkg) => ({
    custom_package_name: pkg?.custom_package_name || "",
    profit_percent_basic: String(pkg?.profit_percent_basic ?? 0),
    profit_percent_pro: String(pkg?.profit_percent_pro ?? 0),
    profit_percent_plus: String(pkg?.profit_percent_plus ?? 0),
});

export default function GamePackageManager({ game, games = [], onSelectGame = null }) {
    const toast = useToast();
    const [packages, setPackages] = useState([]);
    const [drafts, setDrafts] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [savingId, setSavingId] = useState("");
    const [statusUpdatingId, setStatusUpdatingId] = useState("");

    useEffect(() => {
        if (!game?.id) return;
        setSearchInput("");
        setSearchQuery("");
        setPackages([]);
        setDrafts({});
    }, [game?.id]);

    useEffect(() => {
        if (!game?.id) return;
        loadPackages();
    }, [game?.id, searchQuery]);

    async function loadPackages(showToast = false) {
        if (!game?.id) return;

        const shouldFlipLoading = packages.length === 0 && !refreshing;
        if (shouldFlipLoading) setLoading(true);
        setRefreshing(true);

        try {
            const result = await getPackagesByGameId(game.id, searchQuery);
            const nextPackages = Array.isArray(result) ? result : [];
            setPackages(nextPackages);
            setDrafts(
                nextPackages.reduce((acc, item) => {
                    acc[item.id] = buildDraft(item);
                    return acc;
                }, {})
            );

            if (showToast) {
                toast.success("Đã làm mới danh sách gói.");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể tải gói nạp.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    function updateDraft(id, key, value) {
        setDrafts((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [key]: value,
            },
        }));
    }

    async function handleSave(pkg) {
        const draft = drafts[pkg.id] || buildDraft(pkg);
        const payload = new FormData();
        payload.append("custom_package_name", draft.custom_package_name);
        payload.append("profit_percent_basic", draft.profit_percent_basic || 0);
        payload.append("profit_percent_pro", draft.profit_percent_pro || 0);
        payload.append("profit_percent_plus", draft.profit_percent_plus || 0);

        setSavingId(pkg.id);
        try {
            await updatePkg(pkg.id, payload);
            await loadPackages();
            toast.success("Đã lưu gói nạp.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể lưu gói nạp.");
        } finally {
            setSavingId("");
        }
    }

    async function handleToggleStatus(pkg) {
        const nextStatus = pkg?.status === "active" ? "inactive" : "active";
        setStatusUpdatingId(pkg.id);

        try {
            await changeStatus(pkg.id, nextStatus);
            await loadPackages();
            toast.success(nextStatus === "active" ? "Đã bật gói." : "Đã tắt gói.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể cập nhật trạng thái gói.");
        } finally {
            setStatusUpdatingId("");
        }
    }

    const stats = useMemo(() => {
        const activeCount = packages.filter((item) => item?.status === "active").length;
        return {
            total: packages.length,
            active: activeCount,
            inactive: packages.length - activeCount,
        };
    }, [packages]);

    if (!game?.id) {
        return (
            <section
                id="packages"
                className="rounded-[1.4rem] border border-[var(--app-border)] bg-white/96 p-4 shadow-[0_10px_22px_rgba(77,157,255,0.07)]"
            >
                <div className="flex flex-col gap-2">
                    <p className="page-kicker">Gói nạp</p>
                    <h2 className="section-title mt-1">Quản lý bảng giá theo game</h2>
                    <p className="text-[11px] leading-5 text-slate-500">
                        Chọn một game để đổi tên gói, set % theo giá gốc cho Basic, Pro, Plus và bật tắt gói.
                    </p>
                </div>

                <div className="mt-4 rounded-[1.2rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {games.length > 0 ? (
                            games.slice(0, 8).map((item) => (
                                <button
                                    key={item?.id || item?.gamecode}
                                    type="button"
                                    onClick={() => onSelectGame?.(item)}
                                    className="inline-flex min-h-[34px] items-center rounded-full border border-[var(--app-border)] bg-white px-3 text-[12px] font-black text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                                >
                                    {item?.name || item?.gamecode || "Game"}
                                </button>
                            ))
                        ) : (
                            <p className="text-[11px] leading-5 text-slate-500">
                                Chưa có game nào để quản lý gói. Hãy cập nhật API hoặc tạo game trước.
                            </p>
                        )}
                    </div>
                    {games.length > 8 ? (
                        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            Còn {games.length - 8} game khác trong danh sách bên trên.
                        </p>
                    ) : null}
                </div>
            </section>
        );
    }

    return (
        <section id="packages" className="rounded-[1.4rem] border border-[var(--app-border)] bg-white/96 p-4 shadow-[0_10px_22px_rgba(77,157,255,0.07)]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <p className="page-kicker">Gói nạp</p>
                    <h2 className="section-title mt-2">Bảng giá của {game?.name || game?.gamecode}</h2>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                        Đổi tên gói, set % theo giá gốc cho Basic, Pro, Plus và tắt gói mà không bị cron đè lại.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[rgba(244,249,255,0.85)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                        {stats.total} gói
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
                        {stats.active} đang bán
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                        {stats.inactive} tạm tắt
                    </span>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 md:flex-row">
                <label className="flex h-10 flex-1 items-center gap-2 rounded-full border border-[var(--app-border)] bg-[rgba(244,249,255,0.75)] px-4">
                    <FiSearch className="text-slate-400" size={14} />
                    <input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Tìm tên gói..."
                        className="w-full bg-transparent text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                </label>
                <button
                    type="button"
                    onClick={() => setSearchQuery(searchInput.trim())}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-sky-600 px-4 text-[13px] font-black text-white transition hover:bg-sky-700"
                >
                    Tìm
                </button>
                <button
                    type="button"
                    onClick={() => loadPackages(true)}
                    disabled={refreshing}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[var(--app-border)] bg-white px-4 text-[13px] font-black text-slate-700 transition hover:bg-[rgba(244,249,255,0.85)] disabled:opacity-60"
                >
                    <FiRefreshCw className={refreshing ? "animate-spin" : ""} size={14} />
                    Làm mới
                </button>
            </div>

            <div className="mt-4 space-y-3">
                {loading ? (
                    <div className="flex items-center gap-3 rounded-[1.2rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-4 py-5 text-slate-500">
                        <FiRefreshCw className="animate-spin text-sky-600" />
                        <span className="text-sm font-semibold">Đang tải gói nạp...</span>
                    </div>
                ) : packages.length > 0 ? (
                    packages.map((pkg) => {
                        const draft = drafts[pkg.id] || buildDraft(pkg);
                        const basicPrice = calcPrice(pkg.origin_price, draft.profit_percent_basic);
                        const proPrice = calcPrice(pkg.origin_price, draft.profit_percent_pro);
                        const plusPrice = calcPrice(pkg.origin_price, draft.profit_percent_plus);
                        const inactive = pkg?.status !== "active";

                        return (
                            <article
                                key={pkg.id}
                                className="rounded-[1.2rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4"
                            >
                                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_auto]">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="card-title truncate text-slate-900">
                                                {pkg?.package_name || pkg?.api_package_name || "Gói nạp"}
                                            </p>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                                                    inactive
                                                        ? "bg-slate-200 text-slate-600"
                                                        : "bg-emerald-100 text-emerald-700"
                                                }`}
                                            >
                                                {inactive ? "Tạm tắt" : "Đang bán"}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[11px] leading-5 text-slate-500">
                                            API: {pkg?.api_package_name || "Chưa có"} {" • "}
                                            Giá gốc: {formatCurrency(pkg?.origin_price || 0)}
                                        </p>
                                        <label className="mt-3 block space-y-1.5">
                                            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                                                Tên hiển thị
                                            </span>
                                            <input
                                                type="text"
                                                value={draft.custom_package_name}
                                                onChange={(event) =>
                                                    updateDraft(pkg.id, "custom_package_name", event.target.value)
                                                }
                                                placeholder={pkg?.api_package_name || "Để trống để dùng tên API"}
                                                className="h-10 w-full rounded-2xl border border-[var(--app-border)] bg-white px-4 text-[13px] font-medium text-slate-900 outline-none transition focus:border-sky-300"
                                            />
                                        </label>
                                    </div>

                                    <div className="grid gap-2 sm:grid-cols-3">
                                        {[
                                            {
                                                key: "profit_percent_basic",
                                                label: "Basic",
                                                value: draft.profit_percent_basic,
                                                price: basicPrice,
                                            },
                                            {
                                                key: "profit_percent_pro",
                                                label: "Pro",
                                                value: draft.profit_percent_pro,
                                                price: proPrice,
                                            },
                                            {
                                                key: "profit_percent_plus",
                                                label: "Plus",
                                                value: draft.profit_percent_plus,
                                                price: plusPrice,
                                            },
                                        ].map((tier) => (
                                            <div
                                                key={tier.key}
                                                className="rounded-[1rem] border border-white/70 bg-white/88 p-3"
                                            >
                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                                                    {tier.label}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[rgba(244,249,255,0.75)] px-3">
                                                    <input
                                                        type="number"
                                                        value={tier.value}
                                                        onChange={(event) =>
                                                            updateDraft(pkg.id, tier.key, event.target.value)
                                                        }
                                                        className="h-9 w-full bg-transparent text-[13px] font-black text-slate-900 outline-none"
                                                    />
                                                    <span className="text-[11px] font-black text-slate-500">%</span>
                                                </div>
                                                <p className="mt-2 text-[12px] font-black text-sky-700">
                                                    {formatCurrency(tier.price)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-start justify-start gap-2 xl:flex-col xl:items-end">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(pkg)}
                                            disabled={statusUpdatingId === pkg.id}
                                            className={`inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-black transition ${
                                                inactive
                                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                                    : "bg-slate-900 text-white hover:bg-slate-800"
                                            } disabled:opacity-60`}
                                        >
                                            {statusUpdatingId === pkg.id ? (
                                                <FiLoader className="animate-spin" size={13} />
                                            ) : inactive ? (
                                                <FiPackage size={13} />
                                            ) : (
                                                <FiSlash size={13} />
                                            )}
                                            {inactive ? "Bật gói" : "Tắt gói"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleSave(pkg)}
                                            disabled={savingId === pkg.id}
                                            className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-full bg-sky-600 px-3 text-[12px] font-black text-white transition hover:bg-sky-700 disabled:opacity-60"
                                        >
                                            {savingId === pkg.id ? (
                                                <FiLoader className="animate-spin" size={13} />
                                            ) : (
                                                <FiSave size={13} />
                                            )}
                                            Lưu
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <div className="rounded-[1.2rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-6 text-center">
                        <p className="card-title">Chưa có gói nạp</p>
                        <p className="mt-2 text-[11px] leading-5 text-slate-500">
                            Khi API đồng bộ gói cho game này, danh sách sẽ xuất hiện ở đây để bạn đổi tên, set %
                            và bật tắt.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
