<script setup>
    import {RouterLink, useRoute, useRouter} from 'vue-router'
    import { useUserStore } from '../stores/userStore.js'
    import api from '@/boot/axios.js';
    import { ref, onMounted, computed, nextTick } from 'vue';
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import {useToastStore} from '../stores/toastStore.js'
    import * as yup from 'yup';
    import YupPassword from 'yup-password'

    YupPassword(yup)

    const formIsOpen = ref(false)
    const passFormIsOpen = ref(false)
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    const toastStore = useToastStore();
    const userData = ref({})
    const isLoading = ref(true)
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

    const user = ref({
        userName: null,
        name: null,
        lastName: null,
        email: null,
        description: null,
        profilePic: {
            secure_url: null
        }
    })
    const selectedFile = ref(null)

    const validationSchema = yup.object({
        userName: yup.string().required("Debe escribir un nombre de usuario")
            .min(2, "El nombre de usuario debe tener como mínimo 2 carácter")
            .max(20, "El nombre de usuario debe tener como máximo 20 caracteres"),
        name: yup.string().required("Debe escribir su nombre")
            .min(2, "El nombre debe tener como mínimo 2 carácter")
            .max(20, "El nombre debe tener como máximo 20 caracteres"),
        lastName: yup.string().required("Debe escribir el apellido")
            .min(2, "El apellido debe tener como mínimo 2 carácter")
            .max(30, "El apellido debe tener como máximo 30 caracteres"),
        email: yup.string().required("Debe escribir una desarrolladora")
            .email("Debe proporcionar un correo válido"),
        description: yup.string().optional().nullable()
            .max(500, "La descripción puede tener 500 caracteres como máximo"),
        profilePic: yup.mixed()
            .test('fileType', 'Solo se permiten imágenes',
                (file) => {
                    if(file && !file?.type.startsWith("image/")){
                        return false
                    }
                    return true
                }
            )
    })

    const passwordValidationSchema = yup.object({
        password: yup.string()
        .min(8, "La contraseña debe tener mínimo 8 caracteres")
        .minLowercase(1, "La contraseña debe tener al menos 1 letra minúscula")
        .minUppercase(1, "La contraseña debe tener al menos 1 letra mayúscula")
        .minNumbers(1, "La contraseña debe tener al menos 1 número")
        .minSymbols(1, "La contraseña debe tener al menos 1 carácter especial")
        .required("La contraseña es necesaria"),
        confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Las contraseñas deben coincidir"),
    })


    const getData = async () =>{ 
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
        }
    }


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
    const resetForm = () => {
        user.value = {
            userName: null,
            name: null,
            lastName: null,
            email: null,
            description: null,
            profilePic: {
                secure_url: null
            }
        }
        selectedFile.value = null
    }
    const handleCancelButton = () => {
        formIsOpen.value = false
        resetForm()
    }

    const handleEditButton = () => {
        formIsOpen.value = true;
        user.value = {
            userName: userData.value.userName,
            name: userData.value.name,
            lastName: userData.value.lastName,
            email: userData.value.email,
            description: userData.value.description,
            profilePic: {
                secure_url: userData.value.profilePic.secure_url
            }
        }
    }

    const handleFile = (event) => {
        selectedFile.value = event.target.files[0];
        let output = document.getElementById('output');
        output.src = URL.createObjectURL(selectedFile.value);
        output.onload = function () {
            URL.revokeObjectURL(output.src)
        }
    }

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            formData.append('userName', values.userName);
            formData.append('name', values.name)
            formData.append('lastName', values.lastName)
            formData.append('email', values.email)
            formData.append('description', values.description)
            if(selectedFile.value){
                formData.append('image', selectedFile.value)
            }
            const {data} = await api.put(route.path,
                formData,
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                }
            )

            userData.value = {...userData.value, ...data.editedProfile}
            toastStore.alert(data.msg)
            console.log(userData.value)
            await nextTick()
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }finally{
            formIsOpen.value = false;
            resetForm()
            userStore.setProfilePic(userData.value.profilePic.secure_url)
        }
    }

    const handleRemoveButton = async () => {
        try {
            if(confirm('¿Está seguro de eliminar la cuenta permanentemente? Si inicia sesión antes de 30 días se cancelará la eliminación de la cuenta')){
                const {data} = await api({
                    url: route.path,
                    method: 'DELETE',
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                })
                toastStore.alert(data.message)
                await userStore.logout()


                router.push('/')
            }else{
                return
            }
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const handleCancelPassButton = () => {
        passFormIsOpen.value = false
    }

    const changePassword = async (values) => {
        try {
            const {data} = await api.patch(`users/changePassword/${userStore.userId}`,
                {
                    password: values.password,
                    confirmPassword: values.confirmPassword
                },
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                }
            )

            toastStore.alert(data.message)
            await userStore.logout()
            router.push('/')
            
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }
    //Esto es más optimo pero para aplicaciones pequeñas no se nota tanto y se debe hacer para todos las views que busquen datos. 
    // O se puede hacer tb lo que tengo en app.vue (routerlink key) que es menos optimo. Lo que hace es destruir el componente y volverlo a crear cada vez que cambia la key
    // watch(() => route.params.userId, async () => {
    //     await getData()
    // })
    onMounted(async () => {
        try {
            await getData()
            await getUserPosts()
            await getNumQuizzes()
        } catch (error) {
            console.log(error)
        } finally {
            isLoading.value = false
        }
    })
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
                    <div v-if="isActiveUserProfile" class="flex flex-row gap-1 sm:gap-2 p-2 sm:p-3 justify-center items-center rounded-2xl bg-neon-blue">
                        <v-icon name="oi-pencil" scale="1.3"/>
                        <!-- <h2 class="text-2xl font-semibold font-rajdhani">Editar perfil</h2> -->
                        <span class="text-lg sm:text-2xl font-semibold">Editar perfil</span>
                    </div>
                    <div v-if="isActiveUserProfile" class="text-red-600/70 hover:underline">Eliminar cuenta</div>
                    
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
        <div v-if="!formIsOpen" class=" grid grid-cols-1 lg:grid-cols-[0.5fr_1fr] gap-3 lg:gap-0">
            <!-- Frame66 -->
            <div class="flex flex-col col-span-1 row-span-1 px-4 lg:px-12 gap-3 w-full "> 
                <!-- Frame71 PERFIL-->
                <div class="flex flex-col items-center gap-[10px] py-[25px] px-[25px] bg-dark-surface border-[1px] rounded-2xl border-neon-blue/30">
                    <!-- Perfil -->
                    <div class="flex flex-col w-32 h-32 sm:w-48 sm:h-48 lg:w-[215px] lg:h-[215px] drop-shadow-[0_15px_30px_rgba(0,212,255,0.6)]">

                        <img v-if="userData.profilePic" v-bind:src="userData.profilePic.secure_url" class="w-full h-full rounded-full border-2 border-neon-blue object-cover">
                    </div>


                    <!-- NOMBRE + FECHA -->
                    <div class="flex flex-col text-center w-full p-2 gap-2 overflow-hidden">
                        <h1 class="font-bold text-2xl sm:text-4xl text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">{{userData.userName}}</h1>
                        <div class="flex flex-row gap-2 items-center justify-center text-gray-400">
                            <v-icon name="bi-calendar4" scale="1"/>
                            <p class="text-xs sm:text-sm">Miembro desde <time :datetime="userData.createdAt">{{formattedDate}}</time></p>
                        </div>
                    </div>

                    <!-- BOTON EDITAR -->

                    <button v-if="isActiveUserProfile" type="button" @click="handleEditButton" class="flex flex-row gap-1 sm:gap-2 p-2 sm:p-3 justify-center items-center rounded-2xl bg-neon-blue">
                        <v-icon name="oi-pencil" scale="1.3"/>
                        <!-- <h2 class="text-2xl font-semibold font-rajdhani">Editar perfil</h2> -->
                        <span class="text-lg sm:text-2xl font-semibold">Editar perfil</span>
                    </button>

                    <button v-if="isActiveUserProfile && !passFormIsOpen" type="button" @click="passFormIsOpen = true" class="text-gray-200 hover:text-neon-blue/70 hover:underline">Cambiar contraseña</button>

                    <button v-if="isActiveUserProfile && !passFormIsOpen" type="button" @click="handleRemoveButton" class="text-gray-200 hover:text-red-600/70 hover:underline">Eliminar cuenta</button>

                    <Form v-if="passFormIsOpen" @submit="changePassword" v-bind:validation-schema="passwordValidationSchema" class="flex flex-col p-2 gap-1">
                        <div class="flex flex-col gap-2">
                            <div class="w-full flex gap-2">
                                <label for="uPassword" class="font-bold text-gray-400 shrink-0"> Nueva contraseña:</label>
                                <Field id="uPassword" name="password" type="password" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                            </div>
                            <p class="text-red-500 text-sm text-center">
                                <ErrorMessage name="password"></ErrorMessage>       
                            </p>
                        </div>

                        <div class="flex flex-col gap-2">
                            <div class="w-full flex gap-2">
                                <label for="uConfirmPassword" class="font-bold text-gray-400 shrink-0"> Confirmar contraseña:</label>
                                <Field id="uConfirmPassword" name="confirmPassword" type="password" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                            </div>
                            <p class="text-red-500 text-sm text-center">
                                <ErrorMessage name="confirmPassword"></ErrorMessage>       
                            </p>
                        </div>

                        <div class="flex flex-row justify-center gap-3">
                            <button type="submit" class="px-4 py-1 bg-neon-blue rounded-md font-semibold">Cambiar</button>
                            <button type="button" @click="handleCancelPassButton" class="px-4 py-1 rounded-md font-semibold text-white hover:bg-red-950/30">Cancelar</button>
                        </div>
                    </Form>
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
                            <h2 class="font-bold text-2xl sm:text-4xl text-white">{{userData?.stats?.totalPosts}}</h2>
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
                        <template v-for="post of userData?.stats?.recentPosts">
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
        
        <div v-if="formIsOpen" class="w-1/2 mx-auto flex flex-col items-center gap-2">
            <button type="button" @click="handleCancelButton" class="flex flex-row gap-1 sm:gap-2 p-2 sm:p-3 justify-center items-center rounded-2xl bg-neon-blue">Cancelar</button>
            <!-- <component :is="editProfileView" :user="userData"></component> -->

            <Form :validation-schema="validationSchema" @submit="handleSubmit" class="flex flex-col gap-2 p-5 bg-dark-surface rounded-md border-[1px] border-neon-blue/30">
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="userName" class="font-bold text-gray-400 shrink-0"> Nombre de usuario:</label>
                        <Field v-model="user.userName" id="userName" name="userName" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="userName"></ErrorMessage>       
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="name" class="font-bold text-gray-400"> Nombre:</label>
                        <Field v-model="user.name" id="name" name="name" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="name"></ErrorMessage>       
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="lastName" class="font-bold text-gray-400"> Apellidos:</label>
                        <Field v-model="user.lastName" id="lastName" name="lastName" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="lastName"></ErrorMessage>       
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="email" class="font-bold text-gray-400 shrink-0"> Correo electrónico:</label>
                        <Field v-model="user.email" id="email" name="email" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="email"></ErrorMessage>       
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="description" class="font-bold text-gray-400"> Descripción:</label>
                        <Field v-model="user.description" id="description" name="description" as="textarea" cols="50" rows="4" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="description"></ErrorMessage>       
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-5">
                        <label class="font-bold text-gray-400 shrink-0">Imagen de perfil:</label>
                        <label for="uImage" class="flex custom-file-upload py-1 px-4 rounded-md bg-neon-blue/50">
                            <v-icon name="fa-cloud-upload-alt"/>
                            Elegir imagen
                        </label>
                        <Field id="uImage" name="profilePic" type="file" @change="handleFile" class="custom-file-upload"/>
                        <!-- <Field v-else id="uImage" name="profilePic" type="file" @change="handleFile" class="custom-file-upload A"/> -->
                    </div>
                    <div class="flex flex-row justify-center">
                        <div class="w-36 h-36 rounded-md shrink-0">
                            <img v-if="user.profilePic.secure_url" id="output" :src="user.profilePic.secure_url" class="w-full h-full object-contain border-neon-blue/30 border-[1px] rounded-md">
                            <img v-else id="output" class="w-full h-full border-neon-blue/30 border-[1px] rounded-md">
                        </div>

                    </div>
                    <p class="text-red-500 text-sm text-center ">
                        <ErrorMessage name="profilePic"></ErrorMessage>
                    </p>
                </div>

                <div class="flex flex-row justify-center">
                    <button type="submit" class="px-4 py-2 bg-neon-blue rounded-md font-semibold">Modificar</button>
                </div>
            </Form>

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