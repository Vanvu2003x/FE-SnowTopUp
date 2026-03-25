import HomeClient from "@/components/lavi/HomeClient";
import { getGames } from "@/services/games.service";

export default async function HomePage() {
    let games = [];

    try {
        const result = await getGames();
        games = Array.isArray(result) ? result : [];
    } catch (error) {
        console.error("Không thể tải danh sách game:", error);
    }

    return <HomeClient games={games} />;
}
