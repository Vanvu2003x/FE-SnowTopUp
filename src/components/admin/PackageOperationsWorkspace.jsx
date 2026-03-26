"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { FiGrid, FiPackage, FiRefreshCw, FiSearch } from "react-icons/fi";

import AdminWorkspaceShell from "@/components/admin/AdminWorkspaceShell";
import GamePackageManager from "@/components/admin/GamePackageManager";
import { useToast } from "@/components/ui/Toast";
import { getGames } from "@/services/games.service";

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

export default function PackageOperationsWorkspace() {
    const toast = useToast();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGameId, setSelectedGameId] = useState("");
    const deferredQuery = useDeferredValue(searchQuery);

    const activeGame = useMemo(
        () => games.find((item) => item?.id === selectedGameId) || null,
        [games, selectedGameId]
    );

    useEffect(() => {
        loadWorkspace();
    }, []);

    async function loadWorkspace(showToast = false) {
        const shouldFlipLoading = games.length === 0 && !refreshing;
        if (shouldFlipLoading) setLoading(true);
        setRefreshing(true);

        try {
            const result = await getGames();
            const nextGames = asArray(result, ["games", "rows", "items"]);
            setGames(nextGames);
            setSelectedGameId((current) => {
                if (current && nextGames.some((item) => item?.id === current)) {
                    return current;
                }
                return nextGames[0]?.id || "";
            });

            if (showToast) {
                toast.success("Đã làm mới danh sách game cho quản lý gói.");
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                    error?.message ||
                    "Không thể tải khu quản lý gói nạp."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const filteredGames = useMemo(() => {
        const keyword = deferredQuery.trim().toLowerCase();
        const list = [...games].sort((left, right) =>
            String(left?.name || left?.gamecode || "").localeCompare(
                String(right?.name || right?.gamecode || "")
            )
        );

        if (!keyword) return list;

        return list.filter((game) =>
            [game?.name, game?.custom_name, game?.api_name, game?.gamecode, game?.publisher]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(keyword)
        );
    }, [deferredQuery, games]);

    const stats = useMemo(() => {
        const packageReadyGames = games.filter((item) => item?.gamecode).length;
        return {
            total: games.length,
            hot: games.filter((item) => item?.is_hot).length,
            ready: packageReadyGames,
        };
    }, [games]);

    return (
        <AdminWorkspaceShell
            title="Quản lý gói nạp"
            description="Chọn game riêng để đổi tên gói, set phần trăm theo giá gốc và bật tắt từng gói trong SnowTopup."
            onRefresh={() => loadWorkspace(true)}
            refreshing={refreshing}
        >
            <section className="grid gap-2.5 md:grid-cols-3">
                <div className="rounded-[1.15rem] border border-[var(--app-border)] bg-white/96 p-3 shadow-[0_10px_22px_rgba(77,157,255,0.07)]">
                    <p className="meta-label text-slate-500">Tổng game</p>
                    <p className="mt-1.5 text-[1.35rem] font-black tracking-tight text-slate-950">{stats.total}</p>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">Có thể chọn để quản lý gói nạp.</p>
                </div>
                <div className="rounded-[1.15rem] border border-[var(--app-border)] bg-[linear-gradient(135deg,rgba(239,246,255,0.94),rgba(255,255,255,0.98))] p-3">
                    <p className="meta-label text-sky-700">Sẵn gamecode</p>
                    <p className="mt-1.5 text-[1.35rem] font-black tracking-tight text-sky-700">{stats.ready}</p>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">Nhóm game có thể nối gói từ API.</p>
                </div>
                <div className="rounded-[1.15rem] border border-[var(--app-border)] bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,255,255,0.98))] p-3">
                    <p className="meta-label text-amber-700">Đang hot</p>
                    <p className="mt-1.5 text-[1.35rem] font-black tracking-tight text-amber-700">{stats.hot}</p>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">Tham chiếu nhanh khi chọn game.</p>
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                <section className="rounded-[1.4rem] border border-[var(--app-border)] bg-white/96 p-4 shadow-[0_10px_22px_rgba(77,157,255,0.07)]">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="page-kicker">Chọn game</p>
                            <h2 className="section-title mt-2">Danh sách đầu game</h2>
                        </div>
                        <span className="rounded-full bg-[rgba(244,249,255,0.85)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                            {filteredGames.length} game
                        </span>
                    </div>

                    <label className="mt-4 flex h-10 items-center gap-2 rounded-full border border-[var(--app-border)] bg-[rgba(244,249,255,0.75)] px-4">
                        <FiSearch className="text-slate-400" size={14} />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Tìm game..."
                            className="w-full bg-transparent text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </label>

                    <div className="mt-4 space-y-2">
                        {loading ? (
                            <div className="flex items-center gap-3 rounded-[1.2rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-4 py-5 text-slate-500">
                                <FiRefreshCw className="animate-spin text-sky-600" />
                                <span className="text-sm font-semibold">Đang tải game...</span>
                            </div>
                        ) : filteredGames.length > 0 ? (
                            filteredGames.map((game) => {
                                const selected = game?.id === selectedGameId;

                                return (
                                    <button
                                        key={game?.id || game?.gamecode}
                                        type="button"
                                        onClick={() => setSelectedGameId(game?.id || "")}
                                        className={`flex w-full items-center justify-between gap-3 rounded-[1rem] border px-3 py-3 text-left transition ${
                                            selected
                                                ? "border-sky-300 bg-[rgba(239,247,255,0.92)]"
                                                : "border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] hover:border-sky-200 hover:bg-white"
                                        }`}
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-[13px] font-black text-slate-900">
                                                {game?.name || game?.gamecode || "Game"}
                                            </p>
                                            <p className="mt-1 truncate text-[11px] text-slate-500">
                                                {game?.gamecode || "Chưa có gamecode"} {" • "}
                                                {game?.publisher || "Chưa rõ NPH"}
                                            </p>
                                        </div>
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sky-600">
                                            {selected ? <FiPackage size={15} /> : <FiGrid size={15} />}
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="rounded-[1.2rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] p-4 text-center">
                                <p className="text-[12px] font-black text-slate-900">Không có game phù hợp</p>
                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                    Thử đổi từ khóa tìm kiếm hoặc làm mới dữ liệu.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <GamePackageManager
                    game={activeGame}
                    games={filteredGames.length ? filteredGames : games}
                    onSelectGame={(game) => setSelectedGameId(game?.id || "")}
                />
            </div>
        </AdminWorkspaceShell>
    );
}
