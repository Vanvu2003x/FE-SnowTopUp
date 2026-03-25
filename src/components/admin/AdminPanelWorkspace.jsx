"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
    FiAlertCircle,
    FiArrowRight,
    FiBarChart2,
    FiCheckCircle,
    FiClock,
    FiCreditCard,
    FiGrid,
    FiLayers,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiTrendingUp,
    FiUsers,
} from "react-icons/fi";

import { useToast } from "@/components/ui/Toast";
import { getInfo, sendAdminOTP, updateBalance, verifyAdminOTP } from "@/services/auth.service";
import { getGames } from "@/services/games.service";
import { getAllOrder, getOrderSummary } from "@/services/order.service";
import { getRevenueOverview } from "@/services/revenue.service";
import { getBestSellers, getLeaderboard, getQuickStats } from "@/services/statistics.service";
import { getListLogsPending, getTopupStats } from "@/services/toup-wallet-logs.service";
import { getAllUser } from "@/services/user.service";

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

const statusLabelMap = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    success: "Hoàn tất",
    completed: "Hoàn tất",
    failed: "Thất bại",
    cancel: "Đã hủy",
    cancelled: "Đã hủy",
    refunded: "Hoàn tiền",
};

const statusClassMap = {
    pending: "bg-amber-50 text-amber-700 border border-amber-100",
    processing: "bg-sky-100 text-sky-700 border border-sky-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    failed: "bg-rose-50 text-rose-700 border border-rose-100",
    cancel: "bg-slate-100 text-slate-600 border border-slate-200",
    cancelled: "bg-slate-100 text-slate-600 border border-slate-200",
    refunded: "bg-violet-50 text-violet-700 border border-violet-100",
};

function asArray(payload, keys = []) {
    if (Array.isArray(payload)) return payload;

    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }

    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
}

function getNumber(payload, keys = [], fallback = 0) {
    for (const key of keys) {
        const value = payload?.[key];
        if (value !== undefined && value !== null && value !== "") {
            const numeric = Number(value);
            if (!Number.isNaN(numeric)) return numeric;
        }
    }

    return fallback;
}

function normalizeUsers(items) {
    const seen = new Map();

    items.forEach((item) => {
        const key = item?.id || item?._id || item?.email || item?.username;
        if (key && !seen.has(key)) {
            seen.set(key, item);
        }
    });

    return Array.from(seen.values());
}

function normalizeStatus(status) {
    return String(status || "pending").toLowerCase();
}

function formatDateTime(value) {
    if (!value) return "Chưa có thời gian";

    try {
        return new Date(value).toLocaleString("vi-VN");
    } catch {
        return String(value);
    }
}

function extractSeries(payload) {
    const candidates = [
        payload?.daily,
        payload?.days,
        payload?.data,
        payload?.last30Days,
        payload?.thirtyDayBreakdown,
        payload?.monthlyBreakdown,
        payload?.chart,
    ];

    for (const candidate of candidates) {
        if (!Array.isArray(candidate)) continue;

        const mapped = candidate
            .map((item, index) => {
                if (typeof item === "number") {
                    return { label: `Mốc ${index + 1}`, value: item };
                }

                const value = getNumber(item, [
                    "value",
                    "total",
                    "amount",
                    "revenue",
                    "doanh_thu",
                ]);

                if (!value) return null;

                return {
                    label:
                        item?.label ||
                        item?.date ||
                        item?.day ||
                        item?.month ||
                        `Mốc ${index + 1}`,
                    value,
                };
            })
            .filter(Boolean);

        if (mapped.length > 0) {
            return mapped.slice(-8);
        }
    }

    return [];
}

function MetricRail({ label, value, helper, accent = "sky" }) {
    const accentClasses =
        accent === "emerald"
            ? "text-emerald-700 before:bg-emerald-500"
            : accent === "amber"
              ? "text-amber-700 before:bg-amber-500"
              : "text-sky-700 before:bg-sky-500";

    return (
        <div className="relative min-w-0 pl-4 before:absolute before:left-0 before:top-1 before:h-9 before:w-1 before:rounded-full">
            <p className="meta-label text-slate-500">{label}</p>
            <p className={`mt-2 text-base font-black tracking-tight ${accentClasses}`}>{value}</p>
            <p className="copy-xs mt-1 text-slate-500">{helper}</p>
        </div>
    );
}

