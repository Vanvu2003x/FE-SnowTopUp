import AdminPanelWorkspace from "@/components/admin/AdminPanelWorkspace";

export const metadata = {
    title: "Admin Security",
    description: "OTP admin và điều chỉnh số dư trong khu admin SnowTopup.",
};

export default function AdminSecurityPage() {
    return <AdminPanelWorkspace view="security" />;
}
