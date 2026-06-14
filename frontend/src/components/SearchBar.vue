<script setup>
    import api from '@/boot/axios';
    import { onUnmounted, ref, watch } from 'vue';
    import {useRouter} from 'vue-router';
    
    const router = useRouter();
    const props = defineProps({
        termToSearch: {
            type: String,
            required: true
        }
    })
    const emit = defineEmits(['search']);
    const searchTerm = defineModel({
        type: String,
        default: ''
    })
    let debounceTimer = null;
    const suggestions = ref([]);
    let abortController = null;
    if(props.termToSearch === "nombre"){

        watch(searchTerm, (value) => {
            if(debounceTimer){
                console.log("antes de clear ",debounceTimer)
                clearTimeout(debounceTimer)
                console.log("justo despues de clear ", debounceTimer)
            }
            // clearTimeout(debounceTimer);
    
            debounceTimer = setTimeout(async() => {
                if(!value){
                    suggestions.value = [];
                    return;
                }
                if(abortController){
                    abortController.abort()
                }
                abortController = new AbortController()
    
                try {
                    const {data} = await api({
                        url: `/games/search?search=${value}`,
                        method: 'GET',
                        signal: abortController.signal
                    });
                    console.log(data.result)
                    suggestions.value = data.result;    
                } catch (error) {
                    if(error.name === "CanceledError"){
                        return;
                    }
                    console.error(error);
                }
            }, 300);
            console.log("DEBOUNCE: ",debounceTimer)
        });
    }

    const selectGame = (game) => {
        console.log("Juego seleccionado:", game);
        searchTerm.value = game.name;
        suggestions.value = [];
        router.push({name: 'gameInfo', params: {gameId: game._id}})
    };

    const handleEnter = () => {
        emit('search', searchTerm.value)
        suggestions.value = []
    }

    onUnmounted(() => {
        clearTimeout(debounceTimer);
    });
</script>

<template>
    <div class="w-[600px] relative">
        <div class="flex flex-row items-center gap-2 p-2 rounded-2xl border-[1px] border-neon-blue/30 bg-dark-surface focus-within:border-neon-blue focus-within:shadow-[0_0_10px_rgba(0,212,255,0.5)]">
            <v-icon name="bi-search" scale="1.3" class="text-white/70"/>
            <input type="text" v-model="searchTerm" @keyup.enter="handleEnter" class="bg-dark-surface font-medium text-white w-full placeholder:text-white/30 outline-none" v-bind:placeholder="`Buscar por ${termToSearch}`"/>    
        </div>

        <!-- quitar el onclick y poner routerlink para que me lleve a la vista del juego -->
        <ul v-if="suggestions.length" class=" bg-dark-surface rounded-2xl m-0 p-0 absolute w-full divide-y-2 divide-white/10 z-10">
            <li class="text-white p-2 cursor-pointer hover:bg-neon-blue hover:text-black" v-for="game in suggestions"
                :key="game._id"
                @click="selectGame(game)">
                {{ game.name }}
            </li>
        </ul>
    </div>

</template>