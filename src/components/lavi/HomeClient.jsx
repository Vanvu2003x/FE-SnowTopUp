"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { FiCompass, FiSearch } from "react-icons/fi";

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;

const categoryTabs = [
    { id: "all", label: "Tất cả" },
    { id: "game", label: "Game" },
];

const reveal = {
    hidden: { opacity: 0, y: 14 },
    visible: (index = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.38,
            delay: index * 0.05,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

function toImageSrc(value) {
    if (!value) return "";
    if (String(value).startsWith("http")) return value;
    return `${baseApiUrl || ""}${value}`;
}

function getHeroImage(game) {
    return toImageSrc(game?.poster || game?.thumbnail);
}

function getMetaLabel(game) {
    if (game?.publisher) return game.publisher;
    if (Array.isArray(game?.server) && game.server.length > 0) return "Global";
    return "Topup";
}

export default function HomeClient({ games = [] }) {
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [heroIndex, setHeroIndex] = useState(0);

    const topupGames = useMemo(() => {
        if (!Array.isArray(games)) return [];

        return games
            .filter((game) => game?.gamecode)
            .sort((left, right) => {
                const hotDelta = Number(Boolean(right?.is_hot)) - Number(Boolean(left?.is_hot));
                if (hotDelta !== 0) return hotDelta;
                return String(left?.name || "").localeCompare(String(right?.name || ""));
            });
    }, [games]);

    const hotGames = useMemo(() => {
        const flagged = topupGames.filter((game) => Boolean(game?.is_hot));
        return (flagged.length > 0 ? flagged : topupGames).slice(0, 8);
    }, [topupGames]);

    const heroGames = useMemo(() => {
        const posterGames = topupGames.filter((game) => Boolean(game?.poster));
        if (posterGames.length > 0) return posterGames;
        return hotGames.slice(0, 1);
    }, [hotGames, topupGames]);

    useEffect(() => {
        setHeroIndex((prev) => {
            if (heroGames.length === 0) return 0;
            return prev % heroGames.length;
        });
    }, [heroGames.length]);

    useEffect(() => {
        if (heroGames.length <= 1) return undefined;

        const timer = window.setInterval(() => {
            setHeroIndex((prev) => (prev === heroGames.length - 1 ? 0 : prev + 1));
        }, 4800);

        return () => window.clearInterval(timer);
    }, [heroGames.length]);

    const heroGame = heroGames[heroIndex] || hotGames[0] || topupGames[0] || null;
    const heroVisual = getHeroImage(heroGame) || "/banner/1.jpg";

    const sideGames = useMemo(() => {
        if (heroGames.length <= 1) {
            return hotGames.slice(1, 3);
        }

        return Array.from({ length: Math.min(2, heroGames.length - 1) }, (_, offset) => {
            const nextIndex = (heroIndex + offset + 1) % heroGames.length;
            return heroGames[nextIndex];
        }).filter(Boolean);
    }, [heroGames, heroIndex, hotGames]);

    const visibleGames = useMemo(() => {
        const keyword = query.trim().toLowerCase();

        return topupGames.filter((game) => {
            const matchesKeyword =
                !keyword ||
                [game?.name, game?.publisher, game?.gamecode]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword);

            if (!matchesKeyword) return false;

            return activeCategory === "all" || activeCategory === "game";
        });
    }, [activeCategory, query, topupGames]);

    if (topupGames.length === 0) {
        return (
            <div className="rounded-[28px] border border-[var(--app-border)] bg-white px-6 py-14 text-center shadow-[0_18px_44px_rgba(77,157,255,0.08)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(47,195,194,0.12)] text-cyan-600">
                    <FiSearch size={28} />
                </div>
                <h2 className="mt-5 text-[1.35rem] font-black tracking-[-0.04em] text-slate-900">
                    Chưa có danh mục game
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-[0.92rem] leading-6 text-slate-500">
                    Khi API trả về dữ liệu game topup, trang chủ sẽ tự hiện banner nổi bật, cụm game hot
                    và lưới danh mục bên dưới.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <motion.section
                initial="hidden"
                animate="visible"
                className="relative px-3 pt-2 sm:px-5"
            >
                <div className="absolute inset-x-0 top-3 h-[calc(100%-12px)] rounded-[30px] bg-[linear-gradient(180deg,#effffb_0%,#d8fbf7_100%)]" />

                {sideGames[0] ? (
                    <div className="absolute left-0 top-16 hidden h-[76%] w-[22%] -rotate-[7deg] overflow-hidden rounded-[24px] bg-cyan-200/70 shadow-[0_20px_50px_rgba(45,181,191,0.18)] lg:block">
                        <img
                            src={getHeroImage(sideGames[0]) || toImageSrc(sideGames[0].thumbnail)}
                            alt={sideGames[0].name}
                            className="h-full w-full object-cover opacity-60"
                        />
                    </div>
                ) : null}

                {sideGames[1] ? (
                    <div className="absolute right-0 top-16 hidden h-[76%] w-[22%] rotate-[7deg] overflow-hidden rounded-[24px] bg-cyan-200/70 shadow-[0_20px_50px_rgba(45,181,191,0.18)] lg:block">
                        <img
                            src={getHeroImage(sideGames[1]) || toImageSrc(sideGames[1].thumbnail)}
                            alt={sideGames[1].name}
                            className="h-full w-full object-cover opacity-55"
                        />
                    </div>
                ) : null}

                <motion.div
                    custom={0}
                    variants={reveal}
                    className="relative mx-auto overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_28px_60px_rgba(45,181,191,0.24)]"
                >
                    <Link
                        href={heroGame?.gamecode ? `/categories/topup/${heroGame.gamecode}` : "#games"}
                        className="relative block min-h-[220px] lg:min-h-[340px]"
                    >
                        <AnimatePresence initial={false} mode="wait">
                            <motion.div
                                key={heroGame?.id || heroVisual}
                                initial={{ opacity: 0, scale: 1.02 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.99 }}
                                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                                className="absolute inset-0"
                            >
                                <img
                                    src={heroVisual}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 h-full w-full scale-[1.06] object-cover blur-xl opacity-35"
                                />
                                <img
                                    src={heroVisual}
                                    alt={heroGame?.name || "Banner SnowTopup"}
                                    className="absolute inset-0 h-full w-full object-contain px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4"
                                />
                            </motion.div>
                        </AnimatePresence>
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,18,0.72)_0%,rgba(3,7,18,0.24)_44%,rgba(3,7,18,0.06)_100%)]" />
                        {heroGames.length > 1 ? (
                            <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
                                {heroGames.map((game, index) => {
                                    const isActive = index === heroIndex;

                                    return (
                                        <button
                                            key={game?.id || game?.gamecode || index}
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setHeroIndex(index);
                                            }}
                                            className={`rounded-full transition-all ${
                                                isActive
                                                    ? "h-2.5 w-9 bg-white shadow-[0_6px_18px_rgba(255,255,255,0.28)]"
                                                    : "h-2.5 w-2.5 bg-white/45 hover:bg-white/72"
                                            }`}
                                            aria-label={`Hiện banner ${game?.name || index + 1}`}
                                        />
                                    );
                                })}
                            </div>
                        ) : null}
                    </Link>
                </motion.div>
            </motion.section>

            <section className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                    <h2 className="text-[1.95rem] font-black tracking-[-0.055em] text-slate-950 sm:text-[2.1rem]">
                        Game hot
                    </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {hotGames.map((game, index) => (
                        <motion.div
                            key={game?.id || game?.gamecode || index}
                            custom={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={reveal}
                        >
                            <Link
                                href={`/categories/topup/${game.gamecode}`}
                                className="group flex h-full min-h-[104px] items-center gap-4 rounded-[14px] bg-[linear-gradient(135deg,#18c7c8_0%,#2ec8cf_55%,#41d0c4_100%)] px-4 py-3.5 shadow-[0_16px_32px_rgba(36,186,189,0.18)] transition hover:-translate-y-0.5"
                            >
                                <div className="h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[10px] bg-white/20">
                                    <img
                                        src={toImageSrc(game.thumbnail)}
                                        alt={game.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    {game?.is_hot ? (
                                        <span className="rounded-full bg-white/18 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/82">
                                            Hot
                                        </span>
                                    ) : null}
                                    <p className="line-clamp-2 text-[1.02rem] font-black leading-[1.08] tracking-[-0.045em] text-white">
                                        {game.name}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap gap-3">
                    {categoryTabs.map((tab) => {
                        const isActive = tab.id === activeCategory;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveCategory(tab.id)}
                                className={`min-h-[46px] rounded-full px-6 text-[0.98rem] font-medium tracking-[-0.02em] transition ${
                                    isActive
                                        ? "bg-[linear-gradient(135deg,#25c7c8_0%,#3bcbbf_100%)] text-white shadow-[0_14px_28px_rgba(36,186,189,0.2)]"
                                        : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="rounded-[18px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_16px_34px_rgba(148,163,184,0.08)]">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <label className="flex min-h-[56px] flex-1 items-center gap-3 rounded-[14px] bg-slate-100/80 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                            <FiSearch className="text-slate-500" size={20} />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Tìm game, mã game..."
                                className="w-full border-none bg-transparent text-[1.02rem] font-medium tracking-[-0.02em] text-slate-700 outline-none placeholder:text-slate-400"
                            />
                        </label>

                        <button
                            type="button"
                            className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-slate-200 bg-white text-cyan-600 transition hover:border-cyan-200 hover:text-cyan-700"
                            aria-label="Khám phá"
                        >
                            <FiCompass size={20} />
                        </button>
                    </div>
                </div>
            </section>

            <section id="games" className="space-y-4">
                <div className="flex items-end justify-between gap-4">
                    <h2 className="text-[1.95rem] font-black tracking-[-0.055em] text-slate-950 sm:text-[2.1rem]">
                        Game
                    </h2>
                    <Link
                        href="#games"
                        className="text-[0.98rem] font-semibold tracking-[-0.02em] text-cyan-500 transition hover:text-cyan-700"
                    >
                        Xem tất cả
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {visibleGames.map((game, index) => (
                        <motion.div
                            key={game?.id || game?.gamecode || index}
                            custom={index % 6}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.12 }}
                            variants={reveal}
                        >
                            <Link
                                href={`/categories/topup/${game.gamecode}`}
                                className="group block overflow-hidden rounded-[16px] border border-slate-200/70 bg-white shadow-[0_14px_28px_rgba(148,163,184,0.12)] transition hover:-translate-y-1 hover:shadow-[0_22px_38px_rgba(45,181,191,0.14)]"
                            >
                                <div className="relative aspect-[0.79] overflow-hidden">
                                    <img
                                        src={toImageSrc(game.thumbnail)}
                                        alt={game.name}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                    {game?.is_hot ? (
                                        <div className="absolute right-3 top-3 rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700">
                                            Hot
                                        </div>
                                    ) : null}
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,18,0)_34%,rgba(6,10,18,0.85)_100%)]" />
                                    <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
                                        <div className="rounded-[12px] bg-[linear-gradient(180deg,rgba(8,68,84,0.68),rgba(7,89,91,0.92))] px-3 py-3 shadow-[0_-8px_18px_rgba(0,0,0,0.14)]">
                                            <p className="text-center text-[0.62rem] font-black uppercase tracking-[0.14em] text-white/70">
                                                {getMetaLabel(game)}
                                            </p>
                                            <h3 className="mt-2 line-clamp-2 text-center text-[1rem] font-black uppercase leading-[1.03] tracking-[-0.045em] text-white">
                                                {game.name}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
