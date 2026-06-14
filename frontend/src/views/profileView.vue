<script setup>
    import {RouterLink, useRoute} from 'vue-router'
    import { useUserStore } from '../stores/userStore.js'
    import api from '@/boot/axios.js';
    import { ref, onMounted, onBeforeMount, h, watch, computed } from 'vue';

    const route = useRoute()
    const userStore = useUserStore()
    const userData = ref({})
    const isLoading = ref(true)
    // const MIN_SKELETON_TIME = 500
    const formattedDate = computed(() => {
        return new Date(userData.value.createdAt).toLocaleDateString()
    })
    const isActiveUserProfile = computed(() => {
        return userStore.userId === route.params.userId
    }) 
    const numBadges = computed(() => {
        return userData.value.completedQuizzes?.length ?? 0
    })
    const numQuizzes = ref(0);
    const getData = async () =>{ 
        // const start = Date.now()
        try {
            const {data} = await api({
                url: route.path,
                method: "GET",
                headers:{ 
                    Authorization: "Bearer " + userStore.token,
                }
            });

            userData.value = data.user
            console.log(userData.value)
            return userData
        } catch (error) {
            console.log("ERROR: ", error)
        }// } finally{
        //     // isLoading.value = false
        //     const elapsed = Date.now() - start
        //     const remaining = MIN_SKELETON_TIME - elapsed

        //     setTimeout(() => {
        //         isLoading.value = false
        //     }, Math.max(0, remaining))
        // }
    }

    //hacer endpoint en back, y hacer funcion aqui para llamar endpoint
    const getUserPosts = async () => {
        try{
            const {data} = await api({
                url: `posts/?user=${route.params.userId}`,
                method: 'GET',
                headers: {
                    Authorization: "Bearer " + userStore.token,
                }
            });
            userData.value.stats = data.result;
        }catch(error){
            console.log("ERROR: ", error)
        }
    }
    const getNumQuizzes = async () => {
        try {
            const {data} = await api({
                url: 'quizzes/totalQuizzes',
                method: 'GET',
                headers: {
                    Authorization: "Bearer " + userStore.token,
                }
                
            });
            numQuizzes.value = data.totalQuizzes
            return numQuizzes
        } catch (error) {
            console.log('ERROR: ', error)
        }
    }
    // const recentPosts = [
    //     {
    //         id: "fkofek",
    //         kind: "Review",
    //         game: {
    //             id:"fijeifje",
    //             name:"Elden RIng"
    //         }
    //     },
    //     {
    //         id:"DJKIEFJIE",
    //         kind: "Thread",
    //         title: "KDOWKD"
    //     },
    //     {
    //         id: "IJEFIEde",
    //         kind: "Reply",
    //         thread: {
    //             id:"OKDOE",
    //             title:"efiei"
    //         }
    //     }
    // ]
    //Esto es más optimo pero para aplicaciones pequeñas no se nota tanto y se debe hacer para todos las views que busquen datos. 
    // O se puede hacer tb lo que tengo en app.vue (routerlink key) que es menos optimo. Lo que hace es destruir el componente y volverlo a crear cada vez que cambia la key
    // watch(() => route.params.userId, async () => {
    //     await getData()
    // })
    onMounted(async () => {
        
        const start = Date.now()
        try {
            await getData()
            await getUserPosts()
            await getNumQuizzes()
        } catch (error) {
            console.log(error)
        } finally {
            isLoading.value = false
            // const elapsed = Date.now() - start
            // const remaining = MIN_SKELETON_TIME - elapsed

            // setTimeout(() => {
            //     isLoading.value = false
            // }, Math.max(0, remaining))
        }
    })
    // const getData2 = () => {
    //     api({
    //         url: "/profile",
    //         method: "GET",
    //         headers:{ 
    //             Authorization: "Bearer " + userStore.token,
    //         }
    //     }).then(res => {
    //         userData.value = res.data.user
    //         console.log(userData.value)
    //     })
    // }


    // onMounted(async () => {
    //     //userData.value = await getData()
    //     getData2()
    //     //console.log(userData.value.userName)
    // })
    // onBeforeMount(async () => {
    //     userData.value = await getData()
    //     console.log(userData.value.userName)
    // })
    // console.log(userStore.user.toLowerCase() == route.params.username.toLowerCase())
    // console.log(userStore.user.toLocaleLowerCase())
    // console.log(userStore.user)
    // console.log(localStorage.getItem("user"))
    // console.log(route.params.username)
    //console.log(userData.value.userName)
