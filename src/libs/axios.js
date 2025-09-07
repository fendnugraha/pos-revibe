import Axios from "axios";

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
    },
});

// ✅ Tambahan: set header X-XSRF-TOKEN secara otomatis
axios.interceptors.request.use((config) => {
    const xsrfToken = getCookie("XSRF-TOKEN");
    if (xsrfToken) {
        config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
    }
    return config;
});

// Fungsi helper untuk ambil cookie dari document.cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

//tambahkan respon jika error 401
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const isUnauthorized = error.response?.status === 401;
        const isOnLoginPage = window.location.pathname === "/login";

        if (isUnauthorized && !isOnLoginPage) {
            window.location.href = "/login"; // atau router.push("/login");
        }

        return Promise.reject(error);
    }
);

export default axios;
