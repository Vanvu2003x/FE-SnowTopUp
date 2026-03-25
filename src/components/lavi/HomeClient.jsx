"use client";

import Link from "next/link";
import { FiCheckCircle, FiHelpCircle, FiSearch, FiStar } from "react-icons/fi";

import BannerSlider from "@/components/lavi/BannerSlider";
import { siteConfig } from "@/config/site";

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function HomeClient({ games = [] }) {
    const topupGames = Array.isArray(games)
        ? games.filter((game) => game?.gamecode)
        : [];

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
                <BannerSlider banners={siteConfig.assets.banners} />
            </section>

            <section id="games" className="space-y-5">
                <div className="border-b border-sky-100 pb-4">
                    <p className="page-kicker">Dịch vụ</p>
                    <h2 className="section-title mt-2">Danh sách dịch vụ</h2>
                    <p className="copy-sm mt-2 max-w-2xl">
                        Chọn trò chơi bạn muốn nạp ngay hôm nay với giao diện gọn, dễ tìm và dễ thao tác.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {topupGames.length > 0 ? (
                        topupGames.map((game, index) => {
                            const imageSrc = game.thumbnail?.startsWith("http")
                                ? game.thumbnail
                                : `${baseApiUrl}${game.thumbnail || ""}`;

                            return (
                                <Link
                                    key={game.id || game.gamecode || index}
                                    href={`/categories/topup/${game.gamecode}`}
                                    className="group relative flex flex-col items-center gap-2.5 rounded-2xl border border-sky-100 bg-white p-3 shadow-sm transition-all hover:border-sky-600 hover:shadow-md hover:shadow-sky-100 active:scale-95"
                                >
                                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-sky-50">
                                        {game.thumbnail ? (
                                            <img
                                                src={imageSrc}
                                                alt={game.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-sky-200">
                                                {game.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="card-title line-clamp-1">{game.name}</h3>
                                        <p className="meta-label mt-1 text-sky-600">Nạp ngay</p>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 text-center">
                            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-200 shadow-sm">
                                <FiSearch size={28} />
                            </div>
                            <p className="meta-label text-sky-500">Đang tải danh sách dịch vụ...</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="grid gap-4 pb-10 md:grid-cols-3">
                {[
                    {
                        title: "Nhanh chóng",
                        desc: "Hệ thống tự động xử lý đơn hàng chỉ trong vài phút.",
                        icon: FiStar,
                    },
                    {
                        title: "Bảo mật",
                        desc: "Thông tin tài khoản của bạn luôn được bảo vệ an toàn.",
                        icon: FiCheckCircle,
                    },
                    {
                        title: "Hỗ trợ 24/7",
                        desc: "Đội ngũ kỹ thuật luôn sẵn sàng giải đáp thắc mắc.",
                        icon: FiHelpCircle,
                    },
                ].map((feature) => (
                    <div
                        key={feature.title}
                        className="flex gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:shadow-sky-100"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm">
                            <feature.icon size={21} />
                        </div>
                        <div>
                            <h4 className="card-title">{feature.title}</h4>
                            <p className="copy-sm mt-1">{feature.desc}</p>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}
