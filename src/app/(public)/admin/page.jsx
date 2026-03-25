import AdminPanelWorkspace from "@/components/admin/AdminPanelWorkspace";

export const metadata = {
    title: "Admin Overview",
    description: "Tổng quan vận hành cho quản trị viên SnowTopup.",
};

export default function AdminPage() {
    return <AdminPanelWorkspace view="overview" />;
}
