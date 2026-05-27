<script setup>
  import { useUserStore } from "../stores/userStore.js";
  import api from '@/boot/axios.js';
  import { ref, onMounted } from "vue";
  import { formatRelativeDate } from "@/utils/date.js";
  import GameCard from "@/components/GameCard.vue";

  const userStore = useUserStore();
  const threadsData = ref([]);
  const gamesData = ref([]);

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
    await getNewestThreads()
    console.log(threadsData.value)
    await getNewestGames()
    console.log("JUEGOS: ", gamesData.value)
  })
</script>
<!-- HACER RESPONSIVE Y SKELETON -->
<template>
  <div class="flex flex-col max-w-[80%] mx-auto gap-10">
      <!-- Banner bienvenida -->
      <div class="flex flex-col gap-2 p-8 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
        <!-- CAMBIAR MENSAJE BANNER SI NO ESTÁ LOGEADO -->
        <!-- <h1 class="font-bold text-4xl text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">¡Bienvenido, {{ userStore.user }}!</h1> -->
        <h1 class="font-bold text-4xl text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">{{userStore.token ? `¡Bienvenido,  ${userStore.user}!` : '¡Únete y forma parte de la comunidad'}}</h1>
        <h4 class="font-medium text-sm text-gray-400">Descubre las últimas discusiones, guías y reseñas de tus títulos favoritos.</h4>
      </div>
      <!-- Hilos recientes -->
      <div class="text-white flex flex-col gap-10">
        <div class="flex flex-row gap-1 items-center">
          <div class="w-1 h-8 rounded-2xl bg-neon-blue"></div>
          <h2 class="font-bold text-2xl text-white">Hilos recientes</h2>
        </div>

        <div class="flex flex-col rounded-2xl border-[1px] divide-y-2 divide-white/10 border-white/10 bg-dark-surface"> 
          <template v-for="thread in threadsData">
            <div class="flex flex-row items-center justify-between px-2 py-1">
              <div class="flex flex-row items-center gap-10 p">
                <v-icon name="oi-comment-discussion" scale="1.8" class="text-neon-blue"/>
                <div class="flex flex-col gap-1">
                  <RouterLink v-bind:to="{name: 'thread', params: {threadId: thread._id}}" class="font-semibold text-lg text-white hover:underline">{{ thread.title }}</RouterLink>
                  <div class="flex flex-row font-medium text-sm text-gray-400 gap-1">
                    <span>por <RouterLink v-bind:to="{name: 'profile', params: {userId: thread.user._id}}" class="font-medium text-sm text-gray-400 hover:text-neon-blue hover:underline">{{thread.user.userName}}</RouterLink></span>
                    <h4>• hace {{formatRelativeDate(thread.createdAt)}}</h4>
                  </div>
                </div>
              </div>
              <h4 class="font-medium text-sm text-gray-400"> {{thread.numReplies}} respuestas</h4>
            </div>
          </template>
        </div>
      </div>
      <!-- Juegos recientes -->
      <div class="text-white flex flex-col gap-10">
        <div class="flex flex-row gap-1 items-center">
          <div class="w-1 h-8 rounded-2xl bg-neon-blue"></div>
          <h2 class="font-bold text-2xl text-white">Juegos recientes</h2>
        </div>

        <div class="flex flex-row lg:grid lg:grid-cols-5 gap-10 ">
          <template v-for="game in gamesData">
            <GameCard :gameId="game._id" :name="game.name" :mainImage="game.mainImage.secure_url" :overall="game.rating.overall" :genres="game.genres" />
          </template>
        </div>
      </div>
  </div>
</template>
