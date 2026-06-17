<script setup>
  import { useUserStore } from "../stores/userStore.js";
  import api from '@/boot/axios.js';
  import { ref, onMounted } from "vue";
  import { formatRelativeDate } from "@/utils/date.js";
  import GameCard from "@/components/GameCard.vue";
  import GameCardSkeleton from "@/components/GameCardSkeleton.vue";

  const userStore = useUserStore();
  const threadsData = ref([]);
  const gamesData = ref([]);
  const isLoading = ref(true)
 
  const getNewestThreads = async () => {
    try {
      const {data} = await api({
        url: '/threads/newestThreads',
        method: 'GET'
      });
      threadsData.value = data.result;

      return threadsData
    } catch (error) {
      console.log("ERROR: ", error)
    }
  }

  const getNewestGames = async () => {
    try {
      const {data} = await api({
        url: '/games/?sortBy=createdAt&order=desc&resultsPerPage=10',
        method: 'GET'
      });
      gamesData.value = data.games
      return gamesData
    } catch (error) {
      console.log("ERROR: ", error)
    }
  }

  onMounted(async () => {
    const start = Date.now()
    try {
      await getNewestThreads()
      await getNewestGames()
      
    } catch (error) {
      console.log(error)
    } finally {
      isLoading.value = false

    }
  })
</script>
<!-- HACER SKELETON -->
<template>

  <div v-if="isLoading" class="flex flex-col max-w-[80%] mx-auto gap-5 md:gap-10 animate-pulse">
      <!-- Banner bienvenida -->
      <div class="flex flex-col gap-2 p-8 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
        <h1 class="font-bold h-9 md:h-10 md:w-1/3 rounded bg-gray-700"></h1>
        <h4 class="font-medium h-4 md:h-5 md:w-1/3 rounded bg-gray-700"></h4>
      </div>
      <!-- Hilos recientes -->
      <div class="text-white flex flex-col gap-5 md:gap-10">
        <div class="flex flex-row gap-1 items-center">
          <div class="w-1 h-6 md:h-10 rounded-2xl bg-neon-blue"></div>
          <h2 class="font-bold sm:text-xl md:text-4xl text-white">Hilos recientes</h2>
        </div>

        <div class="flex flex-col rounded-2xl border-[1px] divide-y-2 divide-white/10 border-white/10 bg-dark-surface"> 
          <template v-for="n in 5">
            <div class="flex flex-row items-center justify-between px-2 py-1">
              <div class="flex flex-row items-center gap-5 md:gap-10">
                <v-icon name="oi-comment-discussion" scale="1.6" class="text-neon-blue"/>
                <div class="flex flex-col gap-1">
                  <div class="h-6 md:h-7 w-44 md:w-96 rounded bg-gray-700"></div>
                  <div class="flex flex-row w-44 md:w-96 h-4 md:h-5 rounded bg-gray-700">
                  </div>
                </div>
              </div>
              <h4 class="w-20 h-4 md:h-5 rounded bg-gray-700"></h4>
            </div>
          </template>
          
        </div>
      </div>
      <!-- Juegos recientes -->
      <div class="text-white flex flex-col gap-5 md:gap-10">
        <div class="flex flex-row gap-1 items-center">
          <div class="w-1 h-6 md:h-10 rounded-2xl bg-neon-blue"></div>
          <h2 class="font-bold sm:text-xl md:text-4xl text-white">Juegos recientes</h2>
        </div>

        <!-- <div class="flex flex-row lg:grid lg:grid-cols-5 gap-10 overflow-x-auto"> -->
        <div class="flex flex-row grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:grid gap-10 overflow-x-auto">
          <template v-for="n in 10">
            <GameCardSkeleton />
          </template>
        </div>
      </div>
  </div>
  <div v-else class="flex flex-col max-w-[80%] mx-auto gap-5 md:gap-10">
      <!-- Banner bienvenida -->
      <div class="flex flex-col gap-2 p-8 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
        <h1 class="font-bold text-3xl md:text-4xl text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">{{userStore.token ? `¡Bienvenido,  ${userStore.user}!` : '¡Únete y forma parte de la comunidad'}}</h1>
        <h4 class="font-medium text-xs md:text-sm text-gray-400">Descubre las últimas discusiones, guías y reseñas de tus títulos favoritos.</h4>
      </div>
      <!-- Hilos recientes -->
      <div class="text-white flex flex-col gap-5 md:gap-10">
        <div class="flex flex-row gap-1 items-center">
          <div class="w-1 h-6 md:h-10 rounded-2xl bg-neon-blue"></div>
          <h2 class="font-bold sm:text-xl md:text-4xl text-white">Hilos recientes</h2>
        </div>

        <div class="flex flex-col rounded-2xl border-[1px] divide-y-2 divide-white/10 border-white/10 bg-dark-surface"> 
          <template v-for="thread in threadsData">
            <div class="flex flex-row items-center justify-between px-2 py-1">
              <div class="flex flex-row items-center gap-5 md:gap-10">
                <v-icon name="oi-comment-discussion" scale="1.6" class="text-neon-blue"/>
                <div class="flex flex-col gap-1">
                  <RouterLink v-bind:to="{name: 'thread', params: {threadId: thread._id}}" class="font-semibold text-base md:text-lg text-white hover:underline">{{ thread.title }}</RouterLink>
                  <div class="flex flex-row font-medium text-xs md:text-sm text-gray-400 gap-1">
                    <span>por <RouterLink v-bind:to="{name: 'profile', params: {userId: thread.user._id}}" class="font-medium text-gray-400 hover:text-neon-blue hover:underline">{{thread.user.userName}}</RouterLink></span>
                    <h4>{{formatRelativeDate(thread.createdAt)}}</h4>
                  </div>
                </div>
              </div>
              <h4 class="font-medium text-center text-xs md:text-sm text-gray-400"> {{thread.numReplies}} respuestas</h4>
            </div>
          </template>
        </div>
      </div>
      <!-- Juegos recientes -->
      <div class="text-white flex flex-col gap-5 md:gap-10">
        <div class="flex flex-row gap-1 items-center">
          <div class="w-1 h-6 md:h-10 rounded-2xl bg-neon-blue"></div>
          <h2 class="font-bold sm:text-xl md:text-4xl text-white">Juegos recientes</h2>
        </div>

        <!-- <div class="flex flex-row lg:grid lg:grid-cols-5 gap-10 overflow-x-auto"> -->
        <div class="flex flex-row grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:grid gap-10 overflow-x-auto p-5">
          <template v-for="game in gamesData">
            <GameCard :gameId="game._id" :name="game.name" :mainImage="game.mainImage.secure_url" :overall="game.rating.overall" :genres="game.genres" />
          </template>
        </div>
      </div>
  </div>
</template>
