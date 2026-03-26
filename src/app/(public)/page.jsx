import HomeClient from "@/components/lavi/HomeClient";
import { getPublicGames } from "@/lib/public-data.server";

export default async function HomePage() {
    let games = [];

    try {
        games = await getPublicGames();
    } catch (error) {
        console.error("Khong the tai danh sach game:", error);
    }

    return <HomeClient games={games} />;
}