</script>

<template>
    <div v-if="isLoading" class="max-w-[80%] mx-auto animate-pulse">
        <div class=" grid grid-cols-1 lg:grid-cols-[0.5fr_1fr] gap-3 lg:gap-0">
            <!-- Frame66 -->
            <div class="flex flex-col col-span-1 row-span-1 px-4 lg:px-12 gap-3 w-full "> 
                <!-- Frame71 PERFIL-->
                <div class="flex flex-col items-center gap-[10px] py-[25px] px-[25px] bg-dark-surface border-[1px] rounded-2xl border-neon-blue/30">
                    <!-- Perfil -->
                    <div class="flex flex-col w-32 h-32 sm:w-48 sm:h-48 lg:w-[215px] lg:h-[215px] drop-shadow-[0_15px_30px_rgba(0,212,255,0.6)]">

                        <div class="w-full h-full rounded-full border-2 border-neon-blue bg-gray-700"></div>
                    </div>

                    <!-- NOMBRE + FECHA -->
                    <div class="flex flex-col items-center w-full p-2 gap-2 overflow-hidden">
                        <!-- <h1 class="font-bold text-2xl sm:text-4xl text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)] bg-gray-700"></h1> -->
                        <h1 class="bg-gray-700 h-6 w-16 sm:h-10 sm:w-40 rounded"></h1>
                        <div class="flex flex-row gap-2 items-center justify-center text-gray-400">
                            <v-icon name="bi-calendar4" scale="1"/>
                            <!-- <p class="text-xs sm:text-sm">Miembro desde <time :datetime="userData.createdAt">{{formattedDate}}</time></p> -->
                            <div class="bg-gray-700 h-3 w-32 sm:h-4 sm:w-36 rounded"></div>
                        </div>
                    </div>

                    <!-- BOTON EDITAR -->
                    <RouterLink v-if="isActiveUserProfile" v-bind:to="{name: 'editProfile', params: {userId: userData.userId}}" class="flex flex-row gap-1 sm:gap-2 p-2 sm:p-3 justify-center items-center rounded-2xl bg-neon-blue">
                        <v-icon name="oi-pencil" scale="1.3"/>
                        <!-- <h2 class="text-2xl font-semibold font-rajdhani">Editar perfil</h2> -->
                        <span class="text-lg sm:text-2xl font-semibold">Editar perfil</span>
                    </RouterLink>
                </div>
                <!-- ESTADISTICAS -->
                <div class="flex flex-col gap-2 p-5 bg-dark-surface border-[1px] rounded-2xl border-neon-blue/30">
                    <!-- Etiqueta estadisticas -->
                    <div class="flex flex-row py-1 gap-2 items-center text-neon-blue">
                        <v-icon name="md-barchart" scale="1.2" flip="horizontal"/>
                        <h2 class="font-bold text-base sm:text-xl text-white">ESTADISTICAS</h2>
                    </div>

                    <!-- HACER ENDPOINTS PARA ESTADISTICAS -->
                    <div class="grid grid-cols-1 md:grid-cols-2 px-6 gap-6">
                        <div class="flex flex-col py-4 px-8 items-center rounded-2xl bg-dark-base">
                            <!-- <h2 class="font-bold text-2xl sm:text-4xl text-white">100</h2> -->
                            <h2 class="bg-gray-700 h-6 w-9 sm:h-10 sm:w-14 rounded"></h2>
                            <h3 class="font-medium text-base sm:text-xl text-gray-400">POSTS</h3>
                        </div>
                        <div class="flex flex-col py-4 px-8 items-center rounded-2xl bg-dark-base">
                            <!-- <h2 class="font-bold text-2xl sm:text-4xl text-white">{{numBadges}}</h2> -->
                            <h2 class="bg-gray-700 h-6 w-9 sm:h-10 sm:w-14 rounded"></h2>
                            <h3 class="font-medium text-base sm:text-xl text-gray-400">INSIGNIAS</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col col-span-1 gap-3 lg:gap-12 row-span-1 w-full h-full px-4 lg:px-0"> 
                <div class="flex flex-col gap-6 p-6 border-[1px] rounded-2xl border-neon-blue/30 bg-dark-surface">
                    <div class="flex flex-row gap-2 items-center">
                        <v-icon name="fa-user-alt" scale="1.2" class="text-neon-blue"/>
                        <h2 class="font-bold text-base sm:text-xl text-white">SOBRE MI</h2>
                    </div>
                    <!-- <p class="font-medium text-sm sm:text-base text-gray-400 h-32">{{userData.description}}</p> -->
                    <p class="bg-gray-700 h-32 rounded"></p>
                </div>
                <div class="bg-dark-surface flex flex-col gap-6 p-6 border-[1px] rounded-2xl border-neon-blue/30">
                    <div class="flex flex-row gap-2 items-center">
                        <v-icon name="gi-achievement" scale="1.2" class="text-neon-blue"/>
                        <h2 class="font-bold text-base sm:text-xl text-white">EXPOSITOR</h2>
                    </div>
                    <div class="flex flex-row lg:grid lg:grid-cols-4 p-2 gap-4 max-h-80 overflow-x-auto lg:overflow-y-auto scrollbar ">
                    <!-- Hacer endpoint para saber el numero total de pruebas y hacer esto con v-for -->
                        <template v-for="n in numQuizzes">
                            <div class="flex flex-col items-center">
                                <div class="w-24 h-24 bg-gray-700 rounded-2xl"></div>
                                <h3 class="w-14 h-3 sm:w-20 sm:h-4 bg-gray-700 rounded text-sm sm:text-base"></h3>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="flex flex-col gap-6 p-6 border-[1px] rounded-2xl border-neon-blue/30 bg-dark-surface">
                    <div class="flex flex-row gap-2 items-center">
                        <v-icon name="bi-clock" scale="1.2" class="text-neon-blue"/>
                        <h2 class="font-bold text-base sm:text-xl text-white">ACTIVIDAD RECIENTE</h2>
                    </div>

                    <div class="flex flex-col gap-2">
                        <div class="flex gap-2 p-2 items-center">
                            <v-icon name="md-comment" scale="0.8" class="text-neon-blue" flip="horizontal"/>
                            <span class="bg-gray-700 w-52 h-3 sm:w-64 sm:h-4"></span>
                        </div>
                        <div class="flex gap-2 p-2 items-center">
                            <v-icon name="md-comment" scale="0.8" class="text-neon-blue" flip="horizontal"/>
                            <span class="bg-gray-700 w-52 h-3 sm:w-64 sm:h-4"></span>
                        </div>
                        <div class="flex gap-2 p-2 items-center">
                            <v-icon name="md-comment" scale="0.8" class="text-neon-blue" flip="horizontal"/>
                            <span class="bg-gray-700 w-52 h-3 sm:w-64 sm:h-4"></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="max-w-[80%] mx-auto">
        <!-- Frame64 -->
        <div class=" grid grid-cols-1 lg:grid-cols-[0.5fr_1fr] gap-3 lg:gap-0">
            <!-- Frame66 -->
            <div class="flex flex-col col-span-1 row-span-1 px-4 lg:px-12 gap-3 w-full "> 
                <!-- Frame71 PERFIL-->
                <div class="flex flex-col items-center gap-[10px] py-[25px] px-[25px] bg-dark-surface border-[1px] rounded-2xl border-neon-blue/30">
                    <!-- Perfil -->
                    <div class="flex flex-col w-32 h-32 sm:w-48 sm:h-48 lg:w-[215px] lg:h-[215px] drop-shadow-[0_15px_30px_rgba(0,212,255,0.6)]">
                        <!-- <div v-if="isLoading" class="animate-pulse">
                            <div class="md:w-[215px] md:h-[215px] bg-gray-700"></div>
                        </div>
                        <div v-else>
                            <img v-if="userData.profilePic" v-bind:src="userData.profilePic.secure_url" class="md:w-[215px] md:h-[215px] object-cover">
                        </div> -->
                        <img v-if="userData.profilePic" v-bind:src="userData.profilePic.secure_url" class="w-full h-full rounded-full border-2 border-neon-blue object-cover">
                    </div>
                    <!-- <div class="bg-indigo-300 text-center">
                        <h1 class="font-bold text-4xl text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">{{userData.userName}}</h1>
                        <p class="text-gray-400 text-sm"><v-icon name="bi-calendar4" scale="1"/>Miembro desde<time>12/02/2025</time></p>
                    </div> -->

                    <!-- NOMBRE + FECHA -->
                    <div class="flex flex-col text-center w-full p-2 gap-2 overflow-hidden">
                        <h1 class="font-bold text-2xl sm:text-4xl text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">{{userData.userName}}</h1>
                        <div class="flex flex-row gap-2 items-center justify-center text-gray-400">
                            <v-icon name="bi-calendar4" scale="1"/>
                            <p class="text-xs sm:text-sm">Miembro desde <time :datetime="userData.createdAt">{{formattedDate}}</time></p>
                        </div>
                    </div>

                    <!-- BOTON EDITAR -->
                    <RouterLink v-if="isActiveUserProfile" v-bind:to="{name: 'editProfile', params: {userId: userData.userId}}" class="flex flex-row gap-1 sm:gap-2 p-2 sm:p-3 justify-center items-center rounded-2xl bg-neon-blue">
                        <v-icon name="oi-pencil" scale="1.3"/>
                        <!-- <h2 class="text-2xl font-semibold font-rajdhani">Editar perfil</h2> -->
                        <span class="text-lg sm:text-2xl font-semibold">Editar perfil</span>
                    </RouterLink>
                </div>
                <!-- ESTADISTICAS -->
                <div class="flex flex-col gap-2 p-5 bg-dark-surface border-[1px] rounded-2xl border-neon-blue/30">
                    <!-- Etiqueta estadisticas -->
                    <div class="flex flex-row py-1 gap-2 items-center text-neon-blue">
                        <v-icon name="md-barchart" scale="1.2" flip="horizontal"/>
                        <h2 class="font-bold text-base sm:text-xl text-white">ESTADISTICAS</h2>
                    </div>
                    <!-- valores estadisticas -->
                    <!-- <div class="bg-blue-300 flex flex-col md:flex-row px-6 gap-6 justify-center">
                        <div class="flex flex-col py-4 px-8 items-center bg-orange-400">
                            <div>100</div>
                            <h3>POSTS</h3>
                        </div>
                        <div class="bg-green-500 flex flex-col py-4 px-8 items-center">
                            <div>2</div>
                            <h3>INSIGNIAS</h3>
                        </div>
                    </div> -->

                    <!-- HACER ENDPOINTS PARA ESTADISTICAS -->
                    <div class="grid grid-cols-1 md:grid-cols-2 px-6 gap-6">
                        <div class="flex flex-col py-4 px-8 items-center rounded-2xl bg-dark-base">
                            <h2 class="font-bold text-2xl sm:text-4xl text-white">{{userData.stats.totalPosts}}</h2>
                            <h3 class="font-medium text-base sm:text-xl text-gray-400">POSTS</h3>
                        </div>
                        <div class="flex flex-col py-4 px-8 items-center rounded-2xl bg-dark-base">
                            <h2 class="font-bold text-2xl sm:text-4xl text-white">{{numBadges}}</h2>
                            <h3 class="font-medium text-base sm:text-xl text-gray-400">INSIGNIAS</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col col-span-1 gap-3 lg:gap-12 row-span-1 w-full h-full px-4 lg:px-0"> 
                <div class="flex flex-col gap-6 p-6 border-[1px] rounded-2xl border-neon-blue/30 bg-dark-surface">
                    <div class="flex flex-row gap-2 items-center">
                        <v-icon name="fa-user-alt" scale="1.2" class="text-neon-blue"/>
                        <h2 class="font-bold text-base sm:text-xl text-white">SOBRE MI</h2>
                    </div>
                    <p class="font-medium text-sm sm:text-base text-gray-400 h-32">{{userData.description}}</p>
                </div>
                <div class="bg-dark-surface flex flex-col gap-6 p-6 border-[1px] rounded-2xl border-neon-blue/30">
                    <div class="flex flex-row gap-2 items-center">
                        <v-icon name="gi-achievement" scale="1.2" class="text-neon-blue"/>
                        <h2 class="font-bold text-base sm:text-xl text-white">EXPOSITOR</h2>
                    </div>
                    <div class="flex flex-row lg:grid lg:grid-cols-4 p-2 gap-4 max-h-80 overflow-x-auto lg:overflow-y-auto scrollbar ">
                        <template v-for="n in numQuizzes">
                            <div class="flex flex-col items-center">
                                <div v-if="userData?.completedQuizzes?.[n-1]" class="w-24 h-24 flex flex-col justify-center">
                                    <img v-bind:src="userData.completedQuizzes[n-1].badge.image.secure_url" class="object-contain"/>
                                </div>
                                <div v-else class="w-24 h-24 bg-dark-base opacity-40 rounded-2xl border-[1px] border-black"></div>
                                <h3 v-if="userData?.completedQuizzes?.[n-1]" class="font-semibold text-sm sm:text-base text-gray-400">{{ userData?.completedQuizzes?.[n-1]?.badge.name }}</h3>
                                <h3 v-else class="font-semibold text-sm sm:text-base text-gray-950/60">Oculto</h3>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="flex flex-col gap-6 p-6 border-[1px] rounded-2xl border-neon-blue/30 bg-dark-surface">
                    <div class="flex flex-row gap-2 items-center">
                        <v-icon name="bi-clock" scale="1.2" class="text-neon-blue"/>
                        <h2 class="font-bold text-base sm:text-xl text-white">ACTIVIDAD RECIENTE</h2>
                    </div>

                    <div class="flex flex-col gap-2">
                        <template v-for="post of userData.stats.recentPosts">
                            <div class="flex gap-2 p-2 items-center font-medium text-sm sm:text-base text-gray-400">
                                <v-icon name="md-comment" scale="0.8" class="text-neon-blue" flip="horizontal"/>
                                <span v-if="post.kind === 'Review'">Escribió una reseña de: <RouterLink v-bind:to="{name: 'gameInfo', params: {gameId: post.game._id}}" class="text-neon-blue hover:underline">{{ post.game.name }}</RouterLink></span>
                                <span v-else-if="post.kind === 'Reply'">Constestó en: <RouterLink v-bind:to="{name: 'thread', params: {threadId: post.thread._id}}" class="text-neon-blue hover:underline">{{ post.thread.title }}</RouterLink></span>
                                <span v-else-if="post.kind === 'Thread'">Empezó un hilo: <RouterLink v-bind:to="{name: 'thread', params: {threadId: post._id}}" class="text-neon-blue hover:underline"> {{ post.title }}</RouterLink></span>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        
    </div>




    
</template>

<style>
    .scrollbar::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }

    .scrollbar::-webkit-scrollbar-track {
        border-radius: 100vh;
        background: #0a0a0c;
    }

    .scrollbar::-webkit-scrollbar-thumb {
        background: #16161e;
        border-radius: 100vh;
        border: 1px solid rgb(0 212 255 / 0.3);
    }

    .scrollbar::-webkit-scrollbar-thumb:hover {
        background: #00d4ff
    }     
</style>