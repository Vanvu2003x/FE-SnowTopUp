"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    FiChevronLeft,
    FiChevronRight,
    FiCreditCard,
    FiLock,
    FiLoader,
    FiRefreshCw,
    FiTrendingUp,
    FiUnlock,
    FiUsers,
} from "react-icons/fi";

import AdminWorkspaceShell from "@/components/admin/AdminWorkspaceShell";
import { useToast } from "@/components/ui/Toast";
import { getRevenueDashboard } from "@/services/revenue.service";
import {
    changeUserBalance,
    getAllUserByKeyword,
    toggleUserLock,
    updateUserLevel,
} from "@/services/user.service";

const PAGE_SIZE = 10;

const roleTabs = [
    { value: "", label: "Tất cả" },
    { value: "user", label: "Khách" },
    { value: "member", label: "Member" },
    { value: "admin", label: "Admin" },
];

const formatCurrency = (value) =>
    `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} VND`;

function formatDate(value) {
    if (!value) return "Chưa có";
    try {
        return new Date(value).toLocaleString("vi-VN");
    } catch {
        return String(value);
    }
}

function asArray(payload, keys = []) {
    if (Array.isArray(payload)) return payload;

    for (const key of keys) {
        if (Array.isArray(payload?.[key])) return payload[key];
    }

    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
}

