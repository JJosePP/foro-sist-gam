<script setup>
    import SearchBar from '@/components/SearchBar.vue';
    import { computed, onMounted, ref } from 'vue';
    import api from '@/boot/axios.js';
    import GameCard from "@/components/GameCard.vue";
    import GameCardSkeleton from "@/components/GameCardSkeleton.vue";

    const filterIsOpen = ref(false);
    const searchTerm = ref("")
    const genres = ref([]);
    const platforms = ref([]);
    const games = ref([])
    const sortBy = ref('name');
    const order = ref('asc')
    const filterPlatforms = ref([])
    const filterGenres = ref([])
    const currentPage = ref(1);
    const hasNextPage = ref(false);
    const totalPages = ref(1)
    const isLoading = ref(true)

    const genresToUrl = computed (() => {
        let url = ''
        for (let genre of filterGenres.value) {
            url = url.concat(`&genres=${genre}`)
        }
        console.log(url)
        return url
    })
    const platformsToUrl = computed (() => {
        let url = ''
        for (let platform of filterPlatforms.value) {
            url = url.concat(`&platforms=${platform}`)
        }
        console.log(url)
        return url
    })

    const visiblePages = computed(() => {
        const pages = [];
        const total = totalPages.value;
        const current = currentPage.value;
        const delta = 1; //numero de paginas alrededor de la actual

        const left = Math.max(2, current - delta);
        const rigth = Math.max(2, current + delta)
        
        //se mete la primera pagina siempre
        pages.push(1); 

        //puntos suspensivos izquierda
        if(left > 2){
            pages.push('...');
        }

        // paginas del medio
        for(let i=left; i <= rigth; i++){
            if(i < total){
                pages.push(i)
            }
        }

        //puntos suspensivos derecha
        if(rigth < total -1){
            pages.push('...')
        }

        // ultima pagina (si hay mas de 1)
        if(total > 1){
            pages.push(total)
        }
        return pages
    })

    const handelClickFilterButton = () => {
        filterIsOpen.value = !filterIsOpen.value;
        console.log(filterIsOpen.value)
        console.log(searchTerm.value)
    }

    const getGenres = async () => {
        try {
            const {data} = await api({
                url: '/genres',
                methot: 'GET'
            });
            genres.value = data.result;
            return genres
        } catch (error) {
            console.log("ERROR: ", error)
        }
    }
    const getPlatforms = async () => {
        try {
            const {data} = await api({
                url: '/platforms',
                method: 'GET'
            })
            platforms.value = data.result;
            return platforms
        } catch (error) {
            console.log("ERROR: ", error)
        }
    }
    const getGames = async () => {
        try {
            let url = `/games/?sortBy=${sortBy.value}&order=${order.value}`
            if(searchTerm.value){
                url += `&search=${searchTerm.value}`
            }
            if(filterGenres.value.length > 0){
                url += genresToUrl.value
            }
            if(filterPlatforms.value.length > 0){
                url += platformsToUrl.value
            }
            url += `&page=${currentPage.value}`
            const {data} = await api({
                url: url,
                method: 'GET'
            });

            games.value = data.games
            currentPage.value = data.currentPage
            hasNextPage.value = data.hasNextPage
            totalPages.value = data.totalPages

            return games
        } catch (error) {
            console.log("ERROR: ", error)
        }
    }

    const handleSearch = async (term) => {
        searchTerm.value = term
        currentPage.value = 1

        await getGames()
    }
    const applyFilter = async () => {
        currentPage.value = 1
        await getGames()
    }

    const goToPage = async (page) => {
        currentPage.value = page;
        await getGames()
    }
    onMounted( async() => {
        try {
            await getGenres()
            await getPlatforms()
            await getGames()
            
        } catch (error) {
            console.log(error)  
        } finally {
            isLoading.value = false
        }
    })
</script>

