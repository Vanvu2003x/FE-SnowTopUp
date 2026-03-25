import AdminPanelWorkspace from "@/components/admin/AdminPanelWorkspace";

export const metadata = {
    title: "Admin Users",
    description: "Quản lý người dùng trong khu admin SnowTopup.",
};

export default function AdminUsersPage() {
    return <AdminPanelWorkspace view="users" />;
}
