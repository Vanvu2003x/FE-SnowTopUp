import "./globals.css";
import { Be_Vietnam_Pro } from "next/font/google";

import { siteConfig } from "@/config/site";
import { ToastProvider } from "@/components/ui/Toast";

const beVietnam = Be_Vietnam_Pro({
    subsets: ["latin", "vietnamese"],
    display: "swap",
    variable: "--font-sans",
    weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"),
    title: {
        default: `${siteConfig.name} | Nạp game giao diện tuyết sáng`,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: siteConfig.assets.logo,
        shortcut: siteConfig.assets.logo,
        apple: siteConfig.assets.logo,
    },
    openGraph: {
        title: `${siteConfig.name} | Nạp game giao diện tuyết sáng`,
        description: siteConfig.description,
        images: siteConfig.assets.banners,
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#f8fbff",
};

export default function RootLayout({ children }) {
    return (
        <html lang="vi">
            <body className={beVietnam.variable}>
                <ToastProvider>{children}</ToastProvider>
            </body>
        </html>
    );
}
