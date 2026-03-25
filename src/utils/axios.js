import axios from "axios";

const api = axios.create({
    baseURL:
        (typeof window === "undefined"
            ? process.env.INTERNAL_API_URL || process.env.API_URL
            : undefined) || process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    timeout: 30000,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (error.config?.skipRedirectOn401) {
                return Promise.reject(error);
            }

            const isAuthPage =
                typeof window !== "undefined" &&
                window.location.pathname.startsWith("/auth/");

            if (!isAuthPage && typeof window !== "undefined") {
                localStorage.removeItem("name");
                localStorage.removeItem("balance");

                if (window.location.pathname !== "/") {
                    console.warn("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
                    window.location.href = "/auth/login";
                }
            }
        }

        if (!error.response) {
            console.error("Lỗi kết nối mạng:", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;
