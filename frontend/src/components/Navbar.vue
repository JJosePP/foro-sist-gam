<script setup>
import {RouterLink, useRouter, useRoute} from "vue-router"
import { useUserStore} from "../stores/userStore.js";
import { ref, computed, onMounted, onUnmounted } from "vue";

// const isHomeActive = ref(true);
// const isGamesActive = ref(false);
// const isForumActive = ref(false);
// const isQuizzActive = ref(false);
// const activeNav = ref('Home');
// const activeStyle = 'hover:text-neon-blue border-b-2 border-b-neon-blue text-neon-blue';
// const tabs = [
//     {name: 'Home', label: 'INICIO', to: '/'},
//     {name: 'Games', label: 'JUEGOS', to: '/games'},
//     {name: 'Forum', label: 'FORO', to: '/forum'},
//     {name: 'Quizzes', label: 'RETOS', to: '/quizzes'}]
const userStore = useUserStore();
const router = useRouter();
const isOpen = ref(false);
const authGroupIsOpen = ref(false);
const activeClass = "text-neon-blue";
const tabs = computed(() => {
    const baseTabs = [
        { name: 'home', label: 'INICIO', to: '/' },
        { name: 'games', label: 'JUEGOS', to: '/games' },
        { name: 'forum', label: 'FORO', to: '/categories' },
        { name: 'quizzes', label: 'RETOS', to: '/quizzes' },
    ]

    if(userStore.isModOrAdmin){
        baseTabs.push({
            name: 'reports',
            label: 'REPORTES',
            to: '/reports'
        })
    }
    if (userStore.isAdmin) {
        baseTabs.push({
            name: 'admin',
            label: 'PANEL DE ADMINISTRADOR',
            to: '/admin'
        })
    }

    return baseTabs
})


// const isDesktop = computed(()=> window.innerWidth>=768)
// const isDesktop = ref(window.innerWidth >= 768)
// const handleResize = () => {
//     isDesktop.value = window.innerWidth >= 768
// }
const handleResize = () => {
    if(window.innerWidth >= 768){
        isOpen.value = false
        authGroupIsOpen.value = false
    }
}



onMounted(() => {
    window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})
// const route = useRoute();

// function selectTab(tab) {
//     isHomeActive.value = false;
//     isGamesActive.value = false;
//     isForumActive.value = false;
//     isQuizzActive.value = false;

//     switch(tab){
//         case "Home":
//             isHomeActive.value = true;
//             break;
//         case "Games":
//             isGamesActive.value = true;
//             break;
//         case "Forum":
//             isForumActive.value = true;
//             break;
//         case "Quizz":
//             isQuizzActive.value = true;
//             break;
//         default:
//             break;
//     }
// }
const logout = () => {
    userStore.logout()
    router.push("/")
}

const handleClickBurgerButton = () => {
    isOpen.value = !isOpen.value;
    if(authGroupIsOpen.value){
        authGroupIsOpen.value = false
    }
}
const handleClickUserButton = () => {
    authGroupIsOpen.value = !authGroupIsOpen.value;
    if(isOpen){
        isOpen.value = false
    }
}
</script>

