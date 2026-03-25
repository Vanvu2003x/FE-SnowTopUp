import Link from "next/link";

import BrandLogo from "@/components/layout/BrandLogo";
import { siteConfig } from "@/config/site";

const footerLinks = siteConfig.navigationSections.flatMap((section) => section.items);

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-sky-100 bg-white">
            <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-6">
                        <BrandLogo imageClassName="h-16" textClassName="text-2xl" />
                        <p className="max-w-md text-sm leading-relaxed text-sky-700/70 font-medium">
                            {siteConfig.name} - Nền tảng nạp game hàng đầu với giao diện hiện đại,
                            giao dịch nhanh chóng và hỗ trợ tận tâm 24/7.
                        </p>
                        <div className="flex gap-4">
                            {/* Social icons if any */}
                        </div>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2">
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-wider text-sky-900">Khám Phá</h4>
                            <div className="mt-6 flex flex-col gap-3 text-sm text-sky-700/70">
                                {footerLinks
                                    .filter((item) => !item.href.startsWith("mailto:"))
                                    .map((item) => (
                                        <Link key={`${item.label}-${item.href}`} href={item.href} className="transition-colors hover:text-sky-600">
                                            {item.label}
                                        </Link>
                                    ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-wider text-sky-900">Hỗ Trợ</h4>
                            <div className="mt-6 space-y-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs font-bold text-sky-300 uppercase">Email</p>
                                    <p className="text-sm font-medium text-sky-700/80">{siteConfig.supportEmail}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs font-bold text-sky-300 uppercase">Phiên bản</p>
                                    <p className="text-sm font-medium text-sky-700/80">v2.0 (Pastel Sky)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-sky-50 pt-8 text-center">
                    <p className="text-xs text-sky-300 font-medium">© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