export default function AdminPanelWorkspace({ view = "overview" }) {
    const toast = useToast();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [lastSync, setLastSync] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [otpChecking, setOtpChecking] = useState(false);
    const [balanceUserId, setBalanceUserId] = useState("");
    const [balanceAmount, setBalanceAmount] = useState("");
    const [balanceUpdating, setBalanceUpdating] = useState(false);
    const [dashboard, setDashboard] = useState({
        orders: [],
        pendingLogs: [],
        users: [],
        games: [],
        bestSellers: [],
        leaderboard: [],
        revenue: {},
        quickStats: {},
        orderSummary: {},
        topupStats: {},
    });

    const deferredQuery = useDeferredValue(searchQuery);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function fetchUsersSnapshot() {
        const roles = ["admin", "member", "user", ""];
        const settled = await Promise.allSettled(roles.map((role) => getAllUser(role)));

        const merged = settled.flatMap((result) => {
            if (result.status !== "fulfilled") return [];
            return asArray(result.value, ["users", "rows", "items"]);
        });

        return normalizeUsers(merged);
    }

    async function loadDashboard(showToast = false) {
        setRefreshing(true);
        setError("");

        try {
            const me = await getInfo();
            const nextUser = me?.user || me || null;
            setUser(nextUser);

            if (!nextUser) {
                setDashboard({
                    orders: [],
                    pendingLogs: [],
                    users: [],
                    games: [],
                    bestSellers: [],
                    leaderboard: [],
                    revenue: {},
                    quickStats: {},
                    orderSummary: {},
                    topupStats: {},
                });
                return;
            }

            if (nextUser.role !== "admin") {
                return;
            }

            const [
                ordersResult,
                logsResult,
                usersResult,
                gamesResult,
                quickStatsResult,
                revenueResult,
                orderSummaryResult,
                topupStatsResult,
                bestSellerResult,
                leaderboardResult,
            ] = await Promise.allSettled([
                getAllOrder(1),
                getListLogsPending(1),
                fetchUsersSnapshot(),
                getGames(),
                getQuickStats(),
                getRevenueOverview(),
                getOrderSummary(),
                getTopupStats(),
                getBestSellers(),
                getLeaderboard(),
            ]);

            setDashboard({
                orders:
                    ordersResult.status === "fulfilled"
                        ? asArray(ordersResult.value, ["orders", "rows", "items"])
                        : [],
                pendingLogs:
                    logsResult.status === "fulfilled"
                        ? asArray(logsResult.value, ["logs", "walletLogs", "rows", "items"])
                        : [],
                users: usersResult.status === "fulfilled" ? usersResult.value : [],
                games:
                    gamesResult.status === "fulfilled"
                        ? asArray(gamesResult.value, ["games", "rows", "items"])
                        : [],
                bestSellers:
                    bestSellerResult.status === "fulfilled"
                        ? asArray(bestSellerResult.value, ["data", "items", "games"])
                        : [],
                leaderboard:
                    leaderboardResult.status === "fulfilled"
                        ? asArray(leaderboardResult.value, ["data", "items", "users"])
                        : [],
                revenue: revenueResult.status === "fulfilled" ? revenueResult.value || {} : {},
                quickStats:
                    quickStatsResult.status === "fulfilled" ? quickStatsResult.value || {} : {},
                orderSummary:
                    orderSummaryResult.status === "fulfilled"
                        ? orderSummaryResult.value || {}
                        : {},
                topupStats:
                    topupStatsResult.status === "fulfilled" ? topupStatsResult.value || {} : {},
            });

            setLastSync(new Date());

            if (showToast) {
                toast.success("Đã làm mới dữ liệu admin.");
            }
        } catch (loadError) {
            setError(loadError?.message || "Không thể tải admin panel.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const revenueSeries = useMemo(() => extractSeries(dashboard.revenue), [dashboard.revenue]);

    const filteredOrders = useMemo(() => {
        const query = deferredQuery.trim().toLowerCase();
        const items = [...dashboard.orders].sort((a, b) => {
            const timeA = new Date(a?.created_at || a?.createdAt || 0).getTime();
            const timeB = new Date(b?.created_at || b?.createdAt || 0).getTime();
            return timeB - timeA;
        });

        if (!query) return items.slice(0, 8);

        return items
            .filter((item) =>
                [
                    item?.id,
                    item?.status,
                    item?.game_name,
                    item?.package_name,
                    item?.email,
                    item?.user?.email,
                    item?.user?.name,
                    item?.user?.username,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(query)
            )
            .slice(0, 8);
    }, [dashboard.orders, deferredQuery]);

    const filteredUsers = useMemo(() => {
        const query = deferredQuery.trim().toLowerCase();
        const items = [...dashboard.users].sort(
            (a, b) => Number(b?.balance || 0) - Number(a?.balance || 0)
        );

        if (!query) return items.slice(0, 6);

        return items
            .filter((item) =>
                [item?.name, item?.username, item?.email, item?.role, item?.id]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(query)
            )
            .slice(0, 6);
    }, [dashboard.users, deferredQuery]);

    const filteredGames = useMemo(() => {
        const query = deferredQuery.trim().toLowerCase();
        const items = [...dashboard.games];

        if (!query) return items.slice(0, 6);

        return items
            .filter((item) =>
                [item?.name, item?.gamecode, item?.type, item?.status]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(query)
            )
            .slice(0, 6);
    }, [dashboard.games, deferredQuery]);

    const stats = useMemo(() => {
        const pendingOrders =
            getNumber(dashboard.orderSummary, ["pending", "pendingOrders", "totalPending"]) ||
            dashboard.orders.filter((item) => normalizeStatus(item?.status) === "pending").length;

        const totalUsers =
            getNumber(dashboard.quickStats, ["users", "totalUsers", "userCount"]) ||
            dashboard.users.length;

        const totalGames =
            getNumber(dashboard.quickStats, ["games", "totalGames", "gameCount"]) ||
            dashboard.games.length;

        const todayRevenue =
            getNumber(dashboard.revenue, [
                "todayRevenue",
                "dailyRevenue",
                "revenueToday",
                "today",
            ]) || getNumber(dashboard.quickStats, ["todayRevenue", "revenueToday"]);

        const totalTopup =
            getNumber(dashboard.topupStats, [
                "total",
                "tongTien",
                "tongtien",
                "amount",
            ]) || getNumber(dashboard.revenue, ["totalRevenue"]);

        return {
            pendingOrders,
            totalUsers,
            totalGames,
            todayRevenue,
            totalTopup,
            pendingLogs: dashboard.pendingLogs.length,
        };
    }, [dashboard]);

    const moduleMap = useMemo(
        () => [
            {
                id: "orders",
                href: "/admin/orders",
                label: "Đơn hàng",
                helper: "Theo dõi queue xử lý và trạng thái mới nhất.",
                value: `${stats.pendingOrders} chờ xử lý`,
                icon: FiLayers,
            },
            {
                id: "wallet",
                href: "/admin/wallet",
                label: "Nạp ví",
                helper: "Hàng đợi cộng tiền, đối soát QR và ví nội bộ.",
                value: `${stats.pendingLogs} giao dịch chờ`,
                icon: FiCreditCard,
            },
            {
                id: "users",
                href: "/admin/users",
                label: "Người dùng",
                helper: "Tài khoản, vai trò, số dư và mức hoạt động.",
                value: `${stats.totalUsers} tài khoản`,
                icon: FiUsers,
            },
            {
                id: "games",
                href: "/admin/games",
                label: "Game",
                helper: "Danh mục game, gamecode và nhịp bán hiện tại.",
                value: `${stats.totalGames} đầu game`,
                icon: FiGrid,
            },
            {
                id: "security",
                href: "/admin/security",
                label: "Security",
                helper: "OTP admin, điểm neo thao tác và điều chỉnh số dư.",
                value: otpVerified ? "OTP đã xác thực" : "Chưa xác thực OTP",
                icon: FiShield,
            },
        ],
        [otpVerified, stats]
    );

    const pageMeta = {
        overview: {
            title: "Tổng quan vận hành",
            description: "Bản đồ điều hành nhanh cho toàn bộ khu admin.",
        },
        orders: {
            title: "Quản lý đơn hàng",
            description: "Theo dõi queue xử lý, giá trị đơn và trạng thái gần nhất.",
        },
        wallet: {
            title: "Quản lý nạp ví",
            description: "Đối soát giao dịch nạp ví và hàng đợi cộng tiền.",
        },
        users: {
            title: "Quản lý người dùng",
            description: "Theo dõi tài khoản, số dư, level và mức độ hoạt động.",
        },
        games: {
            title: "Quản lý game",
            description: "Kiểm soát danh mục game, gamecode và nhịp bán hiện tại.",
        },
        security: {
            title: "Security & Ví",
            description: "OTP admin, điều chỉnh số dư và thao tác nhạy cảm.",
        },
    }[view] || {
        title: "Tổng quan vận hành",
        description: "Bản đồ điều hành nhanh cho toàn bộ khu admin.",
    };

    const handleSendOtp = async () => {
        setOtpSending(true);
        try {
            await sendAdminOTP();
            toast.success("Đã gửi OTP xác thực admin.");
        } catch (sendError) {
            toast.error(sendError?.response?.data?.message || "Không thể gửi OTP.");
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            toast.warning("Nhập OTP trước khi xác thực.");
            return;
        }

        setOtpChecking(true);
        try {
            await verifyAdminOTP(otp.trim());
            setOtpVerified(true);
            toast.success("OTP admin đã được xác thực.");
        } catch (verifyError) {
            toast.error(verifyError?.response?.data?.message || "OTP không hợp lệ.");
        } finally {
            setOtpChecking(false);
        }
    };

    const handleBalanceUpdate = async () => {
        if (!balanceUserId.trim() || !balanceAmount.trim()) {
            toast.warning("Nhập user ID và số tiền cần điều chỉnh.");
            return;
        }

        if (!otpVerified) {
            toast.warning("Xác thực OTP admin trước khi điều chỉnh số dư.");
            return;
        }

        setBalanceUpdating(true);
        try {
            await updateBalance(balanceUserId.trim(), Number(balanceAmount));
            toast.success("Đã gửi yêu cầu cập nhật số dư.");
            setBalanceAmount("");
            await loadDashboard();
        } catch (updateError) {
            toast.error(
                updateError?.response?.data?.message || "Không thể cập nhật số dư."
            );
        } finally {
            setBalanceUpdating(false);
        }
    };

    if (loading) {
        return (
            <section className="panel-strong animate-in fade-in slide-in-from-bottom-4 rounded-[2.2rem] p-8 duration-500">
                <div className="flex items-center gap-3 text-slate-600">
                    <FiRefreshCw className="animate-spin text-sky-600" />
                    <span className="text-sm font-semibold">Đang tải workspace quản trị...</span>
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="panel-strong rounded-[2.2rem] p-8 text-center">
                <p className="page-kicker">Admin</p>
                <h1 className="page-title mt-3">Bạn cần đăng nhập</h1>
                <p className="copy-sm mt-3">
                    Đăng nhập bằng tài khoản quản trị để truy cập trung tâm vận hành.
                </p>
                <Link
                    href="/auth/login"
                    className="btn-copy mt-6 inline-flex rounded-full bg-sky-600 px-6 py-3 text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700"
                >
                    Đi tới đăng nhập
                </Link>
            </section>
        );
    }

    if (user.role !== "admin") {
        return (
            <section className="panel-strong rounded-[2.2rem] p-8">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <FiShield size={20} />
                    </div>
                    <div>
                        <p className="page-kicker">Không đủ quyền</p>
                        <h1 className="page-title mt-3">Trang này chỉ dành cho quản trị viên</h1>
                        <p className="copy-sm mt-3 max-w-2xl">
                            Tài khoản hiện tại không có quyền truy cập admin panel. Bạn có thể
                            quay lại khu thành viên hoặc đăng nhập bằng tài khoản quản trị.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/account"
                                className="btn-copy rounded-full border border-[var(--app-border)] bg-white px-5 py-3 text-slate-700 transition hover:bg-[rgba(244,249,255,0.8)]"
                            >
                                Về tài khoản
                            </Link>
                            <Link
                                href="/auth/login"
                                className="btn-copy rounded-full bg-sky-600 px-5 py-3 text-white transition hover:bg-sky-700"
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="rounded-[2.4rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_20px_54px_rgba(77,157,255,0.08)] sm:p-7">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                        <span className="page-kicker">Admin Panel</span>
                        <h1 className="page-title">{pageMeta.title}</h1>
                        <p className="copy-sm max-w-3xl">{pageMeta.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => loadDashboard(true)}
                            disabled={refreshing}
                            className="btn-copy inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-white px-5 py-3 text-slate-700 transition hover:bg-[rgba(244,249,255,0.8)] disabled:opacity-60"
                        >
                            <FiRefreshCw className={refreshing ? "animate-spin" : ""} size={15} />
                            Làm mới
                        </button>
                        <Link
                            href="/account"
                            className="btn-copy inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-white shadow-lg shadow-sky-100/40 transition hover:bg-sky-700"
                        >
                            Khu thành viên
                            <FiArrowRight size={15} />
                        </Link>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {[{ href: "/admin", label: "Overview" }, ...moduleMap.map(({ href, label }) => ({ href, label }))].map(
                        (item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                                    pathname === item.href
                                        ? "bg-sky-600 text-white shadow-md shadow-sky-100/40"
                                        : "border border-[var(--app-border)] bg-white text-slate-700 hover:bg-[rgba(244,249,255,0.85)]"
                                }`}
                            >
                                {item.label}
                            </Link>
                        )
                    )}
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="grid gap-4 rounded-[2rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.85)] p-4 sm:grid-cols-2 2xl:grid-cols-4">
                        {moduleMap.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className="group rounded-[1.4rem] bg-white/82 p-4 transition hover:-translate-y-0.5 hover:bg-white"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="card-title text-slate-900">{item.label}</p>
                                            <p className="copy-xs mt-2 text-slate-500">{item.helper}</p>
                                            <p className="mt-3 text-sm font-black text-sky-700">
                                                {item.value}
                                            </p>
                                        </div>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(244,249,255,0.95)] text-sky-600">
                                            <Icon size={18} />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="rounded-[2rem] border border-[var(--app-border)] bg-white/85 p-4">
                        <div className="flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.82)] px-4 py-3">
                            <FiSearch className="text-slate-400" size={16} />
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Lọc nhanh theo đơn, user, game..."
                                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                            />
                        </div>

                        <div className="mt-4 space-y-3">
                            <MetricRail
                                label="Doanh thu hôm nay"
                                value={formatCurrency(stats.todayRevenue)}
                                helper="Đọc từ revenue overview hoặc quick stats."
                            />
                            <MetricRail
                                label="Tổng nạp ví"
                                value={formatCurrency(stats.totalTopup)}
                                helper="Theo dõi lưu lượng nạp vào ví nội bộ."
                                accent="emerald"
                            />
                            <MetricRail
                                label="Cập nhật gần nhất"
                                value={lastSync ? formatDateTime(lastSync) : "Chưa đồng bộ"}
                                helper={
                                    error
                                        ? "Một vài nguồn dữ liệu đang lỗi, trang vẫn hiển thị dữ liệu còn lại."
                                        : "Snapshot hiện tại đang đồng bộ với API."
                                }
                                accent={error ? "amber" : "sky"}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_360px]">
                <div className="space-y-6">
                    {view === "overview" && (
                        <section className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="page-kicker">Điều hướng</p>
                                    <h2 className="section-title mt-2">Các cụm quản trị đã được tách route</h2>
                                </div>
                                <span className="meta-label rounded-full bg-[rgba(244,249,255,0.9)] px-3 py-2 text-slate-600">
                                    {moduleMap.length} module
                                </span>
                            </div>
                            <div className="mt-6 grid gap-3 md:grid-cols-2">
                                {moduleMap.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4 transition hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        <p className="card-title text-slate-900">{item.label}</p>
                                        <p className="copy-xs mt-2 text-slate-500">{item.helper}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-sm font-black text-sky-700">{item.value}</span>
                                            <FiArrowRight size={14} className="text-slate-400" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {view === "security" && (
                        <section className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="page-kicker">Security</p>
                                    <h2 className="section-title mt-2">Khu thao tác nhạy cảm</h2>
                                </div>
                                <span className="meta-label rounded-full bg-[rgba(244,249,255,0.9)] px-3 py-2 text-slate-600">
                                    OTP + Ví
                                </span>
                            </div>
                            <div className="mt-6 grid gap-3 md:grid-cols-3">
                                {[
                                    ["OTP admin", otpVerified ? "Đã xác thực" : "Chưa xác thực", "Xác minh phiên thao tác trước khi đổi số dư."],
                                    ["Điều chỉnh ví", "Theo user ID", "Nhập số dương để cộng và số âm để trừ."],
                                    ["Điểm neo", "Điều hướng nhanh", "Đi tới orders, wallet, users và games chỉ bằng một chạm."],
                                ].map(([label, value, helper]) => (
                                    <div
                                        key={label}
                                        className="rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4"
                                    >
                                        <p className="card-title text-slate-900">{label}</p>
                                        <p className="mt-3 text-sm font-black text-sky-700">{value}</p>
                                        <p className="copy-xs mt-2 text-slate-500">{helper}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {view === "orders" && (
                    <section
                        id="orders"
                        className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="page-kicker">Đơn hàng</p>
                                <h2 className="section-title mt-2">Queue xử lý gần nhất</h2>
                            </div>
                            <span className="meta-label rounded-full bg-[rgba(244,249,255,0.9)] px-3 py-2 text-slate-600">
                                {filteredOrders.length} mục hiển thị
                            </span>
                        </div>

                        <div className="mt-6 space-y-3">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => {
                                    const statusKey = normalizeStatus(order?.status);
                                    return (
                                        <div
                                            key={order?.id || `${order?.user_id}-${order?.created_at}`}
                                            className="grid gap-4 rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.7)] p-4 lg:grid-cols-[minmax(0,1fr)_150px_140px]"
                                        >
                                            <div className="min-w-0">
                                                <p className="card-title truncate text-slate-900">
                                                    {order?.game_name ||
                                                        order?.package_name ||
                                                        `Đơn #${order?.id}`}
                                                </p>
                                                <p className="copy-xs mt-2 text-slate-500">
                                                    {order?.user?.name ||
                                                        order?.user?.username ||
                                                        order?.email ||
                                                        "Khách hàng chưa rõ"}
                                                    {" • "}
                                                    {formatDateTime(order?.created_at || order?.createdAt)}
                                                </p>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="meta-label text-slate-500">Giá trị</p>
                                                <p className="mt-2 text-sm font-black text-sky-700">
                                                    {formatCurrency(
                                                        order?.amount ||
                                                            order?.price ||
                                                            order?.total ||
                                                            0
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-start justify-between gap-3 lg:justify-end">
                                                <span
                                                    className={`meta-label rounded-full px-3 py-2 ${statusClassMap[statusKey] || "bg-slate-100 text-slate-600 border border-slate-200"}`}
                                                >
                                                    {statusLabelMap[statusKey] || order?.status || "Chờ xử lý"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="rounded-[1.6rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.55)] p-6 text-center">
                                    <p className="card-title">Chưa có dữ liệu đơn hàng phù hợp</p>
                                    <p className="copy-xs mt-2 text-slate-500">
                                        Hãy thử đổi từ khóa lọc hoặc làm mới dashboard.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                    )}

                    {view === "wallet" && (
                    <section
                        id="wallet"
                        className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="page-kicker">Ví & Topup</p>
                                <h2 className="section-title mt-2">Giao dịch chờ đối soát</h2>
                            </div>
                            <div className="rounded-full bg-amber-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-amber-700">
                                {dashboard.pendingLogs.length} pending
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3">
                            {dashboard.pendingLogs.slice(0, 6).map((log) => (
                                <div
                                    key={log?.id || `${log?.user_id}-${log?.created_at}`}
                                    className="grid gap-3 rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4 md:grid-cols-[minmax(0,1fr)_160px]"
                                >
                                    <div className="min-w-0">
                                        <p className="card-title truncate text-slate-900">
                                            {log?.user?.name ||
                                                log?.username ||
                                                log?.email ||
                                                `User #${log?.user_id || "?"}`}
                                        </p>
                                        <p className="copy-xs mt-2 text-slate-500">
                                            {log?.note || log?.description || "Chờ admin xác nhận giao dịch nạp ví."}
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-sm font-black text-emerald-700">
                                            {formatCurrency(log?.amount || log?.money || 0)}
                                        </p>
                                        <p className="copy-xs mt-2 text-slate-500">
                                            {formatDateTime(log?.created_at || log?.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {dashboard.pendingLogs.length === 0 && (
                                <div className="rounded-[1.6rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.55)] p-6 text-center">
                                    <p className="card-title">Không có giao dịch nạp ví đang chờ</p>
                                    <p className="copy-xs mt-2 text-slate-500">
                                        Hàng đợi topup đang sạch. Đây là điểm rất tốt cho vận hành.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                    )}

                    {view === "users" && (
                    <section
                        id="users"
                        className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="page-kicker">Người dùng</p>
                                <h2 className="section-title mt-2">Tài khoản cần theo dõi</h2>
                            </div>
                            <span className="meta-label rounded-full bg-[rgba(244,249,255,0.9)] px-3 py-2 text-slate-600">
                                Top số dư / hoạt động
                            </span>
                        </div>

                        <div className="mt-6 space-y-3">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((member) => (
                                    <div
                                        key={member?.id || member?.email || member?.username}
                                        className="grid gap-4 rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4 md:grid-cols-[minmax(0,1fr)_140px_120px]"
                                    >
                                        <div className="min-w-0">
                                            <p className="card-title truncate text-slate-900">
                                                {member?.name || member?.username || "Tài khoản chưa đặt tên"}
                                            </p>
                                            <p className="copy-xs mt-2 text-slate-500">
                                                {member?.email || "Chưa có email"} {" • "}
                                                {member?.role === "admin" ? "Quản trị viên" : "Thành viên"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="meta-label text-slate-500">Số dư</p>
                                            <p className="mt-2 text-sm font-black text-sky-700">
                                                {formatCurrency(member?.balance || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="meta-label text-slate-500">Level</p>
                                            <p className="mt-2 text-sm font-black text-slate-900">
                                                {member?.level || 1}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-[1.6rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.55)] p-6 text-center">
                                    <p className="card-title">Chưa tải được snapshot người dùng</p>
                                    <p className="copy-xs mt-2 text-slate-500">
                                        API user có thể đang trả dữ liệu theo role riêng. Trang vẫn giữ phần còn lại hoạt động.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                    )}

                    {view === "games" && (
                    <section
                        id="games"
                        className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-6 shadow-[0_18px_42px_rgba(77,157,255,0.07)]"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="page-kicker">Game</p>
                                <h2 className="section-title mt-2">Danh mục vận hành</h2>
                            </div>
                            <span className="meta-label rounded-full bg-[rgba(244,249,255,0.9)] px-3 py-2 text-slate-600">
                                {dashboard.games.length} game
                            </span>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {filteredGames.length > 0 ? (
                                filteredGames.map((game) => (
                                    <div
                                        key={game?.id || game?.gamecode}
                                        className="rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            {game?.thumbnail ? (
                                                <img
                                                    src={game.thumbnail}
                                                    alt={game?.name || game?.gamecode}
                                                    className="h-12 w-12 rounded-2xl object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600">
                                                    <FiGrid size={18} />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="card-title truncate text-slate-900">
                                                    {game?.name || "Game chưa đặt tên"}
                                                </p>
                                                <p className="copy-xs mt-2 truncate text-slate-500">
                                                    {game?.gamecode || "Chưa có mã game"} {" • "}
                                                    {game?.type || "topup"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-[1.6rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.55)] p-6 text-center sm:col-span-2">
                                    <p className="card-title">Chưa có dữ liệu game phù hợp</p>
                                    <p className="copy-xs mt-2 text-slate-500">
                                        Danh mục game sẽ xuất hiện ở đây khi API trả dữ liệu.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                    )}
                </div>
                <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
                    <section className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-5 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="page-kicker">Overview</p>
                                <h2 className="section-title mt-2">Chỉ số trọng yếu</h2>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(244,249,255,0.9)] text-sky-600">
                                <FiBarChart2 size={18} />
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            <MetricRail
                                label="Doanh thu hôm nay"
                                value={formatCurrency(stats.todayRevenue)}
                                helper="Tốc độ doanh thu trong ngày."
                            />
                            <MetricRail
                                label="Đơn chờ xử lý"
                                value={`${stats.pendingOrders} đơn`}
                                helper="Ưu tiên xử lý để không nghẽn luồng nạp."
                                accent="amber"
                            />
                            <MetricRail
                                label="Giao dịch chờ duyệt"
                                value={`${stats.pendingLogs} giao dịch`}
                                helper="Dành cho đội ví/topup kiểm tra."
                            />
                        </div>

                        {revenueSeries.length > 0 && (
                            <div className="mt-6 rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4">
                                <p className="meta-label text-slate-500">Nhịp doanh thu</p>
                                <div className="mt-4 flex h-28 items-end gap-2">
                                    {revenueSeries.map((point) => {
                                        const maxValue = Math.max(
                                            ...revenueSeries.map((item) => item.value),
                                            1
                                        );
                                        return (
                                            <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                                                <div
                                                    className="w-full rounded-full bg-gradient-to-t from-sky-600 to-sky-300"
                                                    style={{
                                                        height: `${Math.max(
                                                            18,
                                                            (point.value / maxValue) * 100
                                                        )}%`,
                                                    }}
                                                />
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    {String(point.label).slice(0, 5)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-5 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="page-kicker">Tăng trưởng</p>
                                <h2 className="section-title mt-2">Nguồn lực bán tốt</h2>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(244,249,255,0.9)] text-sky-600">
                                <FiTrendingUp size={18} />
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div className="rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4">
                                <p className="meta-label text-slate-500">Best sellers</p>
                                <div className="mt-3 space-y-3">
                                    {dashboard.bestSellers.slice(0, 4).map((item, index) => (
                                        <div key={item?.id || item?.name || index} className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="card-title truncate text-slate-900">
                                                    {item?.name || item?.game_name || `Top game ${index + 1}`}
                                                </p>
                                                <p className="copy-xs mt-1 text-slate-500">
                                                    {item?.gamecode || item?.type || "Đầu game bán tốt"}
                                                </p>
                                            </div>
                                            <span className="text-sm font-black text-sky-700">
                                                {item?.sales || item?.count || item?.total || index + 1}
                                            </span>
                                        </div>
                                    ))}
                                    {dashboard.bestSellers.length === 0 && (
                                        <p className="copy-xs text-slate-500">
                                            Chưa có dữ liệu best sellers từ API thống kê.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4">
                                <p className="meta-label text-slate-500">Leaderboard</p>
                                <div className="mt-3 space-y-3">
                                    {dashboard.leaderboard.slice(0, 4).map((item, index) => (
                                        <div key={item?.id || item?.name || item?.email || index} className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="card-title truncate text-slate-900">
                                                    {item?.name || item?.username || item?.email || `User ${index + 1}`}
                                                </p>
                                                <p className="copy-xs mt-1 text-slate-500">
                                                    {item?.email || item?.role || "Tài khoản nổi bật"}
                                                </p>
                                            </div>
                                            <span className="text-sm font-black text-emerald-700">
                                                {formatCurrency(
                                                    item?.revenue || item?.amount || item?.total || 0
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                    {dashboard.leaderboard.length === 0 && (
                                        <p className="copy-xs text-slate-500">
                                            Chưa có dữ liệu leaderboard từ API thống kê.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="security"
                        className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-5 shadow-[0_18px_42px_rgba(77,157,255,0.07)]"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="page-kicker">Security</p>
                                <h2 className="section-title mt-2">Điều khiển nhanh</h2>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(244,249,255,0.9)] text-sky-600">
                                <FiShield size={18} />
                            </div>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div className="rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4">
                                <p className="card-title">Xác thực OTP admin</p>
                                <p className="copy-xs mt-2 text-slate-500">
                                    Gửi OTP để xác thực thao tác nhạy cảm trước khi điều chỉnh số dư.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={otpSending}
                                    className="btn-copy mt-4 inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-white transition hover:bg-sky-700 disabled:opacity-60"
                                >
                                    {otpSending ? "Đang gửi OTP..." : "Gửi OTP xác thực"}
                                </button>
                                <div className="mt-3 flex gap-2">
                                    <input
                                        value={otp}
                                        onChange={(event) => setOtp(event.target.value)}
                                        placeholder="Nhập OTP"
                                        className="h-11 flex-1 rounded-xl border border-[var(--app-border)] bg-white px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={otpChecking}
                                        className="btn-copy rounded-xl border border-[var(--app-border)] bg-white px-4 text-slate-700 transition hover:bg-[rgba(244,249,255,0.8)] disabled:opacity-60"
                                    >
                                        {otpChecking ? "..." : "Xác thực"}
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                                    {otpVerified ? (
                                        <>
                                            <FiCheckCircle className="text-emerald-600" />
                                            OTP hợp lệ, có thể thao tác số dư.
                                        </>
                                    ) : (
                                        <>
                                            <FiClock className="text-amber-600" />
                                            Chưa xác thực OTP trong phiên hiện tại.
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-[1.6rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4">
                                <p className="card-title">Điều chỉnh số dư</p>
                                <p className="copy-xs mt-2 text-slate-500">
                                    Nhập user ID và số tiền có dấu. Ví dụ `50000` để cộng, `-50000` để trừ.
                                </p>
                                <div className="mt-4 grid gap-3">
                                    <input
                                        value={balanceUserId}
                                        onChange={(event) => setBalanceUserId(event.target.value)}
                                        placeholder="User ID"
                                        className="h-11 rounded-xl border border-[var(--app-border)] bg-white px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                    <input
                                        value={balanceAmount}
                                        onChange={(event) => setBalanceAmount(event.target.value)}
                                        placeholder="Số tiền điều chỉnh"
                                        className="h-11 rounded-xl border border-[var(--app-border)] bg-white px-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleBalanceUpdate}
                                        disabled={balanceUpdating}
                                        className="btn-copy rounded-xl bg-sky-600 px-4 py-3 text-white transition hover:bg-sky-700 disabled:opacity-60"
                                    >
                                        {balanceUpdating ? "Đang cập nhật..." : "Cập nhật số dư"}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-[1.6rem] border border-dashed border-[var(--app-border)] bg-white/72 p-4">
                                <p className="meta-label text-slate-500">Điểm neo nhanh</p>
                                <div className="mt-3 space-y-2">
                                    {[
                                        ["/admin/orders", "Đơn hàng"],
                                        ["/admin/wallet", "Nạp ví"],
                                        ["/admin/users", "Người dùng"],
                                        ["/admin/games", "Game"],
                                        ["/admin/security", "Security"],
                                    ].map(([href, label]) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[rgba(244,249,255,0.92)]"
                                        >
                                            {label}
                                            <FiArrowRight size={14} className="text-slate-400" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {error && (
                        <section className="rounded-[2rem] border border-amber-100 bg-amber-50/80 p-5 text-amber-900">
                            <div className="flex items-start gap-3">
                                <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
                                <div>
                                    <p className="card-title">Một số dữ liệu chưa tải được</p>
                                    <p className="copy-xs mt-2 text-amber-800">{error}</p>
                                </div>
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
}
