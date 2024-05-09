<script setup>
import {RouterLink, useRouter} from "vue-router"
import { useUserStore } from "../stores/userStore.js";

const userStore = useUserStore();
const router = useRouter();

const logout = () => {
    userStore.logout()
    router.push("/login")
}
</script>

<template>
    <header class="text-gray-600 body-font">
        <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
            <a class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linecap="round"
                    stroke-linejoin="round" stroke-width="2" class="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
                    viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span class="ml-3 text-xl">Quest Gamer</span>
            </a>
            <nav class="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
                <RouterLink to="/" class="mr-5 hover:text-gray-900">Home</RouterLink>
                <a class="mr-5 hover:text-gray-900">Second Link</a>
                <RouterLink to="/protected" class="mr-5 hover:text-gray-900" v-if="userStore.token">Protected</RouterLink>
                <RouterLink to="/about" class="mr-5 hover:text-gray-900">About</RouterLink>
            </nav>
            <nav class="inline-flex flex-wrap items-center py-1 px-3 focus:outline-none text-base">
                <RouterLink to="/login" class="mr-5 hover:text-gray-900" v-if="!userStore.token">Login</RouterLink>
                <RouterLink to="/logout" @click="logout" class="mr-5 hover:text-gray-900" v-if="userStore.token">Logout</RouterLink>
                <RouterLink to="/register" class="mr-5 hover:text-gray-900" v-if="!userStore.token">Registro</RouterLink> 

            </nav>
        </div>
    </header>
    <div class="flex justify-center">
        <RouterView class="w-full"/>
    </div>
</template>