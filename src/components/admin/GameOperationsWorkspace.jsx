"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
    FiClock,
    FiEdit2,
    FiGrid,
    FiImage,
    FiLoader,
    FiPlay,
    FiPlus,
    FiRefreshCw,
    FiSave,
    FiSettings,
    FiTrash2,
} from "react-icons/fi";

import AdminWorkspaceShell from "@/components/admin/AdminWorkspaceShell";
import { useToast } from "@/components/ui/Toast";
import {
    createGame,
    deleteGame,
    getGameSyncConfig,
    getGames,
    runGameSyncNow,
    updateGame,
    updateGameSyncConfig,
} from "@/services/games.service";

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;

const emptyForm = {
    custom_name: "",
    gamecode: "",
    publisher: "",
    server_text: "",
    is_hot: false,
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

function toImageSrc(value) {
    if (!value) return "";
    if (String(value).startsWith("http")) return value;
    return `${baseApiUrl || ""}${value}`;
}

function parseServerInput(value) {
    return String(value || "")
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function UploadField({
    id,
    label,
    hint,
    preview,
    onChange,
    onClear,
    clearLabel,
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="meta-label text-slate-500">{label}</p>
                    <p className="copy-xs mt-1 text-slate-500">{hint}</p>
                </div>
                {onClear ? (
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 transition hover:text-sky-700"
                    >
                        {clearLabel}
                    </button>
                ) : null}
            </div>

            <label
                htmlFor={id}
                className="flex min-h-[9.5rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-[1.2rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-3 py-4 text-center transition hover:border-sky-300 hover:bg-white"
            >
                {preview ? (
                    <img src={preview} alt={label} className="max-h-28 w-full rounded-[1rem] object-cover" />
                ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white text-sky-600 shadow-sm">
                        <FiImage size={18} />
                    </div>
                )}
                <div>
                    <p className="text-[13px] font-black tracking-tight text-slate-900">
                        {preview ? "Đổi ảnh" : "Tải ảnh lên"}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        JPG, PNG hoặc WebP. Ảnh sẽ lưu local trong thư mục upload.
                    </p>
                </div>
            </label>
            <input id={id} type="file" accept="image/*" onChange={onChange} className="hidden" />
        </div>
    );
}

export default function GameOperationsWorkspace() {
    const toast = useToast();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGameId, setSelectedGameId] = useState("");
    const [formData, setFormData] = useState(emptyForm);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [posterFile, setPosterFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [posterPreview, setPosterPreview] = useState("");
    const [clearThumbnailOverride, setClearThumbnailOverride] = useState(false);
    const [clearPosterOverride, setClearPosterOverride] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [hotUpdatingId, setHotUpdatingId] = useState("");
    const [syncInterval, setSyncInterval] = useState(30);
    const [syncSaving, setSyncSaving] = useState(false);
    const [syncRunning, setSyncRunning] = useState(false);
    const deferredQuery = useDeferredValue(searchQuery);

    const activeGame = useMemo(
        () => games.find((item) => item?.id === selectedGameId) || null,
        [games, selectedGameId]
    );

    useEffect(() => {
        loadWorkspace();
    }, []);

    async function loadWorkspace(showToast = false) {
        const shouldFlipLoading = !games.length && !refreshing;
        if (shouldFlipLoading) setLoading(true);
        setRefreshing(true);

        try {
            const [gamesResult, configResult] = await Promise.all([getGames(), getGameSyncConfig()]);
            const nextGames = asArray(gamesResult, ["games", "rows", "items"]);
            setGames(nextGames);
            setSyncInterval(Number(configResult?.intervalMinutes || 30));

            if (showToast) {
                toast.success("Đã làm mới danh mục game SnowTopup.");
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể tải quản lý game.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    function openCreate() {
        setSelectedGameId("");
        setFormData(emptyForm);
        setThumbnailFile(null);
        setPosterFile(null);
        setThumbnailPreview("");
        setPosterPreview("");
        setClearThumbnailOverride(false);
        setClearPosterOverride(false);
    }

    function openEdit(game) {
        setSelectedGameId(game?.id || "");
        setFormData({
            custom_name: game?.custom_name || game?.name || "",
            gamecode: game?.gamecode || "",
            publisher: game?.publisher || "",
            server_text: Array.isArray(game?.server) ? game.server.join("\n") : "",
            is_hot: Boolean(game?.is_hot),
        });
        setThumbnailFile(null);
        setPosterFile(null);
        setThumbnailPreview(toImageSrc(game?.custom_thumbnail || game?.thumbnail));
        setPosterPreview(toImageSrc(game?.poster));
        setClearThumbnailOverride(false);
        setClearPosterOverride(false);
    }

    function handleFilePick(event, type) {
        const file = event.target.files?.[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);
        if (type === "thumbnail") {
            setThumbnailFile(file);
            setThumbnailPreview(preview);
            setClearThumbnailOverride(false);
            return;
        }

        setPosterFile(file);
        setPosterPreview(preview);
        setClearPosterOverride(false);
    }

    async function handleSaveSyncConfig() {
        const numericValue = Number(syncInterval);
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            toast.warning("Nhập số phút hợp lệ cho lịch cập nhật.");
            return;
        }

        setSyncSaving(true);
        try {
            const result = await updateGameSyncConfig(numericValue);
            setSyncInterval(Number(result?.intervalMinutes || numericValue));
            toast.success("Đã cập nhật lịch cron tự động.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể lưu lịch cập nhật.");
        } finally {
            setSyncSaving(false);
        }
    }

    async function handleRunSyncNow() {
        setSyncRunning(true);
        try {
            await runGameSyncNow();
            await loadWorkspace();
            toast.success("Đã chạy đồng bộ game ngay lập tức.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể chạy đồng bộ ngay.");
        } finally {
            setSyncRunning(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!selectedGameId && !formData.custom_name.trim()) {
            toast.warning("Game mới cần tên hiển thị để tạo.");
            return;
        }

        if (!formData.gamecode.trim()) {
            toast.warning("Gamecode là bắt buộc.");
            return;
        }

        const payload = new FormData();
        const info = {
            name: formData.custom_name.trim(),
            custom_name: formData.custom_name.trim(),
            gamecode: formData.gamecode.trim(),
            publisher: formData.publisher.trim(),
            server: parseServerInput(formData.server_text),
            is_hot: Boolean(formData.is_hot),
        };

        if (clearThumbnailOverride) {
            info.custom_thumbnail = "";
        }

        if (clearPosterOverride) {
            info.poster = "";
        }

        payload.append("info", JSON.stringify(info));
        if (thumbnailFile) payload.append("thumbnail", thumbnailFile);
        if (posterFile) payload.append("poster", posterFile);

        setSubmitting(true);
        try {
            const result = selectedGameId
                ? await updateGame(selectedGameId, payload)
                : await createGame(payload);
            await loadWorkspace();
            openEdit(result);
            toast.success(selectedGameId ? "Đã lưu thay đổi game." : "Đã tạo game mới.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể lưu game.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleToggleHot(game) {
        if (!game?.id) return;

        const payload = new FormData();
        payload.append("info", JSON.stringify({ is_hot: !Boolean(game?.is_hot) }));
        setHotUpdatingId(game.id);

        try {
            await updateGame(game.id, payload);
            await loadWorkspace();
            if (selectedGameId === game.id) {
                openEdit({ ...game, is_hot: !Boolean(game?.is_hot) });
            }
            toast.success(Boolean(game?.is_hot) ? "Đã gỡ trạng thái hot." : "Đã đánh dấu game hot.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể đổi trạng thái hot.");
        } finally {
            setHotUpdatingId("");
        }
    }

    async function handleDeleteGame(game) {
        if (!game?.id) return;
        const accepted = window.confirm(
            `Xóa game "${game?.name || game?.gamecode}"? Thumbnail và poster local cũng sẽ bị gỡ.`
        );

        if (!accepted) return;

        setDeletingId(game.id);
        try {
            await deleteGame(game.id);
            await loadWorkspace();
            if (selectedGameId === game.id) {
                openCreate();
            }
            toast.success("Đã xóa game.");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Không thể xóa game.");
        } finally {
            setDeletingId("");
        }
    }

    const filteredGames = useMemo(() => {
        const keyword = deferredQuery.trim().toLowerCase();
        const list = [...games].sort((left, right) => {
            const hotDelta = Number(Boolean(right?.is_hot)) - Number(Boolean(left?.is_hot));
            if (hotDelta !== 0) return hotDelta;
            return String(left?.name || "").localeCompare(String(right?.name || ""));
        });

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
        const hotGames = games.filter((item) => item?.is_hot).length;
        const renamedGames = games.filter((item) => item?.custom_name).length;
        const posterGames = games.filter((item) => item?.poster).length;

        return {
            total: games.length,
            hot: hotGames,
            renamed: renamedGames,
            posters: posterGames,
        };
    }, [games]);

    return (
        <AdminWorkspaceShell
            title="Quản lý game"
            description="Đổi tên hiển thị, tải thumbnail và poster ngang, điều khiển lịch cập nhật và sửa từng game ngay trong SnowTopup."
            onRefresh={() => loadWorkspace(true)}
            refreshing={refreshing}
            actions={
                <button
                    type="button"
                    onClick={openCreate}
                    className="btn-copy inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-[13px] text-sky-700 transition hover:bg-sky-100"
                >
                    <FiPlus size={15} />
                    Game mới
                </button>
            }
        >
            <section className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[1.15rem] border border-[var(--app-border)] bg-white/96 p-3 shadow-[0_10px_22px_rgba(77,157,255,0.07)]">
                    <p className="meta-label text-slate-500">Tổng đầu game</p>
                    <p className="mt-1.5 text-[1.35rem] font-black tracking-tight text-slate-950">{stats.total}</p>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">Game đang có trong danh mục cập nhật.</p>
                </div>
                <div className="rounded-[1.15rem] border border-[var(--app-border)] bg-[linear-gradient(135deg,rgba(255,251,235,0.92),rgba(255,255,255,0.98))] p-3">
                    <p className="meta-label text-amber-700">Đang hot</p>
                    <p className="mt-1.5 text-[1.35rem] font-black tracking-tight text-amber-700">{stats.hot}</p>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">Game nổi bật trên home.</p>
                </div>
                <div className="rounded-[1.15rem] border border-[var(--app-border)] bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(255,255,255,0.98))] p-3">
                    <p className="meta-label text-emerald-700">Đã đổi tên</p>
                    <p className="mt-1.5 text-[1.35rem] font-black tracking-tight text-emerald-700">
                        {stats.renamed}
                    </p>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">Không bị cron đè tên.</p>
                </div>
                <div className="rounded-[1.15rem] border border-[var(--app-border)] bg-[linear-gradient(135deg,rgba(239,246,255,0.94),rgba(255,255,255,0.98))] p-3">
                    <p className="meta-label text-sky-700">Có poster ngang</p>
                    <p className="mt-1.5 text-[1.35rem] font-black tracking-tight text-sky-700">{stats.posters}</p>
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">Hero ưu tiên poster.</p>
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_320px]">
                <section className="space-y-4">
                    <div className="rounded-[1.15rem] border border-[var(--app-border)] bg-white/96 p-3 shadow-[0_8px_18px_rgba(77,157,255,0.07)]">
                        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">
                                    Cập nhật API
                                </p>
                                <h2 className="text-[14px] font-black tracking-tight text-slate-950">
                                    Lịch cập nhật game
                                </h2>
                                <p className="text-[10px] leading-4 text-slate-500">
                                    Giữ nguyên tên, ảnh local, poster và trạng thái hot do admin chỉnh.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <label className="flex min-h-[34px] items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[rgba(244,249,255,0.75)] px-3">
                                    <FiClock className="text-slate-400" size={13} />
                                    <input
                                        type="number"
                                        min="1"
                                        value={syncInterval}
                                        onChange={(event) => setSyncInterval(event.target.value)}
                                        className="w-12 bg-transparent text-[12px] font-black text-slate-900 outline-none"
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                                        phút
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleSaveSyncConfig}
                                    disabled={syncSaving}
                                    className="inline-flex min-h-[34px] items-center justify-center gap-1 rounded-full border border-[var(--app-border)] bg-white px-3 text-[12px] font-black text-slate-700 transition hover:bg-[rgba(244,249,255,0.85)] disabled:opacity-60"
                                >
                                    {syncSaving ? <FiLoader className="animate-spin" /> : <FiSettings size={13} />}
                                    Lưu
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRunSyncNow}
                                    disabled={syncRunning}
                                    className="inline-flex min-h-[34px] items-center justify-center gap-1 rounded-full bg-sky-600 px-3 text-[12px] font-black text-white transition hover:bg-sky-700 disabled:opacity-60"
                                >
                                    {syncRunning ? <FiLoader className="animate-spin" /> : <FiPlay size={13} />}
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>

                    <section className="rounded-[1.4rem] border border-[var(--app-border)] bg-white/96 p-4 shadow-[0_10px_22px_rgba(77,157,255,0.07)]">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="page-kicker">Danh mục</p>
                                <h2 className="section-title mt-2">Danh sách game có thể sửa</h2>
                            </div>
                            <label className="flex min-h-[46px] w-full max-w-[24rem] items-center gap-3 rounded-full border border-[var(--app-border)] bg-[rgba(244,249,255,0.75)] px-4">
                                <FiGrid className="text-slate-400" size={16} />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Tìm theo tên, gamecode, nhà phát hành..."
                                    className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                                />
                            </label>
                        </div>

                        <div className="mt-6 space-y-3">
                            {loading ? (
                                <div className="flex items-center gap-3 rounded-[1.5rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.65)] px-5 py-6 text-slate-500">
                                    <FiRefreshCw className="animate-spin text-sky-600" />
                                    <span className="text-sm font-semibold">Đang tải game...</span>
                                </div>
                            ) : filteredGames.length > 0 ? (
                                filteredGames.map((game) => {
                                    const selected = game?.id === selectedGameId;
                                    const imageSrc = toImageSrc(game?.thumbnail);
                                    const posterSrc = toImageSrc(game?.poster);

                                    return (
                                        <article
                                            key={game?.id || game?.gamecode}
                                            className={`rounded-[1.7rem] border p-4 transition ${
                                                selected
                                                    ? "border-sky-300 bg-[rgba(239,247,255,0.92)] shadow-[0_12px_28px_rgba(59,130,246,0.12)]"
                                                    : "border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] hover:border-sky-200 hover:bg-white"
                                            }`}
                                        >
                                            <div className="grid gap-3 lg:grid-cols-[68px_minmax(0,1fr)_auto]">
                                                <div className="overflow-hidden rounded-[1rem] bg-white shadow-sm">
                                                    {imageSrc ? (
                                                        <img
                                                            src={imageSrc}
                                                            alt={game?.name || game?.gamecode}
                                                            className="h-16 w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-20 items-center justify-center text-sky-500">
                                                            <FiImage size={22} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="card-title truncate text-slate-900">
                                                            {game?.name || "Game chưa đặt tên"}
                                                        </p>
                                                        {game?.is_hot ? (
                                                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
                                                                Hot
                                                            </span>
                                                        ) : null}
                                                        {game?.custom_name ? (
                                                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">
                                                                Đã đổi tên
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="copy-xs mt-2 text-slate-500">
                                                        {game?.gamecode || "Chưa có gamecode"} {" • "}
                                                        {game?.publisher || "Chưa rõ NPH"}
                                                    </p>
                                                    <p className="copy-xs mt-2 text-slate-500">
                                                        API name: {game?.api_name || "Chưa có dữ liệu nguồn"}
                                                    </p>
                                                    {posterSrc ? (
                                                        <div className="mt-2 overflow-hidden rounded-xl border border-white/60">
                                                            <img
                                                                src={posterSrc}
                                                                alt={`${game?.name || game?.gamecode} poster`}
                                                                className="h-12 w-full object-cover"
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className="flex flex-wrap items-start justify-start gap-2 lg:justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(game)}
                                                        className="inline-flex min-h-[38px] items-center gap-2 rounded-full bg-slate-900 px-3.5 text-[13px] font-black text-white transition hover:bg-slate-800"
                                                    >
                                                        <FiEdit2 size={15} />
                                                        Sửa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleHot(game)}
                                                        disabled={hotUpdatingId === game?.id}
                                                        className={`inline-flex min-h-[38px] items-center gap-2 rounded-full border px-3.5 text-[13px] font-black transition ${
                                                            game?.is_hot
                                                                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                                : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                                                        } ${hotUpdatingId === game?.id ? "opacity-60" : ""}`}
                                                    >
                                                        {hotUpdatingId === game?.id ? (
                                                            <FiLoader className="animate-spin" size={15} />
                                                        ) : null}
                                                        {game?.is_hot ? "Gỡ hot" : "Đặt hot"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteGame(game)}
                                                        disabled={deletingId === game?.id}
                                                        className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 text-[13px] font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                                                    >
                                                        {deletingId === game?.id ? (
                                                            <FiLoader className="animate-spin" size={15} />
                                                        ) : (
                                                            <FiTrash2 size={15} />
                                                        )}
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <div className="rounded-[1.6rem] border border-dashed border-[var(--app-border)] bg-[rgba(244,249,255,0.55)] p-6 text-center">
                                    <p className="card-title">Không có game phù hợp</p>
                                    <p className="copy-xs mt-2 text-slate-500">
                                        Thử đổi từ khóa tìm kiếm hoặc cập nhật lại từ API.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </section>

                <section className="rounded-[1.7rem] border border-[var(--app-border)] bg-white/96 p-5 shadow-[0_14px_30px_rgba(77,157,255,0.07)] xl:sticky xl:top-5 xl:self-start">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="page-kicker">{selectedGameId ? "Sửa game" : "Game mới"}</p>
                            <h2 className="section-title mt-2">
                                {selectedGameId ? "Panel chỉnh sửa" : "Tạo game thủ công"}
                            </h2>
                        </div>
                        {selectedGameId ? (
                            <button
                                type="button"
                                onClick={openCreate}
                                className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 transition hover:text-sky-700"
                            >
                                Tạo mới
                            </button>
                        ) : null}
                    </div>

                    {activeGame ? (
                        <div className="mt-4 rounded-[1.3rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.7)] p-3.5">
                            <p className="meta-label text-slate-500">Nguồn API hiện tại</p>
                            <p className="mt-2 text-sm font-black text-slate-900">
                                {activeGame?.api_name || activeGame?.name || "Chưa có"}
                            </p>
                            <p className="copy-xs mt-2 text-slate-500">
                                Gamecode: {activeGame?.gamecode || "Chưa có"} {" • "}
                                Thumbnail API: {activeGame?.api_thumbnail ? "Có" : "Không"}
                            </p>
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <label className="block space-y-2">
                            <span className="meta-label text-slate-500">Tên hiển thị</span>
                            <input
                                type="text"
                                value={formData.custom_name}
                                onChange={(event) =>
                                    setFormData((prev) => ({ ...prev, custom_name: event.target.value }))
                                }
                                placeholder="Liên Quân Mobile"
                                className="h-11 w-full rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="meta-label text-slate-500">Gamecode</span>
                            <input
                                type="text"
                                value={formData.gamecode}
                                onChange={(event) =>
                                    setFormData((prev) => ({ ...prev, gamecode: event.target.value }))
                                }
                                placeholder="lien-quan"
                                className="h-11 w-full rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="meta-label text-slate-500">Nhà phát hành</span>
                            <input
                                type="text"
                                value={formData.publisher}
                                onChange={(event) =>
                                    setFormData((prev) => ({ ...prev, publisher: event.target.value }))
                                }
                                placeholder="Garena"
                                className="h-11 w-full rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="meta-label text-slate-500">Danh sách server</span>
                            <textarea
                                value={formData.server_text}
                                onChange={(event) =>
                                    setFormData((prev) => ({ ...prev, server_text: event.target.value }))
                                }
                                rows={4}
                                placeholder={"VN\nS1\nS2"}
                                className="w-full rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                            />
                        </label>

                        <label className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.72)] px-4 py-2.5">
                            <div>
                                <p className="text-sm font-black text-slate-900">Đánh dấu game hot</p>
                                <p className="copy-xs mt-1 text-slate-500">
                                    Ưu tiên hiển thị ở homepage và cụm game nổi bật.
                                </p>
                            </div>
                            <input
                                type="checkbox"
                                checked={Boolean(formData.is_hot)}
                                onChange={(event) =>
                                    setFormData((prev) => ({ ...prev, is_hot: event.target.checked }))
                                }
                                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                        </label>

                        <UploadField
                            id="game-thumbnail-upload"
                            label="Thumbnail dọc"
                            hint="Dùng cho card game và danh sách."
                            preview={thumbnailPreview}
                            onChange={(event) => handleFilePick(event, "thumbnail")}
                            onClear={() => {
                                setThumbnailFile(null);
                                setThumbnailPreview(toImageSrc(activeGame?.api_thumbnail));
                                setClearThumbnailOverride(true);
                            }}
                            clearLabel="Dùng ảnh API"
                        />

                        <UploadField
                            id="game-poster-upload"
                            label="Poster ngang"
                            hint="Dùng cho hero trang nạp game và ảnh chia sẻ."
                            preview={posterPreview}
                            onChange={(event) => handleFilePick(event, "poster")}
                            onClear={() => {
                                setPosterFile(null);
                                setPosterPreview("");
                                setClearPosterOverride(true);
                            }}
                            clearLabel="Xóa poster"
                        />

                        <div className="rounded-[1.3rem] border border-[var(--app-border)] bg-[rgba(244,249,255,0.65)] p-3.5">
                            <p className="meta-label text-slate-500">Ghi chú</p>
                            <p className="copy-xs mt-2 text-slate-500">
                                Cron vẫn lấy dữ liệu mới từ API. Những gì admin chỉnh ở đây sẽ được giữ để
                                không bị cập nhật ghi đè.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-full bg-sky-600 px-5 text-sm font-black text-white transition hover:bg-sky-700 disabled:opacity-60"
                            >
                                {submitting ? <FiLoader className="animate-spin" /> : <FiSave size={15} />}
                                {selectedGameId ? "Lưu thay đổi" : "Tạo game"}
                            </button>
                            {selectedGameId ? (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteGame(activeGame)}
                                    disabled={deletingId === selectedGameId}
                                    className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                                >
                                    {deletingId === selectedGameId ? (
                                        <FiLoader className="animate-spin" />
                                    ) : (
                                        <FiTrash2 size={15} />
                                    )}
                                    Xóa game
                                </button>
                            ) : null}
                        </div>
                    </form>
                </section>
            </div>
        </AdminWorkspaceShell>
    );
}