<template>
    <div class="flex flex-col max-w-[80%] mx-auto gap-5 md:gap-10">
        <!-- buscador y boton filtro -->
        <div class="flex flex-row items-center gap-2">
            <SearchBar termToSearch="nombre" v-model="searchTerm" @search="handleSearch"/>
            <v-icon name="ri-filter-fill" scale="1.2" class="text-white/70" @click="handelClickFilterButton"/>
        </div>

        <!-- contenedor filtro+boton -->
        <!-- <div v-show="filterIsOpen" class="flex flex-col gap-2 w-full text-white"> -->
            <!-- contenedor solo filtro -->
            <div v-show="filterIsOpen" class="flex flex-row text-white bg-dark-surface w-full rounded-2xl border-[1px] border-neon-blue/30 divide-x-[1px] divide-neon-blue/30">
                <!-- Contenedo Generos -->
                <div class="flex flex-col w-1/2 divide-y-[1px] divide-neon-blue/30">
                    <h2 class="text-center font-semibold">Género</h2>
                    <div class="grid grid-cols-1 max-h-[520px] overflow-auto md:max-h-none md:grid-cols-3 p-1 gap-x-1 gap-y-1">
                        <template v-for="genre in genres">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" v-model="filterGenres" :id="`checkbox-${genre._id}`" :value="genre._id"/>
                                <label class="label-text cursor-pointer flex flex-col text-sm font-medium" :for="`checkbox-${genre._id}`" >{{ genre.name }}</label>
                            </div>
                        </template>
                        <!-- <div class="flex gap-2">
                            <input type="checkbox" id="checkboxLabel"/>
                            <label class="label-text cursor-pointer flex flex-col" for="checkboxLabel"></label>
                        </div> -->
                    </div>
                </div>

                <!-- Contenedor Plataforma+orden -->
                <div class="flex flex-col w-1/2">
                    <!-- Contenedor Plataformas -->
                    <div class="flex flex-col divide-y-[1px] divide-neon-blue/30">
                        <h2 class="text-center font-semibold">Plataforma</h2>
                        <div class="grid grid-cols-1 max-h-80 overflow-auto md:grid-cols-3 md:max-h-none p-1 gap-x-1 gap-y-1">
                            <template v-for="platform in platforms">
                                <div class="flex items-center gap-2">
                                    <input type="checkbox" v-model="filterPlatforms" :id="`checkbox-${platform._id}`" :value="platform._id"/>
                                    <label class="label-text cursor-pointer flex flex-col text-sm font-medium" :for="`checkbox-${platform._id}`">{{ platform.name }}</label>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Contenedor orden -->
                    <div class="flex flex-col divide-y-[1px] divide-neon-blue/30">
                        <h2 class="text-center font-semibold">Orden</h2>
                        <div class="grid grid-cols-1 overflow-auto md:grid-cols-3 p-1 gap-x-1 gap-y-1">
                            <div class="flex items-center gap-2">
                                <input type="radio" v-model="sortBy" id="radio-name" name="sortBy" value="name"/>
                                <label class="label-text cursor-pointer flex flex-col text-sm font-medium" for="radio-name" >Nombre</label>
                            </div>
                            <div class="flex items-center gap-2">
                                <input type="radio" v-model="sortBy" id="radio-releaseDate" name="sortBy" value="releaseDate"/>
                                <label class="label-text cursor-pointer flex flex-col text-sm font-medium" for="radio-releaseDate" >Fecha de lanzamiento</label>
                            </div>
                            <div class="flex items-center gap-2">
                                <input type="radio" v-model="sortBy" id="radio-rating" name="sortBy" value="rating.overall"/>
                                <label class="label-text cursor-pointer flex flex-col text-sm font-medium" for="radio-rating" >Puntuación</label>
                            </div>
                            <div class="flex items-center gap-2">
                                <input type="radio" v-model="order" id="radio-ascOrder" name="order" value="asc"/>
                                <label class="label-text cursor-pointer flex flex-col text-sm font-medium" for="radio-ascOrder">Orden ascendente</label>
                            </div>
                            <div class="flex items-center gap-2">
                                <input type="radio" v-model="order" id="radio-descOrder" name="order" value="desc"/>
                                <label class="label-text cursor-pointer flex flex-col text-sm font-medium" for="radio-descOrder">Orden descendente</label>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-center items-center h-full p-2">
                        <button class="px-6 py-1 rounded-md font-semibold text-black text-xl bg-neon-blue" @click="applyFilter">Filtrar</button>
                    </div>
                </div>
            </div>
            <!-- <div class="flex justify-center">
                <button class="px-6 py-1 rounded-md font-semibold text-black text-xl bg-neon-blue" @click="applyFilter">Filtrar</button>
            </div> -->
        <!-- </div> -->

        <!-- Juegos -->
        <div class="text-white flex flex-col gap-5 md:gap-10">
            <div class="flex flex-row items-center justify-between">
                <div class="flex flex-row gap-1">
                    <div class="w-1 h-6 md:h-10 rounded-2xl bg-neon-blue"></div>
                    <h2 class="font-bold sm:text-xl md:text-4xl text-white">Juegos</h2>
                </div>
                <div v-if="isLoading" class="flex gap-2 pe-5">
                    <button v-for="n in 4" class="px-3 py-1">
                        {{ n }}
                    </button>
                </div>
                <div v-else class="flex gap-0.5 pe-5">
                    <!-- <template v-for="n in totalPages">
                        <button class="font-bold">{{ n }}</button>
                    </template> -->
                    <button v-for="page in visiblePages"
                        :key="page + Math.random()"
                        :disabled="page === '...'"
                        @click="typeof page === 'number' && goToPage(page)"
                        class="px-1 py-1"
                        :class="{'text-neon-blue font-bold': page === currentPage}"
                    >
                        {{ page }}
                    </button>
                </div>
            </div>

            <div v-if="isLoading" class="flex flex-row grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:grid gap-10 overflow-x-auto p-5">
                <template v-for="n in 20">
                    <GameCardSkeleton/>
                </template>
            </div>
            <div v-else class="flex flex-row grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:grid gap-10 overflow-x-auto p-5">
                <!-- <template v-for="game in games">
                    <GameCard :gameId="game._id" :name="game.name" :mainImage="game.mainImage.secure_url" :overall="game.rating.overall" :genres="game.genres" />
                </template> -->
                <GameCard v-for="game in games" :gameId="game._id" :name="game.name" :mainImage="game.mainImage.secure_url" :overall="game.rating.overall" :genres="game.genres"/>
            </div>
        </div>
    </div>

</template>