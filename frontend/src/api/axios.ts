import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api", //dev-abi
  // baseURL: "https://sipps.srg.my.id/api", //server
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (!error.config?.skipToastError) {
        const message =
          error.response.data?.error ||
          error.response.data?.message ||
          error.response.data?.msg ||
          "Terjadi kesalahan pada server.";
        window.dispatchEvent(
          new CustomEvent("api-error", { detail: { message } })
        );
      }
    } else if (error.request && !error.config?.skipToastError) {
      window.dispatchEvent(
        new CustomEvent("api-error", {
          detail: { message: "Gagal terhubung ke server. Periksa koneksi internet Anda." },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default instance;
