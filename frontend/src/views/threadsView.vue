<script setup>
    import SearchBar from '@/components/SearchBar.vue';
    import api from '@/boot/axios.js';
    import { computed, nextTick, onMounted, ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { useUserStore } from '../stores/userStore.js';
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import tiptap from '../components/TipTap.vue'
    import * as yup from 'yup';
    import {useToastStore} from '../stores/toastStore.js'

    const searchTerm = ref('')
    const categoryInfo = ref({})
    const route = useRoute()
    const router = useRouter()
    const currentPage = ref(1)
    const filter = ref('createdAt')
    const totalPages = ref(1)
    const threads = ref([])
    const userStore = useUserStore();
    const isLoading = ref(true)
    const formIsOpen = ref(false)
    const thread = ref({
        title: null,
        content: null,
        category: null
    })
    const toastStore = useToastStore();


    const threadValidationSchema = yup.object({
        content: yup.string().required("La respuesta no puede quedar vacía")
            .max(8000, "La reseña puede contener 8000 caracteres como máximo"),
        title: yup.string().required("El título no puede quedar vacío")
            .max(50, "El título no puede contener más de 50 caracteres")
            .min(5, "El título debe contener más de 5 caracteres")
    })

    const handleSearch = async (term) => {
        console.log(term)
        searchTerm.value = term
        await getThreads()
    }
    const chooseFilter = async (chosenFilter) => {
        filter.value = chosenFilter
        console.log(filter.value)
        await getThreads()
    }
    const getCategoryInfo = async () => {
        try {
            const {data} = await api({
                url: `/categories/${route.params.categoryId}`
            })
            console.log("RESULTADO ", data.category)
            categoryInfo.value = data.category
        } catch (error) {
            console.log("ERROR: ", error)
        }
    }
    const getThreads = async () => {
        console.log("RUTA: ",route.params)
        try {
            let url = `/threads?category=${route.params.categoryId}&sortBy=${filter.value}`;
            let order = 'desc'
            if(searchTerm.value){
                url += `&search=${searchTerm.value}`
            }
            if(filter.value === 'title'){
                order = 'asc'
            }
            url += `&order=${order}&page=${currentPage.value}`;

            console.log("URL: ",url)
            const {data} = await api({
                url: url,
                method: 'GET'
            });
            threads.value = data.threads
            
            return threads
        } catch (error) {
            console.log("ERROR: ", error)
        }
    }

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

    const goToPage = async (page) => {
        currentPage.value = page;
        await getThreads()
    }

    const handleAddButton = async () => {
        if(formIsOpen.value === true){
            resetForm()
        }
        formIsOpen.value = true
        await nextTick()
        document.getElementById('form')?.scrollIntoView({
            behavior: 'smooth'
        });
    }

    const resetForm = () => {
        thread.value = {
            title: null,
            content: null,
            category: null
        }
    }

    const handleCancelButton = () => {
        resetForm()
        formIsOpen.value = false
    }

    const handleSubmit = async (values) => {
        console.log(values)
        console.log(categoryInfo.value._id)
        try {
            const {data} = await api.post('threads',
                {
                    title: values.title,
                    content: values.content,
                    category: categoryInfo.value._id
                },
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                }
            )
            
            toastStore.alert(data.msg)

            router.push({name: 'thread', params:{threadId: data.createdThread._id}})

        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    onMounted(async() => {
        try {
            console.log('PARARM: ', route.params)
            await getCategoryInfo()
            await getThreads()
        } catch (error) {
            console.log(error)
        } finally{
            isLoading.value = false
        }
    })
</script>

<template>
    <div class="flex flex-col max-w-[80%] mx-auto gap-5 md:gap-10">

        <div class="flex flex-row items-center gap-2">
            <SearchBar termToSearch="título" v-model="searchTerm" @search="handleSearch"/>
        </div>

        <!-- categoria -->
        <div class="flex flex-row gap-1 items-center">
            <div class="flex flex-row gap-1">
                <div class="w-1 h-6 md:h-10 rounded-2xl bg-neon-blue"></div>
                <h2 class="font-bold sm:text-xl md:text-4xl text-white">Categoría:</h2>
            </div>
            <div class="w-12 h-12">
                <div v-if="isLoading" class="w-full h-full bg-gray-700 rounded-md"></div>
                <img v-else :src="categoryInfo.image.secure_url" class="w-full h-full object-contain" >
            </div>
            <span v-if="isLoading" class="h-8 w-36 bg-gray-700 rounded-md"></span>
            <h2 v-else class="font-bold sm:text-xl md:text-2xl text-white">{{categoryInfo.name}}</h2>
        </div>
       
           <div class="flex flex-row justify-between items-center">
            <!-- filtros -->
            <div class="flex flex-row gap-2">
                <button @click="chooseFilter('createdAt')" :class="{'bg-neon-blue/50 focus:text-black': filter === 'createdAt'}" class="px-2 py-1 rounded-md font-semibold text-base text-gray-200 bg-dark-surface hover:bg-neon-blue">Más recientes</button>
                <button @click="chooseFilter('positiveVotes')" :class="{'bg-neon-blue/50 focus:text-black': filter === 'positiveVotes'}" class="px-2 py-1 rounded-md font-semibold text-base text-gray-200 bg-dark-surface hover:bg-neon-blue">Mejor votados</button>
                <button @click="chooseFilter('title')" :class="{'bg-neon-blue/50 focus:text-black': filter === 'title'}" class="px-2 py-1 rounded-md font-semibold text-base bg-dark-surface text-white hover:bg-neon-blue">Por título</button>
            </div>

            <div><h2 class="font-bold sm:text-xl md:text-2xl text-white">Lista de hilos</h2></div>
            <!-- boton nuevo hilo + paginacion -->
            <div class="flex flex-row gap-2 ">
                <button v-if="userStore.token" type="button" @click="handleAddButton" class="px-2 py-1 rounded-md font-bold text-base text-black bg-neon-blue">Nuevo hilo</button>
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
        <!-- contenedor hilos -->
        <div class="flex flex-col rounded-md border-[1px] border-neon-blue/30 divide-y divide-neon-blue/30 bg-dark-surface">
            <!-- header container -->
            <div class="grid grid-cols-11 rounded-md bg-dark-base">
                <span class=" col-span-8 p-2 font-semibold text-base text-gray-400">Tema</span>
                <span class=" p-2 text-center font-semibold text-base text-gray-400">Respuestas</span>
                <span class="p-2 text-center font-semibold text-base text-gray-400">Votos positivos</span>
                <span class="p-2 text-center font-semibold text-base text-gray-400">Votos negativos</span>
            </div>

            <!-- body container -->
             <div v-if="isLoading" class="flex flex-col divide-y-[1px] divide-neon-blue/30">
                <div v-for="n in 10" class="grid grid-cols-11 p-2">
                    <div class="col-span-8 font-semibold text-base text-gray-400"><div class="h-6 w-60 bg-gray-700 rounded-md"></div></div>
                    <div class="flex justify-center"><p class=" bg-gray-700 h-6 w-6 rounded-md"></p></div>
                    <div class="flex justify-center"><p class=" bg-gray-700 h-6 w-6 rounded-md"></p></div>
                    <div class="flex justify-center"><p class=" bg-gray-700 h-6 w-6 rounded-md"></p></div>
                </div>   
            </div>
            <div v-else class="flex flex-col divide-y-[1px] divide-neon-blue/30">
                <div v-for="thread in threads" class="grid grid-cols-11 p-2">
                    <div class="col-span-8 font-semibold text-base text-gray-400"><RouterLink :to="{name: 'thread', params: {threadId: thread._id}}" class="hover:text-neon-blue hover:underline">{{ thread.title }}</RouterLink></div>
                    <div class="font-semibold text-base text-gray-400 text-center">{{thread.numReplies}}</div>
                    <div class="font-semibold text-base text-gray-400 text-center">{{thread.positiveVotes}}</div>
                    <div class="font-semibold text-base text-gray-400 text-center">{{ thread.negativeVotes }}</div>
                </div>   
            </div>
        </div>
        
        <div v-if="formIsOpen" >
            <Form id="form" @submit="handleSubmit" v-bind:validationSchema="threadValidationSchema" class="flex flex-col p-3 gap-2 rounded-md border-[1px] border-neon-blue/30 bg-dark-surface">
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="tTitle" class="font-bold text-gray-400"> Título:</label>
                        <Field v-model="thread.title" id="tTitle" name="title" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="title"></ErrorMessage>       
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <Field v-model="thread.content" name="content">
                        <tiptap v-model="thread.content" class="tiptap"/>
                    </Field>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="content"></ErrorMessage>
                    </p>
                </div>

                <div class="flex flex-row justify-center gap-3">
                    <button type="submit" class="px-4 py-1 bg-neon-blue rounded-md font-semibold">Crear</button>
                    <button type="button" @click="handleCancelButton" class="px-4 py-1 rounded-md font-semibold text-white hover:bg-red-950/30">Cancelar</button>
                </div>
            </Form>
        </div>

    </div>

</template>