export default function UserOperationsWorkspace() {
    const toast = useToast();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
    });
    const [summary, setSummary] = useState({});
    const [revenue, setRevenue] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [role, setRole] = useState("");
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [balanceType, setBalanceType] = useState("credit");
    const [balanceAmount, setBalanceAmount] = useState("");
    const [balanceDescription, setBalanceDescription] = useState("");
    const [actionLoading, setActionLoading] = useState("");
    const [levelValue, setLevelValue] = useState(1);

    const selectedUser = useMemo(
        () => users.find((item) => item?.id === selectedUserId) || null,
        [selectedUserId, users]
    );

    useEffect(() => {
        loadWorkspace();
    }, [page, role, searchQuery]);

    useEffect(() => {
        if (!users.length) {
            setSelectedUserId("");
            return;
        }

        const stillExists = users.some((item) => item?.id === selectedUserId);
        if (!stillExists) {
            setSelectedUserId(users[0]?.id || "");
        }
    }, [selectedUserId, users]);

    useEffect(() => {
        if (!selectedUser) return;
        setLevelValue(Number(selectedUser?.level || 1));
        setBalanceAmount("");
        setBalanceDescription("");
        setBalanceType("credit");
    }, [selectedUser]);

    async function loadWorkspace(showToast = false) {
        const shouldFlipLoading = users.length === 0 && !refreshing;
        if (shouldFlipLoading) setLoading(true);
        setRefreshing(true);

        try {
            const [usersResult, revenueResult] = await Promise.all([
                getAllUserByKeyword(role, searchQuery, page, PAGE_SIZE),
                getRevenueDashboard(),
            ]);

            const nextUsers = asArray(usersResult, ["users", "rows", "items"]);
            setUsers(nextUsers);
            setPagination(
                usersResult?.pagination || {
                    page,
                    pageSize: PAGE_SIZE,
                    totalItems: nextUsers.length,
                    totalPages: 1,
                }
            );
            setSummary(usersResult?.summary || {});
            setRevenue(revenueResult?.data || revenueResult || {});

            if (showToast) {
                toast.success("Đã làm mới quản lý người dùng.");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể tải dữ liệu user.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    async function handleBalanceSubmit(event) {
        event.preventDefault();
        if (!selectedUser?.id) {
            toast.warning("Chọn người dùng trước khi chỉnh số dư.");
            return;
        }

        const amount = Number(balanceAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.warning("Nhập số tiền hợp lệ.");
            return;
        }

        setActionLoading("balance");
        try {
            await changeUserBalance(
                selectedUser.id,
                amount,
                balanceType,
                balanceDescription.trim()
            );
            await loadWorkspace();
            toast.success(balanceType === "credit" ? "Đã cộng số dư." : "Đã trừ số dư.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể cập nhật số dư.");
        } finally {
            setActionLoading("");
        }
    }

    async function handleToggleLock() {
        if (!selectedUser?.id) return;
        setActionLoading("lock");
        try {
            const result = await toggleUserLock(selectedUser.id);
            await loadWorkspace();
            toast.success(result?.message || "Đã cập nhật trạng thái tài khoản.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể khóa/mở khóa.");
        } finally {
            setActionLoading("");
        }
    }

    async function handleLevelSave() {
        if (!selectedUser?.id) return;
        setActionLoading("level");
        try {
            const result = await updateUserLevel(selectedUser.id, levelValue);
            await loadWorkspace();
            toast.success(result?.message || "Đã cập nhật level.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể cập nhật level.");
        } finally {
            setActionLoading("");
        }
    }

    const pageNumbers = useMemo(() => {
        const totalPages = Math.max(1, Number(pagination?.totalPages || 1));
        const start = Math.max(1, page - 1);
        const end = Math.min(totalPages, start + 2);
        const nextPages = [];

        for (let current = start; current <= end; current += 1) {
            nextPages.push(current);
        }

        return nextPages;
    }, [page, pagination?.totalPages]);

    const metricItems = [
        {
            label: "Tổng tài khoản",
            value: summary?.totalUsers || pagination?.totalItems || users.length,
            tone: "text-slate-950",
            helper: "Tổng user theo bộ lọc hiện tại.",
        },
        {
            label: "Tài khoản khóa",
            value: summary?.lockedUsers || 0,
            tone: "text-amber-700",
            helper: "Những tài khoản đang bị chặn đăng nhập hoặc giao dịch.",
        },
        {
            label: "VIP / Plus",
            value: summary?.vipUsers || 0,
            tone: "text-emerald-700",
            helper: "Số user đang ở level cao nhất.",
        },
        {
            label: "Tổng số dư khách",
            value: formatCurrency(summary?.totalBalance || revenue?.total_user_balance || 0),
            tone: "text-sky-700",
            helper: "Số dư hiện có trên toàn bộ ví khách hàng.",
        },
        {
            label: "Doanh thu hôm nay",
            value: formatCurrency(revenue?.today?.revenue || 0),
            tone: "text-slate-950",
            helper: "Dòng tiền nạp ví ghi nhận trong ngày.",
        },
        {
            label: "Doanh thu tháng",
            value: formatCurrency(revenue?.this_month?.revenue || 0),
            tone: "text-sky-700",
            helper: "Snapshot doanh thu tháng hiện tại.",
        },
        {
            label: "Lợi nhuận tháng",
            value: formatCurrency(revenue?.this_month?.profit || 0),
            tone: "text-emerald-700",
            helper: "Tổng profit từ đơn thành công trong tháng.",
        },
        {
            label: "Đơn thành công",
            value: summary?.totalSuccessfulOrders || 0,
            tone: "text-slate-950",
            helper: "Tổng đơn hoàn tất trong hệ thống user hiện tại.",
        },
    ];

    return (
        <AdminWorkspaceShell
            title="Quản lý người dùng"
            description="Theo dõi số dư khách, phân trang danh sách user, cộng trừ số dư trực tiếp và xem snapshot doanh thu ngay trong SnowTopup."
            onRefresh={() => loadWorkspace(true)}
            refreshing={refreshing}
        >
            <section className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                {metricItems.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-[1.15rem] border border-[var(--app-border)] bg-white/96 p-3 shadow-[0_10px_22px_rgba(77,157,255,0.07)]"
                    >
                        <p className="meta-label text-slate-500">{item.label}</p>
                        <p className={`mt-1.5 text-[1.05rem] font-black tracking-tight ${item.tone}`}>{item.value}</p>
                        <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{item.helper}</p>
                    </div>
                ))}
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_320px]">
                <section className="space-y-4">
                    <section className="rounded-[1.4rem] border border-[var(--app-border)] bg-white/96 p-4 shadow-[0_10px_22px_rgba(77,157,255,0.07)]">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <p className="page-kicker">Overview</p>
                                <h2 className="section-title mt-2">Snapshot doanh thu và user</h2>
                                <p className="copy-xs mt-2 max-w-2xl text-slate-500">
                                    Dùng cụm này để kiểm tra nhanh doanh thu, lợi nhuận và tổng số dư user trước
                                    khi thao tác cộng trừ ví.
                                </p>
                            </div>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-[rgba(244,249,255,0.85)]"
                            >
                                <FiTrendingUp size={15} />
                                Mở overview admin
                            </Link>
                        </div>
                    </section>

                    <section className="rounded-[1.4rem] border border-[var(--app-border)] bg-white/96 p-4 shadow-[0_10px_22px_rgba(77,157,255,0.07)]">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <p className="page-kicker">Danh sách người dùng</p>
                                <h2 className="section-title mt-2">Tìm kiếm và phân trang</h2>
                            </div>
                            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                                {pagination?.totalItems || users.length} user
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {roleTabs.map((tab) => {
                                const active = role === tab.value;
                                return (
                                    <button
                                        key={tab.value || "all"}
                                        type="button"
                                        onClick={() => {
                                            setRole(tab.value);
                                            setPage(1);
                                        }}
                                className={`rounded-full px-3 py-1.5 text-[12px] font-black transition ${
                                            active
                                                ? "bg-sky-600 text-white"
                                                : "border border-[var(--app-border)] bg-white text-slate-700 hover:bg-[rgba(244,249,255,0.85)]"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                setPage(1);
                                setSearchQuery(searchInput.trim());
                            }}
                            className="mt-3 flex flex-col gap-2.5 md:flex-row"
                        >
                            <input
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Tìm theo tên, email hoặc ID..."
                                className="h-10 flex-1 rounded-full border border-[var(--app-border)] bg-[rgba(244,249,255,0.75)] px-4 text-[13px] font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                            />
                            <button
                                type="submit"
                                className="inline-flex h-10 items-center justify-center rounded-full bg-sky-600 px-4 text-[13px] font-black text-white transition hover:bg-sky-700"
                            >
                                Tìm kiếm
                            </button>
                        </form>

                        <div className="mt-4 overflow-hidden rounded-[1.35rem] border border-[var(--app-border)] bg-white">
                            <div className="hidden grid-cols-[minmax(0,1.2fr)_140px_120px_120px] gap-4 border-b border-[var(--app-border)] bg-[rgba(244,249,255,0.8)] px-5 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 md:grid">
                                <span>Người dùng</span>
                                <span>Số dư</span>
                                <span>Level</span>
                                <span>Trạng thái</span>
                            </div>

                            <div className="divide-y divide-[var(--app-border)]">
                                {loading ? (
                                    <div className="flex items-center gap-3 px-5 py-8 text-slate-500">
                                        <FiRefreshCw className="animate-spin text-sky-600" />
                                        <span className="text-sm font-semibold">Đang tải danh sách user...</span>
                                    </div>
                                ) : users.length > 0 ? (
                                    users.map((member) => {
                                        const selected = member?.id === selectedUserId;
                                        const locked = member?.status === "banned";

                                        return (
                                            <button
                                                key={member?.id}
                                                type="button"
                                                onClick={() => setSelectedUserId(member?.id)}
                                                className={`grid w-full gap-4 px-5 py-4 text-left transition md:grid-cols-[minmax(0,1.2fr)_140px_120px_120px] md:items-center ${
                                                    selected
                                                        ? "bg-[rgba(239,247,255,0.85)]"
                                                        : "hover:bg-[rgba(244,249,255,0.78)]"
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <p className="card-title truncate text-slate-900">
                                                        {member?.name || member?.email || "Tài khoản chưa đặt tên"}
                                                    </p>
                                                    <p className="copy-xs mt-2 text-slate-500">
                                                        {member?.email || "Chưa có email"} {" • "}
                                                        {member?.role || "user"}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-black text-sky-700">
                                                    {formatCurrency(member?.balance || 0)}
                                                </div>
                                                <div className="text-sm font-black text-slate-900">
                                                    Level {member?.level || 1}
                                                </div>
                                                <div>
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] ${
                                                            locked
                                                                ? "bg-amber-100 text-amber-700"
                                                                : "bg-emerald-100 text-emerald-700"
                                                        }`}
                                                    >
                                                        {locked ? "Đang khóa" : "Hoạt động"}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="px-5 py-8 text-center">
                                        <p className="card-title">Không có user phù hợp</p>
                                        <p className="copy-xs mt-2 text-slate-500">
                                            Hãy đổi bộ lọc hoặc từ khóa tìm kiếm.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="copy-xs text-slate-500">
                                Trang {pagination?.page || 1} / {pagination?.totalPages || 1}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    disabled={page <= 1}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-slate-700 transition hover:bg-[rgba(244,249,255,0.85)] disabled:opacity-50"
                                >
                                    <FiChevronLeft size={16} />
                                </button>
                                {pageNumbers.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setPage(value)}
                                        className={`inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-black transition ${
                                            value === page
                                                ? "bg-sky-600 text-white"
                                                : "border border-[var(--app-border)] bg-white text-slate-700 hover:bg-[rgba(244,249,255,0.85)]"
                                        }`}
                                    >
                                        {value}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPage((prev) =>
                                            Math.min(Number(pagination?.totalPages || 1), prev + 1)
                                        )
                                    }
                                    disabled={page >= Number(pagination?.totalPages || 1)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-white text-slate-700 transition hover:bg-[rgba(244,249,255,0.85)] disabled:opacity-50"
                                >
                                    <FiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </section>
                </section>

                <section className="rounded-[1.4rem] border border-[var(--app-border)] bg-white/96 p-4 shadow-[0_10px_22px_rgba(77,157,255,0.07)] xl:sticky xl:top-4 xl:self-start">
                    {selectedUser ? (
                        <div className="space-y-6">
                            <div>
                                <p className="page-kicker">Chi tiết user</p>
                                <h2 className="section-title mt-2">
                                    {selectedUser?.name || selectedUser?.email || "Người dùng"}
                                </h2>
                                <p className="copy-xs mt-2 text-slate-500">
                                    {selectedUser?.email || "Chưa có email"} {" • "} ID: {selectedUser?.id}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[1.3rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.7)] p-3.5">
                                    <p className="meta-label text-slate-500">Số dư hiện tại</p>
                                    <p className="mt-2 text-xl font-black text-sky-700">
                                        {formatCurrency(selectedUser?.balance || 0)}
                                    </p>
                                </div>
                                <div className="rounded-[1.3rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.7)] p-3.5">
                                    <p className="meta-label text-slate-500">Tổng đã nạp</p>
                                    <p className="mt-2 text-xl font-black text-emerald-700">
                                        {formatCurrency(selectedUser?.tong_amount || 0)}
                                    </p>
                                </div>
                                <div className="rounded-[1.3rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.7)] p-3.5">
                                    <p className="meta-label text-slate-500">Đơn thành công</p>
                                    <p className="mt-2 text-xl font-black text-slate-900">
                                        {selectedUser?.so_don_order || 0}
                                    </p>
                                </div>
                                <div className="rounded-[1.3rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.7)] p-3.5">
                                    <p className="meta-label text-slate-500">Ngày tham gia</p>
                                    <p className="mt-2 text-sm font-black text-slate-900">
                                        {formatDate(selectedUser?.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[1.35rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-3.5">
                                <p className="meta-label text-slate-500">Quyền và trạng thái</p>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <span className="rounded-full bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-700">
                                        {selectedUser?.role || "user"}
                                    </span>
                                    <span
                                        className={`rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] ${
                                            selectedUser?.status === "banned"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-emerald-100 text-emerald-700"
                                        }`}
                                    >
                                        {selectedUser?.status === "banned" ? "Đang khóa" : "Hoạt động"}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-[1.35rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-3.5">
                                <p className="meta-label text-slate-500">Level tài khoản</p>
                                <div className="mt-4 flex gap-3">
                                    <select
                                        value={levelValue}
                                        onChange={(event) => setLevelValue(Number(event.target.value))}
                                        className="h-11 flex-1 rounded-full border border-[var(--app-border)] bg-white px-4 text-sm font-black text-slate-900 outline-none"
                                    >
                                        <option value={1}>Level 1 - Basic</option>
                                        <option value={2}>Level 2 - Pro</option>
                                        <option value={3}>Level 3 - Plus</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleLevelSave}
                                        disabled={actionLoading === "level"}
                                        className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60"
                                    >
                                        {actionLoading === "level" ? <FiLoader className="animate-spin" /> : "Lưu"}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleToggleLock}
                                disabled={actionLoading === "lock" || selectedUser?.role === "admin"}
                                className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-black transition ${
                                    selectedUser?.status === "banned"
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                        : "bg-amber-500 text-white hover:bg-amber-600"
                                } disabled:opacity-60`}
                            >
                                {actionLoading === "lock" ? (
                                    <FiLoader className="animate-spin" />
                                ) : selectedUser?.status === "banned" ? (
                                    <FiUnlock size={16} />
                                ) : (
                                    <FiLock size={16} />
                                )}
                                {selectedUser?.status === "banned" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                            </button>

                            <form
                                onSubmit={handleBalanceSubmit}
                                className="rounded-[1.45rem] border border-[var(--app-border)] bg-white p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(239,247,255,0.96)] text-sky-600">
                                        <FiCreditCard size={18} />
                                    </div>
                                    <div>
                                        <p className="card-title text-slate-900">Cộng / trừ số dư</p>
                                        <p className="copy-xs mt-1 text-slate-500">
                                            Có lưu description vào lịch sử điều chỉnh số dư.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {[
                                        { value: "credit", label: "Cộng tiền" },
                                        { value: "debit", label: "Trừ tiền" },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => setBalanceType(item.value)}
                                            className={`rounded-full px-3.5 py-2 text-[13px] font-black transition ${
                                                balanceType === item.value
                                                    ? item.value === "credit"
                                                        ? "bg-emerald-600 text-white"
                                                        : "bg-rose-600 text-white"
                                                    : "border border-[var(--app-border)] bg-white text-slate-700 hover:bg-[rgba(244,249,255,0.85)]"
                                            }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>

                                <label className="mt-4 block space-y-2">
                                    <span className="meta-label text-slate-500">Số tiền</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={balanceAmount}
                                        onChange={(event) => setBalanceAmount(event.target.value)}
                                        placeholder="100000"
                                        className="h-11 w-full rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                                    />
                                </label>

                                <label className="mt-4 block space-y-2">
                                    <span className="meta-label text-slate-500">Lý do</span>
                                    <textarea
                                        value={balanceDescription}
                                        onChange={(event) => setBalanceDescription(event.target.value)}
                                        rows={4}
                                        placeholder="Ví dụ: hỗ trợ hoàn tiền đơn lỗi"
                                        className="w-full rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                                    />
                                </label>

                                <button
                                    type="submit"
                                    disabled={actionLoading === "balance"}
                                    className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-sky-600 text-sm font-black text-white transition hover:bg-sky-700 disabled:opacity-60"
                                >
                                    {actionLoading === "balance" ? <FiLoader className="animate-spin" /> : null}
                                    {balanceType === "credit" ? "Xác nhận cộng tiền" : "Xác nhận trừ tiền"}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="rounded-[1.7rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.7)] p-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm">
                                <FiUsers size={24} />
                            </div>
                            <p className="card-title mt-4">Chọn một người dùng</p>
                            <p className="copy-xs mt-2 text-slate-500">
                                Panel này sẽ hiển thị số dư, level và thao tác cộng trừ ví cho user đang chọn.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </AdminWorkspaceShell>
    );
}
