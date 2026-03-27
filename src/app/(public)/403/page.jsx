import Link from "next/link";

export default function ForbiddenPage() {
    return (
        <section className="rounded-[2rem] border border-[var(--app-border)] bg-white/96 p-8 shadow-[0_18px_42px_rgba(77,157,255,0.07)]">
            <p className="page-kicker">403</p>
            <h1 className="page-title mt-3">Ban khong co quyen truy cap</h1>
            <p className="copy-sm mt-3 max-w-2xl text-slate-600">
                Khu vuc nay chi danh cho tai khoan admin. Hay quay ve khu thanh vien hoac dang nhap
                bang tai khoan quan tri.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
                <Link
                    href="/account"
                    className="btn-copy rounded-full border border-[var(--app-border)] bg-white px-5 py-3 text-slate-700 transition hover:bg-[rgba(244,249,255,0.8)]"
                >
                    Ve tai khoan
                </Link>
                <Link
                    href="/auth/login"
                    className="btn-copy rounded-full bg-sky-600 px-5 py-3 text-white transition hover:bg-sky-700"
                >
                    Dang nhap
                </Link>
            </div>
        </section>
    );
}
