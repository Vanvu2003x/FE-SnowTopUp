import GameOperationsWorkspace from "@/components/admin/GameOperationsWorkspace";

export const metadata = {
    title: "Admin Games",
    description: "Quản lý game và danh mục vận hành trong khu admin SnowTopup.",
};

export default function AdminGamesPage() {
    return <GameOperationsWorkspace />;
}
