import AdminPanelWorkspace from "@/components/admin/AdminPanelWorkspace";

export const metadata = {
    title: "Admin Orders",
    description: "Quản lý đơn hàng trong khu admin SnowTopup.",
};

export default function AdminOrdersPage() {
    return <AdminPanelWorkspace view="orders" />;
}
