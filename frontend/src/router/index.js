import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useUserStore } from "../stores/userStore.js";
import { useToastStore } from "../stores/toastStore.js";
import profileView from "../views/ProfileView.vue";
import editProfileView from "../views/editProfileView.vue";
import gameInfoView from "../views/gameInfoView.vue";
import threadView from "../views/threadView.vue";

const routes = [
    {
        path: "/",
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
            {
                path: "users/:userId",
                component: profileView,
                name: 'profile',
                meta: {
                    auth: true,
                }
            },
            {
                path: "users/:userId/edit",
                component: editProfileView,
                name: 'editProfile',
                meta: {
                    auth: true
                }
            },
            {
                path: "games/:gameId",
                component: gameInfoView,
                name: 'gameInfo'
            },
            {
                path: "threads/:threadId",
                component: threadView,
                name: 'thread'
            },
            {
                path:'/:pathName(.*)',
                name: 'NotFound',
                component: () => import('../views/NotFoundView.vue')
              },
        ],
    },
];

const router = createRouter({
    // import.meta.env.BASE_URL
    history: createWebHistory(), // mirar esto pq meta.env.base_url no es nada
    routes,
});

router.beforeEach(async (to, from, next) => {
    const authRequired = to.meta?.auth;
    const userStore = useUserStore();
    const toastStore = useToastStore();

    if(localStorage.getItem("remember")){
        if (userStore.token){
            return next();
        } else {
            try {
                userStore.user = localStorage.getItem("user")
                console.log("asociando")
                await userStore.refreshToken();
                return next()
            } catch (error) {
                localStorage.removeItem("remember")
                toastStore.alert(error.response.data.error + "\n" + "Necesita volver a iniciar sesión", 'error')
                return next({path:'/login'})
            }
        }
    } else {
        if(authRequired){
            if (userStore.token){
                localStorage.setItem('remember', true)
                return next();
            }
            toastStore.alert("Necesita iniciar sesión", 'info')
            return next({path:'/login'})
        }
        return next()
    }

});

export default router;
