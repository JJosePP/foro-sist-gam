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
            type: Number,
            required: true
        },
        genres: {
            type: [{
                id: {String, required: true},
                name: {String, required: true}
            }],
            required: true
        }
    });

</script>
<!-- HACER RESPONSIVE -->
<template>
    <div class="flex flex-col rounded-xl border-[1px] border-neon-blue/30 overflow-hidden w-full max-w-[270px]">
        <!-- Imagen -->
        <div class="flex flex-row w-full h-full">
            <img v-bind:src="mainImage" class="w-full h-full object-cover"/>
        </div>
        <!-- Datos juego -->
        <div class="flex flex-col px-2 py-5 bg-dark-surface">
            <h2 class="font-bold text-2xl text-white truncate">{{ name }}</h2>
            <div class="flex flex-row gap-2">
                <!-- Rating -->
                <div class="flex flex-row gap-1 p-1 border-[1px] border-white/10 rounded-xl items-center">
                    <span class="px-3 py-1 bg-neon-blue font-bold text-xl text-dark-base rounded-xl">{{ overall  || "--"}}</span>
                    <h2 class="font-bold text-xs text-neon-blue">RATING</h2>
                </div>
                <!-- Generos -->
                <div class="flex flex-col gap-1">
                    <h2 class="font-bold text-[8px] text-neon-blue border-b-[1px] border-neon-blue w-full text-center">GÉNEROS</h2>
                    <div class="flex flex-row gap-[2px] font-bold text-[8px] text-white flex-wrap justify-center">
                        <template v-for="genre in genres">
                            <span>{{ genre.name }}</span>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>