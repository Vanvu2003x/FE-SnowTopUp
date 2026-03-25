import Image from "next/image";

export default function BrandLogo({
    className = "",
    textClassName = "text-2xl",
    compact = false,
}) {
    const logoSize = compact ? 52 : 68;

    return (
        <span className={`inline-flex items-center gap-3 ${className}`.trim()}>
            <div
                className={`overflow-hidden rounded-xl bg-white shadow-lg shadow-sky-100 ${
                    compact ? "h-[52px] w-[52px]" : "h-[68px] w-[68px]"
                }`}
            >
                <Image
                    src="/images/logo.png"
                    alt="SnowTopup logo"
                    width={logoSize}
                    height={logoSize}
                    className="h-full w-full object-cover"
                    priority
                />
            </div>
            <span className={`font-black tracking-tighter text-slate-900 ${compact ? "text-xl" : textClassName}`}>
                Snow<span className="text-sky-600">Topup</span>
            </span>
        </span>
    );
}
