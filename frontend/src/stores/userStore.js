import { ref } from "vue";
import { defineStore } from "pinia";
import api from "@/boot/axios";

export const useUserStore = defineStore("user", () => {
    const user = ref(null);
    const token = ref(null);
    const expiresIn = ref(null);

    const access = async (userName, password) => {
        try {
            const res = await api.post("/login", {
                userName: userName,
                password: password,
            });
            const data = res.data;
            token.value = data.token;
            expiresIn.value = data.expiresIn;
            localStorage.setItem("user", true);
            setTime();
            return data;
        } catch (error) {
            if (error.response) {
                throw error.response.data;
            }
        }
    };
    const setTime = () => {
        setTimeout(() => {
            refreshToken();
        }, expiresIn.value * 1000 - 6000);
    };
    const refreshToken = async () => {
        try {
            const res = await api.get("/refresh");
            token.value = res.data.token;
            expiresIn.value = res.data.expiresIn;
            localStorage.setItem("user", true);
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
            await api.get("/logout");
        } catch (error) {
            console.log(error);
        } finally {
            resetStore();
            localStorage.removeItem("user");
        }
    };

    const resetStore = () => {
        token.value = null;
        expiresIn.value = null;
    };
    return {
        user,
        token,
        expiresIn,
        logout,
        refreshToken,
        access,
        register,
    };
});
