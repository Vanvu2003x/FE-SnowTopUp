import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const resolveApiBaseUrl = () =>
    (
        process.env.INTERNAL_API_URL ||
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        ""
    ).replace(/\/+$/, "");

async function getAdminSession() {
    const baseUrl = resolveApiBaseUrl();
    const token = (await cookies()).get("token")?.value;

    if (!token || !baseUrl) {
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/api/users`, {
            method: "GET",
            headers: {
                Cookie: `token=${token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const payload = await response.json();
        return payload?.user || payload || null;
    } catch {
        return null;
    }
}

export default async function AdminLayout({ children }) {
    const currentUser = await getAdminSession();

    if (!currentUser) {
        redirect("/auth/login?next=/admin");
    }

    if (currentUser.role !== "admin") {
        redirect("/403");
    }

    return children;
}
