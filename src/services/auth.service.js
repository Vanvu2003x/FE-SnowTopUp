import api from "@/utils/axios";

export const Login = async (email, password) => {
    const res = await api.post("api/users/login", {
        email: email,
        password: password
    });
    return res.data;
};

export const Logout = async () => {
    const res = await api.post("api/users/logout");
    return res.data;
};

export const CheckMail = async (email) => {
    const res = await api.post("api/users/checkmail", {
        email: email
    });
    return res.data;
};

export const Register = async (name, email, password) => {
    const res = await api.post("/api/users/register", {
        name: name,
        email,
        password,
    });
    return res.data;
};

export const getRole = async () => {
    const res = await api.post("api/users/checkRole");
    return res.data;
};

export const getInfo = async () => {
    try {
        const res = await api.get("/api/users", { skipRedirectOn401: true });
        return res.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return null;
        }
        throw error;
    }
};

// Gửi OTP để lấy lại mật khẩu
export const ForgotPassword = async (email) => {
    const res = await api.post("/api/users/forgot-password", { email });
    return res.data;
};

// Đổi mật khẩu bằng OTP
export const ResetPassword = async (email, otp, newPassword) => {
    const res = await api.post("/api/users/reset-password", {
        email,
        otp,
        newPassword,
    });
    return res.data;
};

// ================== ADMIN OTP XÁC THỰC ==================

// Gửi OTP đến email admin (dựa trên token)
export const sendAdminOTP = async () => {
    const res = await api.post("/api/user/balance/send-otp", {});
    return res.data;
};

// Xác thực OTP admin
export const verifyAdminOTP = async (otp) => {
    const res = await api.post("/api/user/balance/verify-otp", {
        otp
    });
    return res.data;
};

// Cộng / trừ tiền user
export const updateBalance = async (user_id, amount) => {
    const res = await api.put("/api/user/balance", {
        user_id,
        amount
    });
    return res.data;
};
