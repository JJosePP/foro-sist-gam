import axios from "axios";
import { useUserStore} from "../stores/userStore.js";
// import router from "@/router/index.js";
// const controller = new AbortController()

const api = axios.create({
    baseURL: "http://localhost:3000/api/v1",
    withCredentials: true,
})

api.interceptors.request.use(config => {
    const userStore = useUserStore();
    const token = userStore.token
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config
})

let isRefreshing = false;
let failedQueue = [];

const processQueue = () => {
    failedQueue.forEach(cb => cb());
    failedQueue = [];
};

api.interceptors.response.use(res => res, async error => {
    const originalRequest = error.config;

    if(!useUserStore.token){
        return Promise.reject(error)
    }
    if(originalRequest.skipAuthRefresh){
        return Promise.reject(error)
    }
    if(error.response?.status === 401 && !originalRequest._retry){
        originalRequest._retry = true;
        if(isRefreshing) {
            return new Promise(resolve => {
                failedQueue.push(() => {
                    resolve(api(originalRequest));
                });
            });
        }
        isRefreshing = true;

        try {
            const userStore = useUserStore();
            await userStore.refreshToken();

            processQueue();
            return api(originalRequest);
        } catch (error) {
            const userStore = useUserStore();
            userStore.logout?.();
            return Promise.reject(error);
        } finally {
            isRefreshing = false
        }
    }
    return Promise.reject(error);
});

// api.interceptors.response.use((response) => {
//     return response;
// }, function (error) {
//     console.log("ERORRRRR: ", error)
//     if(error.response.status === 404){
//         console.log("ENTRA")
//         console.log(router)
//         controller.abort()
//         router.push({name: '404'});
//     }
//     return Promise.reject(error.response)
// })
// api.interceptors.response.use(null, error => {
//   let path = '/error';
//   switch (error.response.status) {
//     case 401: path = '/login'; break;
//     case 404: path = '/404'; break;
//   }
//   router.push(path);
//   return Promise.reject(error);
// });

export default api;

