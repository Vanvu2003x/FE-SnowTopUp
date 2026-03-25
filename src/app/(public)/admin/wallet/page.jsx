import AdminPanelWorkspace from "@/components/admin/AdminPanelWorkspace";

export const metadata = {
    title: "Admin Wallet",
    description: "Quản lý nạp ví và đối soát giao dịch trong khu admin SnowTopup.",
};

export default function AdminWalletPage() {
    return <AdminPanelWorkspace view="wallet" />;
}
