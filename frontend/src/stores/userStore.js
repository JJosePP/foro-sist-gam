import { computed, ref } from "vue";
import { defineStore } from "pinia";
import api from "@/boot/axios";

export const useUserStore = defineStore("user", () => {
    const userId = ref('');
    const user = ref('');
    const token = ref(null);
    const expiresIn = ref(null);
    const profilePic = ref('');
    const expiresAt = ref(0);
    let timeoutId = null;
    const roles = ref([]);

    if(localStorage.getItem("user")){
        user.value = localStorage.getItem("user")
    }
    if(localStorage.getItem("profilePic")){
        profilePic.value = localStorage.getItem("profilePic")
    }
    if(localStorage.getItem("userId")){
        userId.value = localStorage.getItem("userId")
    }

    const decodeToken = (token) => {
        if(!token){
            return {}
        }
        try {
            return JSON.parse(atob(token.split('.')[1]))
        } catch (error) {
            return {}
        }
    }
    const setToken = (newToken) => {
        token.value = newToken;
        const payload = decodeToken(newToken);
        roles.value = payload.roles || []
    }

    const access = async (userName, password) => {
        try {
            console.log("AQUI")
            const res = await api.post("/login", {
                userName: userName,
                password: password,
            });
            console.log("AQUI2")

            const now = Date.now();
            const data = res.data;
            // token.value = data.token;
            setToken(data.token)
            profilePic.value = data.profilePic
            expiresIn.value = data.expiresIn;
            expiresAt.value = now + (data.expiresIn * 1000);
            localStorage.setItem("remember", true);
            localStorage.setItem("user", data.username)
            localStorage.setItem("profilePic", data.profilePic)
            localStorage.setItem("userId", data.userId)
            user.value = localStorage.getItem("user")
            profilePic.value = localStorage.getItem("profilePic")
            userId.value = localStorage.getItem("userId")
            setTime();
            return data;
        } catch (error) {
            //MIRAR PQ CUAANDO PONES CONTRASEÑA INCORRECTA NO APARECE MENSAJE TOAST CON ERROR
            console.log("EEEEEE", error.response)
            if (error.response) {
                throw error.response.data;
            }
        }
    };
    // const setTime = () => {
    //     console.log(Date.now())
    //     console.log(expiresIn.value)
    //     setTimeout(() => {
    //         refreshToken();
    //     }, expiresIn.value * 1000 - 6000);
    // };

    const setTime = () => {
        if(timeoutId){
            clearTimeout(timeoutId)
        }
        const timeLeft = expiresAt.value - Date.now() - 10000

        if(timeLeft <= 0){
            return refreshToken();
        }
        timeoutId = setTimeout(() => {
            refreshToken();
        },timeLeft);
    };

    const refreshToken = async () => {
        try {
            const res = await api.get("/refresh");
            const now = Date.now();
            // token.value = res.data.token;

            setToken(res.data.token)
            expiresIn.value = res.data.expiresIn;
            expiresAt.value = now + (res.data.expiresIn * 1000);
            setTime();
        } catch (error) {
            throw error
        }
    };

    const register = async (userName, email, password, name, lastName) => {
        try {
            const res = await api.post("/register", {
                userName: userName,
                email: email,
                name: name,
                lastName: lastName,
                password: password,
            });
            return res.data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            }
        }
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.log(error);
        } finally {
            resetStore();
            localStorage.removeItem("remember");
            localStorage.removeItem("user");
            localStorage.removeItem("profilePic");
            localStorage.removeItem("userId");
        }
    };

    const resetStore = () => {
        token.value = null;
        expiresIn.value = null;
        roles.value = []
    };

    // GETTERS (computed)
    const isAdmin = computed(() => roles.value.includes('administrator'))

    return {
        userId,
        user,
        token,
        profilePic,
        expiresIn,
        logout,
        refreshToken,
        access,
        register,
        setToken,
        isAdmin
    };
});
