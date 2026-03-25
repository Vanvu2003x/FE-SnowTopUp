import AccountSidebar from "@/components/layout/AccountSidebar";

export default function AccountLayout({ children }) {
    return (
        <div className="min-w-0 space-y-8">
            <AccountSidebar />
            {children}
        </div>
    );
}
