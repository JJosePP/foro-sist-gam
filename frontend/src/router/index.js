import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/homeView.vue";
import { useUserStore } from "../stores/userStore.js";
import { useToastStore } from "../stores/toastStore.js";
import profileView from "../views/profileView.vue";
import gamesView from "../views/gamesView.vue";
import gameInfoView from "../views/gameInfoView.vue"
import forumView from "../views/categoriesView.vue"
import threadsView from "../views/threadsView.vue"
import threadView from "../views/threadView.vue"
import quizzesView from "../views/quizzesView.vue"
import quizView from "../views/quizView.vue"
import adminView from "@/views/adminView.vue";
import reportsView from '../views/reportsView.vue';

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
                component: () => import("../views/loginView.vue"),
                name: "Login"
            },
            {
                path: "register",
                component: () => import("../views/registerView.vue"),
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
                path: "games",
                component: gamesView,
                name: 'games'
            },
            {
                path: "games/:gameId",
                component: gameInfoView,
                name: 'gameInfo'
            },
            {
                path: "categories",
                component: forumView,
                name: 'foro'
            },
            {
                path: "categories/:categoryId/threads",
                component: threadsView,
                name: 'threads'
            },
            {
                path: "threads/:threadId",
                component: threadView,
                name: 'thread'
            },
            {
                path: "quizzes",
                component: quizzesView,
                name: 'quizzes'

            },
            {
                path: "quizzes/:quizId",
                component: quizView,
                name: 'quiz'
            },
            {
                path: "admin",
                component: adminView,
                name: 'admin',
                meta: {
                    auth: true,
                }
            },
            {
                path: 'reports',
                component: reportsView,
                name: 'reports'
            },
            {
                path:'/:pathName(.*)',
                name: 'NotFound',
                component: () => import('../views/notFoundView.vue')
            },
            {
                path:'/notFound',
                name: '404',
                component: () => import('../views/notFoundView.vue')
            }
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
