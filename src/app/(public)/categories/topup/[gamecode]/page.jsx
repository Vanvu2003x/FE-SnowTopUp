import { getGames, getGameByGameCode } from "@/services/games.service";
import { getAllPackageByGameCode } from "@/services/toup_package.service";

import TopUpClient from "./TopUpClient";

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;

function getImageSrc(value) {
    if (!value) return "";
    if (String(value).startsWith("http")) return value;
    return `${baseApiUrl || ""}${value}`;
}

export async function generateMetadata({ params }) {
    const { gamecode } = await params;

    try {
        const game = await getGameByGameCode(gamecode);
        if (game) {
            const shareImage = getImageSrc(game.poster || game.thumbnail);

            return {
                title: `Nạp ${game.name} | SnowTopup`,
                description: `Nạp ${game.name} tại SnowTopup. Poster ngang, giá gói và thanh toán ví được hiển thị gọn trên cùng một trang.`,
                openGraph: {
                    title: `Nạp ${game.name} | SnowTopup`,
                    description: `Nạp ${game.name} tự động trên SnowTopup.`,
                    images: shareImage ? [{ url: shareImage }] : undefined,
                },
                twitter: {
                    card: "summary_large_image",
                    title: `Nạp ${game.name} | SnowTopup`,
                    description: `Nạp ${game.name} tự động trên SnowTopup.`,
                    images: shareImage ? [shareImage] : undefined,
                },
            };
        }
    } catch {
        // Ignore metadata fetch errors and use fallback below.
    }

    return {
        title: "Chi tiết nạp game | SnowTopup",
        description: "Mở gói nạp game trên SnowTopup.",
    };
}

export default async function SnowTopupGamePage({ params }) {
    const { gamecode } = await params;
    let game = null;
    let packages = [];
    let allGames = [];

    try {
        const [gameData, packagesData, gamesData] = await Promise.all([
            getGameByGameCode(gamecode),
            getAllPackageByGameCode(gamecode),
            getGames(),
        ]);

        game = gameData || null;
        packages = Array.isArray(packagesData) ? packagesData : [];
        allGames = Array.isArray(gamesData) ? gamesData.filter((item) => item?.gamecode) : [];
    } catch (error) {
        console.error("Khong the tai trang nap game:", error);
    }

    return <TopUpClient game={game} packages={packages} allGames={allGames} />;
}
