import PackageOperationsWorkspace from "@/components/admin/PackageOperationsWorkspace";

export const metadata = {
    title: "Admin Packages",
    description: "Quản lý gói nạp riêng theo từng game trong khu admin SnowTopup.",
};

export default function AdminPackagesPage() {
    return <PackageOperationsWorkspace />;
}
