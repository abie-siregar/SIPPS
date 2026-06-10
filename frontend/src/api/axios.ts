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
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default instance;
