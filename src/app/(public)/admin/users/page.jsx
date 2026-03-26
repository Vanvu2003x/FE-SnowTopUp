import UserOperationsWorkspace from "@/components/admin/UserOperationsWorkspace";

export const metadata = {
    title: "Admin Users",
    description: "Quản lý người dùng trong khu admin SnowTopup.",
};

export default function AdminUsersPage() {
    return <UserOperationsWorkspace />;
}
