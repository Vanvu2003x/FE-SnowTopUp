import { getGames, getGameByGameCode } from "@/services/games.service";
import { getAllPackageByGameCode } from "@/services/toup_package.service";

import TopUpClient from "./TopUpClient";

export async function generateMetadata({ params }) {
    const { gamecode } = await params;

    try {
        const game = await getGameByGameCode(gamecode);
        if (game) {
            return {
                title: `Nạp ${game.name}`,
                description: `Trang nạp ${game.name} - Hệ thống nạp game tự động LaviTopUp.`,
            };
        }
    } catch {
        // Ignore metadata fetch errors and use fallback below.
    }

    return {
        title: "Chi tiết nạp game",
        description: "Mở gói nạp game trên LaviTopUp.",
    };
}

export default async function LaviTopUpPage({ params }) {
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
        console.error("Không thể tải trang nạp game:", error);
    }

    return <TopUpClient game={game} packages={packages} allGames={allGames} />;
}
