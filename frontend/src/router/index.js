import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useUserStore } from "../stores/userStore.js";
import { useToastStore } from "../stores/toastStore.js";

const routes = [
    {
        path: "/",
        component: () => import("../components/Navbar.vue"),
        children: [
            { path: "", component: HomeView },
            {
                path: "about",
                component: () => import("../views/AboutView.vue"),
            },
            {
                path: "login",
                component: () => import("../views/LoginView.vue"),
                name: "Login"
            },
            {
                path: "register",
                component: () => import("../views/RegisterView.vue"),
            },
            {
                path: "logout",
                component: HomeView,
            },
            {
                path: "protected",
                component: () => import("../views/ProtectedPage.vue"),
                meta: {
                    auth: true,
                },
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const authRequired = to.meta?.auth;
    const userStore = useUserStore();
    const toastStore = useToastStore();
    
    if(localStorage.getItem("user")){
        if (userStore.token){
            return next();
        } else {
            try {
                await userStore.refreshToken();
                return next()
            } catch (error) {
                localStorage.removeItem("user")
                toastStore.alert(error.response.data.error + "\n" + "Necesita volver a iniciar sesión", 'error')
                return next({path:'/login'})
            }
        }
    } else {
        if(authRequired){
            if (userStore.token){
                localStorage.setItem('user', true)
                return next();
            }
            toastStore.alert("Necesita iniciar sesión", 'info')
            return next({path:'/login'})
        }
        return next()
    }
    
});

export default router;
