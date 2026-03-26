import {
    getPublicGameByCode,
    getPublicGames,
    getPublicPackagesByGameCode,
} from "@/lib/public-data.server";

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
        const game = await getPublicGameByCode(gamecode);
        if (game) {
            const shareImage = getImageSrc(game.poster || game.thumbnail);

            return {
                title: `Nap ${game.name} | SnowTopup`,
                description: `Nap ${game.name} tai SnowTopup. Poster ngang, gia goi va thanh toan vi duoc hien thi gon tren cung mot trang.`,
                openGraph: {
                    title: `Nap ${game.name} | SnowTopup`,
                    description: `Nap ${game.name} tu dong tren SnowTopup.`,
                    images: shareImage ? [{ url: shareImage }] : undefined,
                },
                twitter: {
                    card: "summary_large_image",
                    title: `Nap ${game.name} | SnowTopup`,
                    description: `Nap ${game.name} tu dong tren SnowTopup.`,
                    images: shareImage ? [shareImage] : undefined,
                },
            };
        }
    } catch {
        // Ignore metadata fetch errors and use fallback below.
    }

    return {
        title: "Chi tiet nap game | SnowTopup",
        description: "Mo goi nap game tren SnowTopup.",
    };
}

export default async function SnowTopupGamePage({ params }) {
    const { gamecode } = await params;
    let game = null;
    let packages = [];
    let allGames = [];

    try {
        const [gameData, packagesData, gamesData] = await Promise.all([
            getPublicGameByCode(gamecode),
            getPublicPackagesByGameCode(gamecode),
            getPublicGames(),
        ]);

        game = gameData || null;
        packages = Array.isArray(packagesData) ? packagesData : [];
        allGames = Array.isArray(gamesData) ? gamesData.filter((item) => item?.gamecode) : [];
    } catch (error) {
        console.error("Khong the tai trang nap game:", error);
    }

    return <TopUpClient game={game} packages={packages} allGames={allGames} />;
}
