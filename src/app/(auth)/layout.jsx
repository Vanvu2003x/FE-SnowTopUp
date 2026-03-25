import Link from "next/link";
import { FiCheckCircle, FiShield, FiStar } from "react-icons/fi";

import BrandLogo from "@/components/layout/BrandLogo";

export default function AuthLayout({ children }) {
    return (
        <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-[-7rem] top-[-7rem] h-[22rem] w-[22rem] rounded-full bg-sky-200/25 blur-[120px]" />
                <div className="absolute bottom-[-8rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-sky-100/70 blur-[140px]" />
            </div>

            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1320px] gap-12 xl:grid-cols-[1fr_1fr] xl:items-center">
                <section className="hidden rounded-[2.5rem] border border-[var(--app-border)] bg-white/95 p-9 shadow-[0_20px_48px_rgba(77,157,255,0.08)] xl:block">
                    <Link href="/" className="inline-flex items-center">
                        <BrandLogo />
                    </Link>

                    <div className="mt-10 grid gap-4">
                        {[
                            [
                                FiCheckCircle,
                                "Giao dịch tốc độ",
                                "Hệ thống tự động xử lý đơn hàng chỉ trong vài phút.",
                            ],
                            [
                                FiShield,
                                "Bảo mật tuyệt đối",
                                "Thông tin tài khoản và số dư của bạn luôn được bảo vệ an toàn.",
                            ],
                            [
                                FiStar,
                                "Tối ưu mọi thiết bị",
                                "Thiết kế trực quan, gọn và tương thích tốt trên desktop lẫn mobile.",
                            ],
                        ].map(([Icon, title, description]) => (
                            <div
                                key={title}
                                className="group rounded-2xl border border-[var(--app-border)] bg-[rgba(244,249,255,0.82)] p-4 transition-all hover:bg-white hover:shadow-md hover:shadow-sky-100/40"
                            >
                                <div className="flex gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm transition-transform group-hover:scale-110">
                                        <Icon size={18} />
                                    </span>
                                    <div>
                                        <p className="card-title">{title}</p>
                                        <p className="copy-sm mt-1">{description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex w-full items-center justify-center">
                    <div className="w-full max-w-[460px]">{children}</div>
                </div>
            </div>
        </div>
    );
}
