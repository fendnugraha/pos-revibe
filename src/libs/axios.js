import Axios from "axios";

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// Ambil cookie XSRF
axios.interceptors.request.use((config) => {
    const xsrfToken = getCookie("XSRF-TOKEN");
    if (xsrfToken) {
        config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
    }
    return config;
});

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.startsWith(nameEQ)) return c.substring(nameEQ.length);
    }
    return null;
}

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401 && window.location.pathname !== "/login") {
            window.location.href = "/login";
        }

        if (!error.response) {
            console.error("⚠️ Network error:", error.message);
        }

        return Promise.reject(error);
    }
);

export default axios;
