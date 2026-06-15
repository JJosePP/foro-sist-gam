<script setup>
    import api from '@/boot/axios';
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import { nextTick, onMounted, watch } from 'vue';
    import { ref, computed } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import * as yup from 'yup';
    import { useUserStore } from '../stores/userStore.js';
    import {useToastStore} from '../stores/toastStore.js'
    import { formatRelativeDate } from "@/utils/date.js";
    
    import tiptap from '../components/TipTap.vue'


    const route = useRoute()
    const userStore = useUserStore();
    const router = useRouter();
    const toastStore = useToastStore();
    const game = ref({})
    const selectedImage = ref(null)
    const currentPage = ref(1);
    const totalPages = ref(1)
    const reviews = ref([]);
    const writeReviewIsOpen = ref(false)
    const reviewText = ref('');
    const rating = ref({
        overall: null,
        story: null,
        gameplay: null,
        technicalSection: null,
        art: null,
        sound: null
    })
    const formMode = ref('create');
    const reviewId = ref('')
    const isLoading = ref(true)
    const loadingReviews = ref(true)
    const reportingReviewId = ref(null)
    const moderatingReviewId = ref(null)
    const visiblePages= computed(() => {
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

    const userHasReview = computed(() => {
        for (let review of reviews.value){
            if(review.user._id === userStore.userId){
                return true
            }
        }
        return false
    })
    const transformNaNToNull = (value) => {
        return Number.isNaN(value) ? null : value
    }
    const validationSchema = yup.object({
        overall: yup.number().transform(transformNaNToNull).nullable().required("Debe introducir un valor numérico")
            .min(1, "El valor mínimo es 1")
            .max(100, "El valor máximo es 100")
            .integer("Debe introducir un valor entero"),
        story: yup.number().transform(transformNaNToNull).nullable().required("Debe introducir un valor numérico")
            .min(1, "El valor mínimo es 1")
            .max(100, "El valor máximo es 100")
            .integer("Debe introducir un valor entero"),
        gameplay: yup.number().transform(transformNaNToNull).nullable().required("Debe introducir un valor numérico")
            .min(1, "El valor mínimo es 1")
            .max(100, "El valor máximo es 100")
            .integer("Debe introducir un valor entero"),
        technicalSection: yup.number().transform(transformNaNToNull).nullable().required("Debe introducir un valor numérico")
            .min(1, "El valor mínimo es 1")
            .max(100, "El valor máximo es 100")
            .integer("Debe introducir un valor entero"),
        art: yup.number().transform(transformNaNToNull).nullable().required("Debe introducir un valor numérico")
            .min(1, "El valor mínimo es 1")
            .max(100, "El valor máximo es 100")
            .integer("Debe introducir un valor entero"),
        sound: yup.number().transform(transformNaNToNull).nullable().required("Debe introducir un valor numérico")
            .min(1, "El valor mínimo es 1")
            .max(100, "El valor máximo es 100")
            .integer("Debe introducir un valor entero"),
        content: yup.string().required("La reseña es necesaria")
            .max(8000, "La reseña puede contener 8000 caracteres como máximo"),
        
    })

    const reportValidationSchema = yup.object({
        reportContent: yup.string().required("Debe escribir un motivo")
            .max(1000, "La reseña puede contener 1000 caracteres como máximo")
    })
    const getGame = async () => {
        try{
            const {data} = await api({
                url: route.path,
                method: 'GET'
            });
            game.value = data.result

            return game
        } catch (error){
            console.log('AQUI')
            // console.log(error.response.status)
            console.log('---------')
            console.log(router)
            console.log(error.response.data.status)
            if(error?.response.status === 404){
                // router.push({name:'NotFound', params: { pathName: route.params.gameId }})
                router.replace({
                    name:'404'
                })
            }
            console.log("ERROR: ", error)
        }

    }
    const getReviews = async () => {
        try {
            console.log("TIENE HASH: ", route.hash)
            // let url = route.path + '/reviews/'
            const {data} = await api({
                url: route.path + `/reviews?order=desc&page=${currentPage.value}`,
                method: 'GET'
            })
            console.log(data.reviews)
            reviews.value = data.reviews;
            currentPage.value = data.currentPage;
            totalPages.value = data.totalPages

            return reviews
        } catch (error) {
            console.log("ERROR: ", error)
        } 
    }
    const goToPage = async (page) => {
        currentPage.value = page;
        await getReviews()
    }
    const handleClickWriteReviewButton = () => {
        formMode.value = 'create'
        writeReviewIsOpen.value = !writeReviewIsOpen.value
    }
    const handleClickUpdateReviewButton = async (review) => {
        writeReviewIsOpen.value = !writeReviewIsOpen.value
        formMode.value = 'update'
        console.log("REVIEW: ",review)
        reviewText.value = review.content;
        rating.value = review.rating
        reviewId.value = review._id
        await nextTick();
        console.log(document.getElementById('form'))
        document.getElementById('form')?.scrollIntoView({
            behavior: 'smooth'
        });

    }

    const resetForm = () => {
        rating.value = {
            overall: null,
            story: null,
            gameplay: null,
            technicalSection: null,
            art: null,
            sound: null
        };

        reviewText.value = '';
        reviewId.value = '';
    }

    const handleSubmit = async (values) => {
        try {
            if(formMode.value === 'create'){
                let url = route.path + '/reviews'
                await api.post(url, 
                    {
                        rating: {
                            overall: values.overall,
                            story: values.story,
                            gameplay: values.gameplay,
                            technicalSection: values.technicalSection,
                            art: values.art,
                            sound: values.sound
                        },
                        content: values.content
                    },
                    {
                        headers: {
                            Authorization: "Bearer " + userStore.token,
                        }
                    }
                )
                toastStore.alert('Reseña publicada con éxito')

                console.log(values)
            }
            if(formMode.value === 'update'){
                await api.put(`/reviews/${reviewId.value}`,
                    {
                        rating: {
                            overall: values.overall,
                            story: values.story,
                            gameplay: values.gameplay,
                            technicalSection: values.technicalSection,
                            art: values.art,
                            sound: values.sound
                        },
                        content: values.content
                    }, 
                    {
                        headers: {
                            Authorization: "Bearer " + userStore.token,
                        }
                    }
                );
                toastStore.alert('Reseña modificada con éxito')
                
                console.log("VALUES: ", values)
            }
            writeReviewIsOpen.value = false
            await getReviews()
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        } finally {
            resetForm()
        }
    }

    const voteReview = async (reviewId, vote) => {
        try {
            let {data} = await api.put(`/posts/${reviewId}/vote/${vote}`)
            toastStore.alert(data.msg)
            await getReviews()
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const handleReportButton = (reviewId) => {
        // isReporting.value = !isReporting.value
        if (reportingReviewId.value === reviewId) {
            reportingReviewId.value = null;
        } else {
            reportingReviewId.value = reviewId;
        }
    }

    const sendReport = async (values) => {
        console.log(values)
        try {
            const {data} = await api.post(`posts/${reportingReviewId.value}/report`,
                {
                    reason: values.reportContent,
                    urlToPost: route.path + `#r-${reportingReviewId.value}`
                },
                {
                    headers: {
                        Authorization: "Bearer" + userStore.token
                    }
                }
            )
            toastStore.alert(data.msg)

            console.log(`posts/${reportingReviewId.value}/report`)
            console.log(values.reportContent)
            console.log(route.path + `#r-${reportingReviewId.value}`)
            reportingReviewId.value = null;
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const findAndScrollToReview = async (reviewId) => {
        let page = 1;
        console.log("NUEVFA FUNCION: ", route.path)
        while (true) {
            const { data } = await api.get(
                `${route.path}/reviews?order=desc&page=${page}`
            );

            reviews.value = data.reviews;

            await nextTick();
            console.log("loadingRevie:", loadingReviews.value)
            console.log(
                "Reviews renderizadas:",
                reviews.value.map(r => r._id)
            );
            console.log(
                "Existe elemento:",
                document.getElementById(`r-${reviewId}`)
            );
            console.log(`r-${reviewId}`)
            console.log(page)
            const el = document.getElementById(`r-${reviewId}`);
            console.log("elemento: ", el)
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                break;
            }

            if (!data.hasNextPage) break;

            page++;
            currentPage.value = page
        }
    };

    const handleModerateButton = (id) => {
        if(moderatingReviewId.value === id){
            moderatingReviewId.value = null
        }else{
            moderatingReviewId.value = id
        }
    }

    const moderationSchema = yup.object({
        reason: yup.string().required('Debe elegir una opción')
    })

    const handleModerate = async (values, postId, index) => {
        try {
            const {data} = await api.put(`/posts/${postId}/moderate`,
                {
                    reason: values.reason
                },
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                }
            )
            reviews.value[index].isModerated = true
            await nextTick()
            toastStore.alert(data.msg)
            
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        } finally{
            moderatingReviewId.value = null
        }
    }

    onMounted(async () => {
        try {
            await getGame()
            await getReviews()
            console.log(reviews.value)
            isLoading.value = false
            
            if (route.hash) {
                console.log("ON MOUNTED")
                const reviewId = route.hash.replace('#r-', '');
                console.log(route.hash)
                console.log(reviewId)
                await findAndScrollToReview(reviewId);
            }   
        } catch (error) {
            console.log("ERROR: ", error)
        } finally{
            console.log(reviews.value.length)
            // isLoading.value = false
            // loadingReviews.value = false;

        }
    })
</script>
<template>
    <!-- Skeleton -->
    <div v-if="isLoading" class="flex flex-col max-w-[80%] mx-auto gap-5 md:gap-10 animate-pulse">
        <!-- contenedor nombre+overall (img de fondo) -->
        <div class="flex flex-col h-96 bg-cover bg-center items-start justify-end rounded-2xl drop-shadow-[0_17px_10px_rgba(255,255,255,0.4)] bg-gray-700">
            <!-- contenedor nombre + overall+desarrollador -->
        </div>

        <!-- contenedor label info + info -->
        <div class="flex flex-col gap-5">
            <div class="flex flex-row gap-1">
               <div class="w-1 h-6 md:h-8 rounded-2xl bg-neon-blue"></div>
               <h2 class="font-bold sm:text-xl md:text-2xl text-white">Información</h2>
           </div>

           <!-- contenedor info -->
           <div class="flex flex-col sm:grid sm:grid-cols-6 gap-2">
                <!-- contenedor descripcion + plataforma + fecha -->
                <div class="flex flex-col gap-2 col-span-4 lg:col-span-5">
                    <p class="font-bold text-gray-400 text-sm h-32 overflow-auto bg-gray-700 rounded-2xl"></p>
                    <!-- contenedor plataforma + fecha -->
                    <div class="flex flex-col sm:flex-row gap-2 sm:gap-7 h-1/2 ">
                        <!-- contenedor plataforma -->
                        <div class="flex flex-col sm:w-1/2 h-24 sm:h-full p-4 gap-1 items-center justify-center rounded-2xl bg-dark-surface border-[1px] border-neon-blue/30">
                            <h3 class="font-bold text-gray-400 text-sm sm:text-base">Plataforma</h3>
                            <span class="bg-gray-700 w-52 sm:max-lg:w-32 h-8 rounded-2xl"></span>
                        </div>
                        <!-- contenedor fecha lanzamiento -->
                        <div class="flex flex-col sm:w-1/2 h-24 sm:h-full p-4 gap-1 items-center justify-center rounded-2xl bg-dark-surface border-[1px] border-neon-blue/30">
                            <h3 class="font-bold text-gray-400 text-sm sm:text-base ">Fecha de lanzamiento</h3>
                            <span class="bg-gray-700 w-52 sm:max-lg:w-32 h-8 rounded-2xl"></span>
                        </div>
                    </div>
                </div>

                <!-- contenedor ratings -->
                <div class="flex flex-col col-span-2 lg:col-span-1 gap-3 p-4 rounded-2xl bg-dark-surface border-[1px] border-neon-blue/30">
                    <h3 class="font-bold text-xl text-white">Rating</h3>
                    <div class="flex flex-col h-full justify-between font-semibold text-gray-400 divide-y-2 divide-neon-blue/10">
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Historia</h4>
                            <span class="bg-gray-700 w-6 h-6 rounded-md"></span>
                        </div>
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Jugabilidad</h4>
                            <span class="bg-gray-700 w-6 h-6 rounded-md"></span>
                        </div>
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Sección técnica</h4>
                            <span class="bg-gray-700 w-6 h-6 rounded-md"></span>
                        </div>
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Arte</h4>
                            <span class="bg-gray-700 w-6 h-6 rounded-md"></span>
                        </div>
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Sonido</h4>
                            <span class="bg-gray-700 w-6 h-6 rounded-md"></span>
                        </div>
                    </div>
                </div>
           </div>
        </div>

        <!-- contenedor label caputuras + capturas pantalla -->
        <div class="flex flex-col gap-5">
            <div class="flex flex-row gap-1">
               <div class="w-1 h-6 md:h-8 rounded-2xl bg-neon-blue"></div>
               <h2 class="font-bold sm:text-xl md:text-2xl text-white">Capturas de pantalla</h2>
           </div>
           <!-- contenedor capturas -->
           <div class="flex flex-row gap-6 p-6 rounded-2xl border-[1px] overflow-x-auto bg-dark-surface border-neon-blue/30 scrollbar">
                <div v-for="n in 10" class="flex-none w-40 h-40 cursor-pointer">
                    <div class="w-full h-full rounded-2xl bg-gray-700"></div>
                </div>
           </div>
        </div>

        <!-- contenedor label reseñas + reseñas -->
        <div class="flex flex-col gap-5">
            <!-- contenedor label -->
            <div class="flex flex-row items-center justify-between">
                <div class="flex flex-row gap-1 items-center">
                    <div class="w-1 h-6 md:h-8 rounded-2xl bg-neon-blue"></div>
                    <h2 class="font-bold sm:text-xl md:text-2xl text-white">Reseñas de la comunidad</h2>
                </div>
                <div class="flex flex-row gap-2 items-center text-white">
                   <button v-for="n in 3" class="px-3 py-1">
                        {{ n }}
                    </button>
                </div>

            </div>

            <!-- contenedor reseñas -->
            <div class="flex flex-col gap-2 ">
                <!-- reseña -->
                <div v-for="n in 10" class="flex flex-col p-6 gap-2 rounded-2xl border-[1px] border-neon-blue/30 bg-dark-surface">
                    <!-- encabezado reseña -->
                    <div class="flex flex-col sm:flex-row justify-between">
                        <!-- usuario -->
                        <div class="flex flex-row gap-2 items-center">
                            <!-- foto perfil -->
                            <div class="w-14 h-14">
                                <div class="w-full h-full object-cover rounded-full border-2 border-neon-blue bg-gray-700"></div>
                            </div>
                            <!-- usuario + fecha -->
                            <div class="flex flex-col gap-2 items-start">
                                <!-- <RouterLink :to="{name: 'profile', params: {userId: review.user._id}}" class="font-bold text-xl text-white hover:text-neon-blue hover:underline">{{review.user.userName }}</RouterLink> -->
                                <span class="bg-gray-700 h-7 w-28 rounded-md"></span>
                                <!-- <time :datetime="review.createdAt" class="font-bold text-sm text-gray-400">{{formatRelativeDate(review.createdAt)}}</time> -->
                                <span class="bg-gray-700 w-20 h-5 rounded-md"></span>
                            </div>
                        </div>
                        <!-- rating usuario -->
                        <div class="flex flex-row flex-wrap gap-5 p-2 sm:max-md:grid sm:max-md:grid-cols-3">
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="bi-star" class="text-neon-blue" />
                                <p class="bg-gray-700 w-6 h-6 rounded-md"></p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="la-scroll-solid" flip="horizontal" class="text-neon-blue" />
                                <p class="bg-gray-700 w-6 h-6 rounded-md"></p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="la-gamepad-solid"  class="text-neon-blue" />
                                <p class="bg-gray-700 w-6 h-6 rounded-md"></p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="bi-gpu-card" class="text-neon-blue" />
                                <p class="bg-gray-700 w-6 h-6 rounded-md"></p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="bi-palette" class="text-neon-blue" />
                                <p class="bg-gray-700 w-6 h-6 rounded-md"></p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="bi-music-note-beamed" class="text-neon-blue" />
                                <p class="bg-gray-700 w-6 h-6 rounded-md"></p>
                            </div>
                        </div>
                    </div>
                    <!-- body reseá -->
                    <p class="p-2 bg-gray-700 h-10 rounded-xl"></p>
                    <!-- footer reseña -->
                    <div class="flex flex-row justify-between items-center">
                        <div class="flex flex-col gap-1 px-2 text-gray-400">
                            <p class="font-medium text-xs">¿Te ha resultado útil esta reseña?</p>
                            <div class="flex flex-row gap-2">
                                <div class="flex flex-row gap-1 items-center hover:bg-neon-blue/30 p-1 rounded-md">
                                    <v-icon name="md-thumbup-round" class="text-neon-blue"/>
                                    <p class="font-semibold text-xs">Sí ()</p>
                                </div>
                                <div class="flex flex-row gap-1 items-center hover:bg-neon-blue/30 p-1 rounded-md">
                                    <v-icon name="md-thumbup-round" flip="vertical" class="text-neon-blue"/>
                                    <p class="font-semibold text-xs">No ()</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Vista con datos -->
    <div v-else class="flex flex-col max-w-[80%] mx-auto gap-5 md:gap-10">
        <!-- contenedor nombre+overall (img de fondo) -->
        <div v-if="game.mainImage" class="flex flex-col h-96 bg-cover bg-center items-start justify-end rounded-2xl drop-shadow-[0_17px_10px_rgba(255,255,255,0.4)]" :style="{backgroundImage: `url(${game.mainImage.secure_url})`}">
            <!-- contenedor nombre + overall+desarrollador -->
            <div class="flex flex-col gap-2 px-10 py-2 ">
                <h1 class="font-bold text-2xl md:text-4xl lg:text-6xl text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">{{game.name}}</h1>
                <div class="flex flex-row gap-2 items-center">
                    <!-- Rating overall -->
                    <div class="flex flex-row gap-1 p-1 border-[1px] border-white/30 rounded-xl items-center bg-dark-surface">
                        <span class="px-3 py-1.5 bg-neon-blue font-bold text-xl text-dark-base rounded-lg">{{game.rating.overall}}</span>
                        <div class="flex flex-col items-center">
                            <h2 class="font-bold text-base text-neon-blue">Rating</h2>
                            <h3 class="font-semibold text-xs text-gray-400">General</h3>
                        </div>
                    </div>
                    <!-- desarrollador -->
                    <div class="flex flex-col items-center">
                        <h2 class="font-bold text-gray-200 text-base drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">{{ game.developmentCompany }}</h2>
                        <h3 class="font-semibold text-xs text-gray-400">Desarrollador</h3>
                    </div>
                </div>
            </div>
        </div>

        <!-- contenedor label info + info -->
        <div class="flex flex-col gap-5">
            <div class="flex flex-row gap-1">
               <div class="w-1 h-6 md:h-8 rounded-2xl bg-neon-blue"></div>
               <h2 class="font-bold sm:text-xl md:text-2xl text-white">Información</h2>
           </div>

           <!-- contenedor info -->
           <div class="flex flex-col sm:grid sm:grid-cols-6 gap-2">
                <!-- contenedor descripcion + plataforma + fecha -->
                <div class="flex flex-col gap-2 sm:gap-0 col-span-4 lg:col-span-5">
                    <p class="font-bold text-gray-400 text-sm h-1/2 overflow-auto"> {{ game.description }}</p>
                    <!-- contenedor plataforma + fecha -->
                    <div class="flex flex-col sm:flex-row gap-2 sm:gap-7 h-1/2 ">
                        <!-- contenedor plataforma -->
                        <div class="flex flex-col sm:w-1/2 h-24 sm:h-full p-4 gap-1 items-center justify-center rounded-2xl bg-dark-surface border-[1px] border-neon-blue/30">
                            <h3 class="font-bold text-gray-400 text-sm sm:text-base">Plataforma</h3>
                            <ul class="flex flex-row gap-2 text-white font-bold text-base sm:text-lg md:text-xl flex-wrap max-h-16 overflow-auto scrollbar">
                                <li v-for="platform in game?.platforms">{{platform.name}}</li>
                            </ul>
                        </div>
                        <!-- contenedor fecha lanzamiento -->
                        <div class="flex flex-col sm:w-1/2 h-24 sm:h-full p-4 gap-1 items-center justify-center rounded-2xl bg-dark-surface border-[1px] border-neon-blue/30">
                            <h3 class="font-bold text-gray-400 text-sm sm:text-base ">Fecha de lanzamiento</h3>
                            <div class="flex flex-row gap-2 items-center font-bold text-white text-base sm:text-lg md:text-xl ">
                                <v-icon name="bi-calendar4" scale="1.2" class="text-neon-blue"/>
                                <time v-if="game.releaseDate" :datetime="game.releaseDate">{{game.releaseDate}}</time>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- contenedor ratings -->
                <div class="flex flex-col col-span-2 lg:col-span-1 gap-3 p-4 rounded-2xl bg-dark-surface border-[1px] border-neon-blue/30">
                    <h3 class="font-bold text-xl text-white">Rating</h3>
                    <div v-if="game.rating" class="flex flex-col h-full justify-between font-semibold text-gray-400 divide-y-2 divide-neon-blue/10">
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Historia</h4>
                            <span>{{game.rating.story}}</span>
                        </div>
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Jugabilidad</h4>
                            <span>{{game.rating.gameplay}}</span>
                        </div>
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Sección técnica</h4>
                            <span>{{game.rating.technicalSection }}</span>
                        </div>
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Arte</h4>
                            <span>{{game.rating.art}}</span>
                        </div>
                        <div class="flex flex-row justify-between items-center py-1">
                            <h4>Sonido</h4>
                            <span>{{game.rating.sound}}</span>
                        </div>
                    </div>
                </div>
           </div>
        </div>

        <!-- contenedor label caputuras + capturas pantalla -->
        <div class="flex flex-col gap-5">
            <div class="flex flex-row gap-1">
               <div class="w-1 h-6 md:h-8 rounded-2xl bg-neon-blue"></div>
               <h2 class="font-bold sm:text-xl md:text-2xl text-white">Capturas de pantalla</h2>
           </div>
           <!-- contenedor capturas -->
           <div class="flex flex-row gap-6 p-6 rounded-2xl border-[1px] overflow-x-auto bg-dark-surface border-neon-blue/30 scrollbar">
                <div v-for="screenshot in game?.screenshots" @click="selectedImage=screenshot.secure_url" class="flex-none w-40 h-40 cursor-pointer">
                    <img :src="screenshot.secure_url" class="w-full h-full object-cover rounded-2xl border-[1px] border-neon-blue/10"/>
                </div>
           </div>
           <div v-if="selectedImage" @click="selectedImage=null" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <img :src="selectedImage" class="max-w-[90%] max-h-[90%] object-contain rounded-xl"/>
            </div>
        </div>

        <!-- contenedor label reseñas + reseñas -->
        <div class="flex flex-col gap-5">
            <!-- contenedor label -->
            <div class="flex flex-row items-center justify-between">
                <div class="flex flex-row gap-1 items-center">
                    <div class="w-1 h-6 md:h-8 rounded-2xl bg-neon-blue"></div>
                    <h2 class="font-bold sm:text-xl md:text-2xl text-white">Reseñas de la comunidad</h2>
                </div>
                <div class="flex flex-row gap-2 items-center">
                    <button v-if="!writeReviewIsOpen && userStore.token && !userHasReview" @click="handleClickWriteReviewButton" class="flex flex-row items-center gap-2 px-5 py-3 rounded-md border-[1px] border-neon-blue bg-neon-blue/10 ">
                        <v-icon name="oi-pencil" scale="1.3" class="text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]"/>
                        <span class="font-bold text-xl text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">Escribir reseña</span>
                    </button>
                    <div class="flex gap-0.5 pe-5">
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

            </div>
            <!-- area para escribir reseña -->
            <Form v-if="writeReviewIsOpen && userStore.token" @submit="handleSubmit" v-bind:validation-schema="validationSchema" id="form" class="flex flex-col gap-2 p-3 bg-dark-surface rounded-2xl border-[1px] border-neon-blue/30">
                <div class="grid grid-cols-2 md:grid-cols-3 xl:flex gap-10 mx-auto xl:flex-wrap">
                    <div class="flex flex-col gap-1 items-start xl:items-center">
                        <div class="flex gap-3 items-center w-full">
                            <label for="rOverall" class="font-bold text-gray-400">General:</label>
                            <Field v-model="rating.overall" id="rOverall" name="overall" type="number" min="1" max="100"   class="bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 w-14 rounded-md text-center"></Field>
                        </div>
                        <p class="text-red-500 text-sm text-center">
                            <ErrorMessage name="overall"></ErrorMessage>
                        </p>
                    </div>
                    <div class="flex flex-col gap-1 items-start xl:items-center">
                        <div class="flex gap-3 items-center w-full">
                            <label for="rStory" class="font-bold text-gray-400">Historia:</label>
                            <Field v-model="rating.story" id="rStory" name="story" type="number" min="1" max="100"class="bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 w-14 rounded-md text-center"></Field>
                        </div>
                        <p class="text-red-500 text-sm">
                            <ErrorMessage name="story"></ErrorMessage>
                        </p>
                    </div>
                    <div class="flex flex-col gap-1 items-start xl:items-center">
                        <div class="flex gap-3 items-center w-full">
                            <label for="rGameplay" class="font-bold text-gray-400">Jugabilidad:</label>
                            <Field v-model="rating.gameplay" id="rGameplay" name="gameplay" type="number" min="1" max="100" class="bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 w-14 rounded-md text-center"></Field>
                        </div>
                        <p class="text-red-500 text-sm">
                            <ErrorMessage name="gameplay"></ErrorMessage>
                        </p>
                    </div>
                    <div class="flex flex-col gap-1 items-start xl:items-center">
                        <div class="flex gap-3 items-center w-full">
                            <label for="rTechnicalSection" class="font-bold text-gray-400">Apartado técnico:</label>
                            <Field v-model="rating.technicalSection" id="rTechnicalSection" name="technicalSection" type="number" min="1" max="100" class="bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 w-14 rounded-md text-center"></Field>
                        </div>
                        <p class="text-red-500 text-sm">
                            <ErrorMessage name="technicalSection"></ErrorMessage>
                        </p>
                    </div>
                    <div class="flex flex-col gap-1 items-start xl:items-center">
                        <div class="flex gap-3 items-center w-full">
                            <label for="rArt" class="font-bold text-gray-400">Arte:</label>
                            <Field v-model="rating.art" id="rArt" name="art" type="number" min="1" max="100" class="bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 w-14 rounded-md text-center"></Field>
                        </div>
                        <p class="text-red-500 text-sm">
                            <ErrorMessage name="art"></ErrorMessage>
                        </p>
                    </div>
                    <div class="flex flex-col gap-1 items-start xl:items-center">
                        <div class="flex gap-3 items-center w-full">
                            <label for="rSound" class="font-bold text-gray-400">Sonido:</label>
                            <Field v-model="rating.sound" id="rSound" name="sound" type="number" min="1" max="100"  class="bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 w-14 rounded-md text-center"></Field>
                        </div>
                        <p class="text-red-500 text-sm">
                            <ErrorMessage name="sound"></ErrorMessage>
                        </p>
                    </div>
                </div>
                <div class="flex flex-col gap-1 items-center">
                    <!-- <Field v-model="reviewText" as="textarea" name="content" cols="50" rows="4" class="bg-dark-surface text-gray-400 font-normal w-full h-36 p-5"></Field> -->
                    <Field v-model="reviewText" name="content">
                        <tiptap v-model="reviewText" class="tiptap"/>
                    </Field>
                    <p class="text-red-500 text-sm">
                            <ErrorMessage name="content"></ErrorMessage>
                    </p>
                </div>

                <div class="flex justify-center">
                    <button class="bg-neon-blue px-6 py-1 rounded-lg font-semibold text-xl" type="submit">{{ formMode === 'create' ? 'Publicar reseña' : 'Actualizar reseña' }}</button>
                </div>
                    
            </Form>

            <!-- contenedor reseñas -->
            <div class="flex flex-col gap-2 ">
                <!-- reseña -->
                <div v-for="(review, index) in reviews" :id="`r-${review._id}`" class="flex flex-col p-6 gap-2 rounded-2xl border-[1px] border-neon-blue/30 bg-dark-surface">
                    <!-- encabezado reseña -->
                    <div class="flex flex-col sm:flex-row justify-between">
                        <!-- usuario -->
                        <div class="flex flex-row gap-2 items-center">
                            <!-- foto perfil -->
                            <div class="w-14 h-14">
                                <img :src="review.user.profilePic.secure_url" class="w-full h-full object-cover rounded-full border-2 border-neon-blue">
                            </div>
                            <!-- usuario + fecha -->
                            <div class="flex flex-col gap-2 items-start">
                                <RouterLink :to="{name: 'profile', params: {userId: review.user._id}}" class="font-bold text-xl text-white hover:text-neon-blue hover:underline">{{review.user.userName }}</RouterLink>
                                <time :datetime="review.createdAt" class="font-bold text-sm text-gray-400">{{formatRelativeDate(review.createdAt)}}</time>
                            </div>
                        </div>
                        <!-- rating usuario -->
                        <div class="flex flex-row flex-wrap gap-5 p-2 sm:max-md:grid sm:max-md:grid-cols-3">
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="bi-star" class="text-neon-blue" />
                                <p class="font-semibold text-base text-gray-400">{{ review.rating.overall }}</p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="la-scroll-solid" flip="horizontal" class="text-neon-blue" />
                                <p class="font-semibold text-base text-gray-400">{{ review.rating.story }}</p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="la-gamepad-solid"  class="text-neon-blue" />
                                <p class="font-semibold text-base text-gray-400">{{ review.rating.gameplay }}</p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="bi-gpu-card" class="text-neon-blue" />
                                <p class="font-semibold text-base text-gray-400">{{ review.rating.technicalSection }}</p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="bi-palette" class="text-neon-blue" />
                                <p class="font-semibold text-base text-gray-400">{{ review.rating.art }}</p>
                            </div>
                            <div class="flex flex-row gap-1 items-center">
                                <v-icon name="bi-music-note-beamed" class="text-neon-blue" />
                                <p class="font-semibold text-base text-gray-400">{{ review.rating.sound }}</p>
                            </div>
                        </div>
                    </div>
                    <!-- body reseá -->
                    <p v-if="review.isModerated" class="p-7 text-base font-medium text-gray-400 italic">Contenido moderado</p>
                    <p v-else v-html="review.content" class="p-2 font-medium text-base text-gray-200"></p>
                    <!-- footer reseña -->
                    <div class="flex flex-row justify-between items-center">
                        <div class="flex flex-col gap-1 px-2 text-gray-400">
                            <p class="font-medium text-xs">¿Te ha resultado útil esta reseña?</p>
                            <div class="flex flex-row gap-2">
                                <button @click="voteReview(review._id, '1')" class="flex flex-row gap-1 items-center hover:bg-neon-blue/30 p-1 rounded-md">
                                    <v-icon name="md-thumbup-round" class="text-neon-blue"/>
                                    <p class="font-semibold text-xs">Sí (<span>{{ review.positiveVotes }}</span>)</p>
                                </button>
                                <button @click="voteReview(review._id, '-1')" class="flex flex-row gap-1 items-center hover:bg-neon-blue/30 p-1 rounded-md">
                                    <v-icon name="md-thumbup-round" flip="vertical" class="text-neon-blue"/>
                                    <p class="font-semibold text-xs">No (<span>{{ review.negativeVotes }}</span>)</p>
                                </button>
                                <button v-if="review.user._id !== userStore.userId" @click="handleReportButton(review._id)" class="text-base hover:underline hover:bg-neon-blue/30 p-1 rounded-md">Reportar</button>
                                
                                <button v-if="userStore.isModOrAdmin && !review.isModerated" @click="handleModerateButton(review._id)" class="text-base hover:underline hover:bg-neon-blue/20 p-1 rounded-md">Moderar</button>

                                <Form v-if="moderatingReviewId === review._id" @submit="(values)=>handleModerate(values,review._id, index)" v-bind:validation-schema="moderationSchema" class="flex flex-row gap-2 items-center">
                                    <div class="flex flex-col gap-2 ">
                                        <div class="w-full flex gap-2">
                                            <label for="rReason" class="font-bold text-gray-400">Motivo:</label>
                                            <Field id="rReason" name="reason" as="select" class="text-black">
                                                <option value="">Seleccionar motivo</option>
                                                <option value="Ofensivo">Ofensivo</option>
                                                <option value="Spam">Spam</option>
                                                <option value="Fuera de tema">Fuera de tema</option>
                                                <option value="Lenguaje inapropiado">Lenguaje inapropiado</option>
                                            </Field>                  
                                        </div>          
                                    </div>
                                    <p class="text-red-500 text-sm text-center">
                                            <ErrorMessage name="reason"></ErrorMessage>
                                        </p>
                                    <button type="submit" class="p-1 underline text-gray-400 hover:text-neon-blue">Confirmar</button>
                                </Form>

                            </div>
                        </div>
                        <button v-if="review.user._id === userStore.userId" @click="handleClickUpdateReviewButton(review)" class="flex flex-row items-center gap-1 px-3 py-1 rounded-md border-[1px] border-neon-blue bg-neon-blue/10 ">
                            <v-icon name="oi-pencil" scale="1" class="text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]"/>
                            <span class="font-bold text-xs text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">Modificar reseña</span>
                        </button>
                    </div>
                    <Form v-if="reportingReviewId === review._id" v-bind:validation-schema="reportValidationSchema" @submit="sendReport" id="reportForm" class="flex flex-col gap-2 p-3 bg-dark-surface border-[1px] border-neon-blue/30">
                        <div class="flex flex-col gap-1">
                            <label class="font-bold text-gray-400 mx-1">Indique el motivo del reporte:</label>
                            <Field as="textarea" name="reportContent" cols="50" rows="4" class="bg-dark-base text-gray-400 font-normal w-full h-36 p-5"></Field>
                            <p class="text-red-500 text-sm text-center">
                                <ErrorMessage name="reportContent"></ErrorMessage>
                            </p>
                        </div>
                        <div class="flex justify-center">
                            <button class="bg-neon-blue px-6 py-1 rounded-lg font-semibold text-xl" type="submit">Enviar</button>
                        </div>  
                    </Form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .scrollbar::-webkit-scrollbar {
        width: 5px;
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
    
    textarea {
        resize: none;
        border-color: rgb(0 212 255 / 0.3);
        border-radius: 16px;
        border-width: 1px;
    }
    textarea:focus {
        outline: 1px solid #00d4ff;
    }

    input[type=number]::-webkit-inner-spin-button
    {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type=number]
    {
        -moz-appearance: textfield;
        /* text-align: center; */
    }

    input[type=number]:focus {
        outline: 1px solid #00d4ff;
    }
</style>