<script setup>
    const props = defineProps({
        gameId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        mainImage: {
            type: String,
            required: true
        },
        overall: {
            type: [Number, null],
            required: true
        },
        genres: {
            type: Array,
            required: true
        }
    });

</script>
<!-- HACER SKELETON -->
<template>
    <RouterLink :to="{name: 'gameInfo', params:{gameId: gameId}}" class="flex flex-col rounded-xl border-[1px] border-neon-blue/30 overflow-hidden w-[270px] flex-shrink-0 sm:w-full max-w-[270px] hover:scale-105 hover:border-neon-blue hover:shadow-[0_0_10px_rgba(0,212,255,0.5)] transition-transform duration-300">
        <!-- Imagen -->
        <div v-bind:id="gameId" class="flex flex-row w-full h-full">
            <img v-bind:src="mainImage" class="w-full h-full object-cover"/>
        </div>
        <!-- Datos juego -->
        <div class="flex flex-col px-2 py-5 bg-dark-surface">
            <h2 class="font-bold text-xl md:text-2xl text-white truncate">{{ name }}</h2>
            <div class="flex flex-row gap-2">
                <!-- Rating -->
                <div class="flex flex-row gap-1 p-1 border-[1px] border-white/10 rounded-xl items-center">
                    <span class="px-3 py-1 bg-neon-blue font-bold text-xl text-dark-base rounded-xl">{{ overall  || "--"}}</span>
                    <h2 class="font-bold text-xs text-neon-blue">RATING</h2>
                </div>
                <!-- Generos -->
                <div class="flex flex-col gap-1 max-h-12">
                    <h2 class="font-bold text-[8px] text-neon-blue border-b-[1px] border-neon-blue w-full text-center">GÉNEROS</h2>
                    <div class="flex flex-row gap-[2px] font-bold text-[8px] text-white flex-wrap justify-center overflow-auto">
                        <template v-for="genre in genres">
                            <span class="flex">{{ genre.name }}</span>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </RouterLink>
</template>