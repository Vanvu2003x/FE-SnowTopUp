export const siteConfig = {
    name: "SnowTopup",
    shortName: "TV",
    currency: "VND",
    description: "SnowTopup - Giao diện nạp game hiện đại, xử lý tự động 24/7.",
    theme: {
        primary: "#AFC8E8",
        primaryStrong: "#7FA7D9",
        surface: "#F5F7FA",
        leaf: "#4F7F4F",
    },
    assets: {
        logo: null,
        banners: ["/images/banner-hero.svg", "/images/banner-layout.svg"],
    },
    supportEmail: "support@snowtopup.vn",
    navigationSections: [
        {
            title: null,
            items: [
                { label: "Trang chủ", href: "/", icon: "home" },
                { label: "Danh sách game", href: "/#games", icon: "games" },
                { label: "Hỗ trợ khách hàng", href: "mailto:support@snowtopup.vn", icon: "support" },
            ],
        },
        {
            title: null,
            items: [
                { label: "Nạp tiền", href: "/account/nap-tien", icon: "wallet" },
                { label: "Lịch sử giao dịch", href: "/account/don-hang", icon: "history" },
                { label: "Biến động số dư", href: "/account/lich-su", icon: "activity" },
                { label: "TT cá nhân", href: "/account/thong-tin", icon: "profile" },
            ],
        },
    ],
};