<template>
    <header class="flex flex-wrap md:flex-nowrap flex-row items-center gap-2 justify-between px-6 py-3 bg-dark-surface font-heading text-gray-400">
        <!-- logo -->
        <div class="flex flex-row items-center gap-[15px]">
            <div class="w-[40px] h-[40px] bg-gradient-to-br from-neon-blue to-neon-purple rounded flex items-center justify-center">
                <span class="text-white font-bold text-2xl/6 font-rajdhani">QG</span>
            </div>
            <div class="font-bold text-[32px] font-rajdhani">
            <span class="text-white">Quest<span class="text-neon-blue">Gamer</span></span>
            </div>
        </div>
        
        <div class="flex items-center justify-between gap-2 md:hidden">
            <button class="text-3xl hover:text-neon-blue" :class="{[activeClass]: isOpen}" @click="handleClickBurgerButton">☰</button>
            <button class="hover:text-neon-blue" :class="{[activeClass]: authGroupIsOpen}" @click="handleClickUserButton"><v-icon name="fa-user-alt" scale="1.5"/></button>
        </div>
        
        <!-- navbar mobile -->
        <Transition name="mobile-menu">
            <nav v-show="isOpen" class="flex flex-col gap-3 font-heading text-base text-gray-400 w-full md:hidden">
                <RouterLink
                    v-for="tab in tabs"
                        :key="tab.name"
                        :to="tab.to"
                        exact-active-class="border-b-2 border-b-neon-blue text-neon-blue"
                        class="hover:text-neon-blue"
                        @click="isOpen = false"
                >
                    {{ tab.label }}
                </RouterLink>
            </nav>
        </Transition>
        <!-- nav bar desktop -->
        <nav class="hidden md:flex md:flex-row gap-3 font-heading md:text-xs lg:text-base">
            <RouterLink
                v-for="tab in tabs"
                :key="tab.name"
                :to="tab.to"
                exact-active-class="border-b-2 border-b-neon-blue text-neon-blue"
                class="hover:text-neon-blue"
            >
                {{ tab.label }}
            </RouterLink>
        </nav>
        <!-- auth buttons -->
        <!-- auth mobile -->
        <Transition name="mobile-menu">
            <div v-show="authGroupIsOpen" class="flex flex-col gap-3 items-center text-base w-full md:hidden">
                <RouterLink v-if="userStore.token" v-bind:to="{name: 'profile', params: {userId: userStore.userId}}" class="box-content size-[50px] overflow-hidden border border-neon-blue rounded-full"><img class="w-full h-full object-cover " v-bind:src="userStore.profilePic"></RouterLink>
                <RouterLink to="/login" v-if="!userStore.token" class="font-semibold hover:text-neon-blue">Iniciar sesión</RouterLink>
                <RouterLink to="/register" v-if="!userStore.token" class="bg-neon-blue px-[24px] py-[8px] rounded-md text-dark-base font-bold hover:bg-opacity-80 transition-all transform hover:scale-105">Registrarse</RouterLink>
                <button v-on:click="logout" v-if="userStore.token">Cerrar sesión</button>
            </div>
        </Transition>
        <!-- <Transition name="mobile-menu">
            <div :class="['md:flex-row md:flex items-center gap-[15px] text-base text-gray-200 w-full md:w-auto md:justify-end', authGroupIsOpen ? 'flex flex-col' : 'hidden',]">
                <RouterLink v-if="userStore.token" v-bind:to="{name: 'profile', params: {userId: userStore.userId}}" class="box-content size-[50px] overflow-hidden border border-neon-blue rounded-full bg-green-300"><img class="w-full h-full object-cover " v-bind:src="userStore.profilePic"></RouterLink>
                <RouterLink to="/login" v-if="!userStore.token" class="font-semibold hover:text-neon-blue">Iniciar sesión</RouterLink>
                <RouterLink to="/register" v-if="!userStore.token" class="bg-neon-blue px-[24px] py-[8px] rounded-md text-dark-base font-bold hover:bg-opacity-80 transition-all transform hover:scale-105">Registrarse</RouterLink>
                <button v-on:click="logout" v-if="userStore.token">Cerrar sesión</button>
            </div>
        </Transition> -->
        <!-- auth desktop -->
        <div class="hidden md:flex md:flex-row items-center gap-3 md:text-xs lg:text-base w-full md:w-auto justify-end">
            <RouterLink v-if="userStore.token" v-bind:to="{name: 'profile', params: {userId: userStore.userId}}" class="box-content size-[50px] overflow-hidden border border-neon-blue rounded-full">
                <img class="w-full h-full object-cover" v-bind:src="userStore.profilePic"></RouterLink>
            <RouterLink to="/login" v-if="!userStore.token" class="font-semibold hover:text-neon-blue">Iniciar sesión</RouterLink>
            <RouterLink to="/register" v-if="!userStore.token" class="bg-neon-blue px-[24px] py-[8px] rounded-md text-dark-base font-bold hover:bg-opacity-80 transition-all transform hover:scale-105">Registrarse</RouterLink>
            <button v-on:click="logout" v-if="userStore.token">Cerrar sesión</button>
        </div>


        
    </header>
</template>

<style scoped>
    .mobile-menu-enter-active,
    .mobile-menu-leave-active {
        transition: all 0.3s ease;
    }

    .mobile-menu-enter-from,
    .mobile-menu-leave-to {
        opacity: 0;
        transform: translateY(-10px);
    }
</style>