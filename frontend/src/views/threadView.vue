<script setup>
    import { ref, onMounted, computed, nextTick } from 'vue';
    import api from '@/boot/axios';
    import { useRoute } from 'vue-router';
    import { formatRelativeDate } from "@/utils/date.js";
    import { useUserStore } from '../stores/userStore.js';
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import * as yup from 'yup';
    import {useToastStore} from '../stores/toastStore.js'

    import tiptap from '../components/TipTap.vue'
    const content = ref('')
    const contentThread = ref('')
    const title = ref('')
    const thread = ref({})
    const route = useRoute()
    const userStore = useUserStore()
    const reportingPostId = ref(null)
    const toastStore = useToastStore();
    const reportingKindPost = ref(null)
    const formMode = ref('create');
    const writeReplyIsOpen = ref(false)
    const replyId = ref(null)
    const replies = ref([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const isEditingThread = ref(false)

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


   const reportValidationSchema = yup.object({
        reportContent: yup.string().required("Debe escribir un motivo")
            .max(1000, "La reseña puede contener 1000 caracteres como máximo")
    })

    const replyValidationSchema = yup.object({
        content: yup.string().required("La respuesta no puede quedar vacía")
            .max(8000, "La reseña puede contener 8000 caracteres como máximo")
    })

    const threadValidationSchema = yup.object({
        content: yup.string().required("La respuesta no puede quedar vacía")
            .max(8000, "La reseña puede contener 8000 caracteres como máximo"),
        title: yup.string().required("El título no puede quedar vacío")
            .max(50, "El título no puede contener más de 50 caracteres")
            .min(5, "El título debe contener más de 5 caracteres")
    })
    const getThread = async () => {
        try {
            const {data} = await api({
                url: route.path,
                method: 'GET'
            })

            console.log(data.result)
            thread.value = data.result

            return thread
        } catch (error) {
            console.log("ERROR: ", error)
        }
    }

    const getReplies = async() => {
        try {
            const {data} = await api({
                url:route.path + `/replies?page=${currentPage.value}`,
                method: 'GET'
            })

            replies.value = data.result;
            currentPage.value = data.currentPage;
            totalPages.value = data.totalPages;

            return replies
        } catch (error) {
            console.log("ERROR: ", error)
        }
    }

    const goToPage = async (page) => {
        currentPage.value = page;
        console.log(currentPage.value)
        await getReplies()
    }

    const handleReportButton = (id, kind) => {
        if (reportingPostId.value === id) {
            reportingPostId.value = null;
            reportingKindPost.value = null;
        } else {
            reportingPostId.value = id;
            reportingKindPost.value = kind
        }
    }

    const sendReport = async (values) => {
        try {
            let urlToPost = route.path
            if(reportingKindPost.value === 'Reply'){
                urlToPost += `#r-${reportingPostId.value}`
            }
            const {data} = await api.post(`posts/${reportingPostId.value}/report`,
                {
                    reason: values.reportContent,
                    urlToPost: urlToPost
                },
                {
                    headers: {
                        Authorization: "Bearer" + userStore.token
                    }
                }
            )
            toastStore.alert(data.msg)

            console.log(values.reportContent)
            reportingPostId.value = null;
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }
    const handleClickUpdateThreadButton = (thread) => {
        console.log(thread)
        isEditingThread.value = !isEditingThread.value
        contentThread.value = thread.content
        title.value = thread.title
    }

    const editThread = async (values) => {
        try {
            await api.put(`threads/${route.params.threadId}`,
                {
                    title: values.title,
                    content: values.content
                },
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                }
            )
            toastStore.alert('Publicación modificada con éxito')
            isEditingThread.value = false 
            await getThread()
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }

    }

    const errorSubmit = (result) => {
        console.log(result)
    }

    const handleClickWriteReplyButton = () => {
        formMode.value = 'create'
        content.value = ''

        writeReplyIsOpen.value = !writeReplyIsOpen.value
    }
    const handleClickUpdateReply = async (reply) => {
        formMode.value = 'update'
        writeReplyIsOpen.value = !writeReplyIsOpen.value
        content.value = reply.content
        replyId.value = reply._id
        await nextTick();
        document.getElementById('replyForm')?.scrollIntoView({
            behavior: 'smooth'
        });
    }

    const postReply = async (values) => {
        try{
            if(formMode.value === 'create'){
                let url = route.path + '/replies'
                await api.post(url,
                    {
                        content: values.content
                    },
                    {
                        headers: {
                            Authorization: "Bearer " + userStore.token
                        }
                    }
                )
                console.log(values)
                toastStore.alert('Respuesta publicada con éxito')
            }
            if(formMode.value === 'update'){
                await api.put(`/replies/${replyId.value}`,
                    {
                        content: values.content
                    },
                    {
                        headers: {
                            Authorization: "Bearer " + userStore.token
                        }
                    }
                )
                toastStore.alert('Respuesta modificada con éxito')
            }
            writeReplyIsOpen.value = false
            await getReplies()

        }catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }finally {

        }
    }

    const votePost = async (postId, vote) => {
        try {
            let {data} = await api.put(`/posts/${postId}/vote/${vote}`)
            toastStore.alert(data.msg)
            await getThread()
            await getReplies()
            // await nextTick()
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const changeThreadStatus = async () => {
        try {
            let status
            if(thread.value.status === 'Abierto'){
                status = 'Cerrado'
            }else{
                status = 'Abierto'
            }
            await api.patch(`/threads/${route.params.threadId}`,
                {
                    status: status
                },
                {
                    headers: {
                        Authorization: 'Bearer ' + userStore.token
                    }
                }
            )
            toastStore.alert(`Hilo ${status.toLocaleLowerCase()} con éxito`)
            await getThread()

        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }
    onMounted(async() => {
        try {
            await getThread()
            await getReplies()
            console.log(thread.value)
        } catch (error) {
            console.log("ERROR: ", error)
        }
    })
</script>

<template>

    <div class="flex flex-col max-w-[80%] mx-auto gap-5">
        <!-- hilo -->
        <div class="flex flex-col gap-5 ">
            <!-- encabezado hilo -->
            <Form v-if="isEditingThread" v-bind:validation-schema="threadValidationSchema" @submit="editThread" @invalid-submit="errorSubmit" class="flex flex-col gap-5">
                <div class="flex flex-col gap-1">
                    <!-- info hilo -->
                    <h2 class="font-bold text-2xl text-gray-400">{{thread.category?.name}}</h2>
                    <div class="flex">
                        <label for="t-title" class="text-4xl font-bold text-white ">Título:</label>
                        <div class="flex flex-col w-full ps-2">
                            <Field v-model="title" @keydown.enter.prevent id="t-title" name="title" type="text" class="bg-dark-surface text-gray-200 rounded-lg h-full w-full"></Field>
                            <p class="text-red-500 text-sm">
                                <ErrorMessage name="title"></ErrorMessage>
                            </p>

                        </div>

                    </div>
                    <div class="flex flex-row gap-2 font-medium text-sm text-gray-400">
                        <time :datetime="thread.createdAt">{{ formatRelativeDate(thread.createdAt) }}</time>
                        <span >•</span>
                        <p>{{thread.numReplies + ' respuestas'}}</p>
                    </div>
                </div>

                <div class="flex flex-row rounded-2xl border-[1px] border-neon-blue/20 bg-dark-surface divide-x divide-neon-blue/20 overflow-hidden">
                <!-- user -->
                <div class="flex flex-col gap-2 py-7 justify-start items-center w-64 shrink-0 bg-dark-reply">
                    <div class="w-32 h-32">
                        <img :src="thread.user?.profilePic?.secure_url" class="w-full h-full object-cover rounded-2xl border-[1px] border-neon-blue"/>
                    </div>
                    <p class="font-bold text-2xl text-white">{{ thread.user?.userName }}</p>
                </div>
                <!-- contenido -->
                <div class="flex flex-col justify-between w-full divide-y divide-neon-blue/20">
                    <Field v-model="contentThread" name="content">
                        <tiptap v-model="contentThread" class="tiptap"/>
                    </Field>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="content"></ErrorMessage>
                    </p>
                    <div class="flex justify-center p-2">
                        <button type="submit" class="bg-neon-blue px-6 py-1 rounded-lg font-semibold text-xl">Publicar</button>
                    </div>

                    <!-- footer -->
                    <div class="flex flex-row justify-between items-center px-7 py-2">
                        <div class="flex flex-row gap-2 text-gray-400">
                            <button @click="votePost(thread._id, '1')" class="flex flex-row gap-1 items-center hover:bg-neon-blue/20 p-1 rounded-md">
                                <v-icon name="md-thumbup-round" class="text-neon-blue"/>
                                <p class="font-semibold text-xs">Sí (<span>{{ thread.positiveVotes }}</span>)</p>
                            </button>
                            <button @click="votePost(thread._id, '-1')" class="flex flex-row gap-1 items-center hover:bg-neon-blue/20 p-1 rounded-md">
                                <v-icon name="md-thumbup-round" flip="vertical" class="text-neon-blue"/>
                                <p class="font-semibold text-xs">No (<span>{{ thread.negativeVotes }}</span>)</p>
                            </button>
                            <button v-if="thread.user?._id !== userStore.userId" @click="handleReportButton(thread._id, thread.kind)" class="text-base hover:underline hover:bg-neon-blue/20 p-1 rounded-md">Reportar</button>
                        </div>
                        <button v-if="thread.user?._id === userStore.userId && thread.status === 'Abierto'" @click="handleClickUpdateThreadButton(thread)" class="flex flex-row items-center gap-1 px-3 py-1 rounded-md border-[1px] border-neon-blue bg-neon-blue/10 ">
                            <v-icon name="oi-pencil" scale="1" class="text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]"/>
                            <span class="font-bold text-xs text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">Cancelar</span>
                        </button>
                    </div>

                </div>
            </div>
            </Form>
            <!-- PArte de antes -->
            <div v-else class="flex flex-col gap-5">
                <div class="flex flex-col gap-1">
                    <!-- info hilo -->
                    <div class="flex justify-between">
                        <h2 class="font-bold text-2xl text-gray-400">{{thread.category?.name}}</h2>
                        <button v-if="userStore.isModOrAdmin" @click="changeThreadStatus" class="text-gray-400">{{ thread.status === 'Abierto' ? 'Cerrar hilo' : 'Abrir hilo'}}</button>
                    </div>
                    <h1 class="font-bold text-4xl text-white">{{thread.title}}</h1>
                    <!-- <Form v-bind:validation-schema="threadValidationSchema" @submit="editThread">
                        <label for="t-title">Título</label>
                        <Field v-model="title" id="t-title" name="title" type="text"></Field>
                        <p class="text-red-500 text-sm text-center">
                            <ErrorMessage name="title"></ErrorMessage>
                        </p>
                    </Form> -->
                    <div class="flex flex-row gap-2 font-medium text-sm text-gray-400">
                        <time :datetime="thread.createdAt">{{ formatRelativeDate(thread.createdAt) }}</time>
                        <span >•</span>
                        <p>{{thread.numReplies + ' respuestas'}}</p>
                    </div>
                </div>
                <!-- body hilo -->
                <div class="flex flex-row rounded-2xl border-[1px] border-neon-blue/20 bg-dark-surface divide-x divide-neon-blue/20 overflow-hidden">
                    <!-- user -->
                    <div class="flex flex-col gap-2 py-7 justify-start items-center w-64 shrink-0 bg-dark-reply">
                        <div class="w-32 h-32">
                            <img :src="thread.user?.profilePic?.secure_url" class="w-full h-full object-cover rounded-2xl border-[1px] border-neon-blue"/>
                        </div>
                        <p class="font-bold text-2xl text-white">{{ thread.user?.userName }}</p>
                    </div>
                    <!-- contenido -->
                    <div class="flex flex-col justify-between w-full divide-y divide-neon-blue/20">
                        <!-- <Form v-if="isEditingThread" v-bind:validation-schema="threadValidationSchema" @submit="editThread" @invalid-submit="errorSubmit" class="flex flex-col rounded-md bg-dark-surface border-[1px] border-neon-blue/20">
                            <Field v-model="content" name="content">
                                <tiptap v-model="content" class="tiptap"/>
                            </Field>
                            <p class="text-red-500 text-sm text-center">
                                <ErrorMessage name="content"></ErrorMessage>
                            </p>
                            <div class="flex justify-center p-2">
                                <button type="submit" class="bg-neon-blue px-6 py-1 rounded-lg font-semibold text-xl">Publicar</button>
                            </div>
                        </Form>
                        <p v-else v-html="thread.content" class="flex p-7 text-base font-medium text-gray-200 tiptap"></p> -->
                        <p v-html="thread.content" class="flex p-7 text-base font-medium text-gray-200 tiptap"></p>
                        <!-- footer -->
                        <div class="flex flex-row justify-between items-center px-7 py-2">
                            <div class="flex flex-row gap-2 text-gray-400">
                                <button @click="votePost(thread._id, '1')" class="flex flex-row gap-1 items-center hover:bg-neon-blue/20 p-1 rounded-md">
                                    <v-icon name="md-thumbup-round" class="text-neon-blue"/>
                                    <p class="font-semibold text-xs">Sí (<span>{{ thread.positiveVotes }}</span>)</p>
                                </button>
                                <button @click="votePost(thread._id, '-1')" class="flex flex-row gap-1 items-center hover:bg-neon-blue/20 p-1 rounded-md">
                                    <v-icon name="md-thumbup-round" flip="vertical" class="text-neon-blue"/>
                                    <p class="font-semibold text-xs">No (<span>{{ thread.negativeVotes }}</span>)</p>
                                </button>
                                <button v-if="thread.user?._id !== userStore.userId" @click="handleReportButton(thread._id, thread.kind)" class="text-base hover:underline hover:bg-neon-blue/20 p-1 rounded-md">Reportar</button>
                            </div>
                            <button v-if="thread.user?._id === userStore.userId && thread.status === 'Abierto'" @click="handleClickUpdateThreadButton(thread)" class="flex flex-row items-center gap-1 px-3 py-1 rounded-md border-[1px] border-neon-blue bg-neon-blue/10 ">
                                <v-icon name="oi-pencil" scale="1" class="text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]"/>
                                <span class="font-bold text-xs text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">Modificar publicación</span>
                            </button>
                        </div>
    
                    </div>
                </div>

            </div>
            <Form v-if="reportingPostId === thread._id" v-bind:validation-schema="reportValidationSchema" @submit="sendReport" id="reportForm" class="flex flex-col gap-2 p-3 bg-dark-surface border-[1px] border-neon-blue/20">
                <div class="flex flex-col gap-1">
                    <label class="font-bold text-gray-400 mx-1">Indique el motivo del reporte:</label>
                    <Field as="textarea" name="reportContent" cols="50" rows="4" class="bg-dark-base text-gray-400 font-normal w-full h-36 p-5 report-area"></Field>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="reportContent"></ErrorMessage>
                    </p>
                </div>
                <div class="flex justify-center">
                    <button class="bg-neon-blue px-6 py-1 rounded-lg font-semibold text-xl" type="submit">Enviar</button>
                </div>
            </Form>
        </div>

        <div class="flex justify-center">
            <button v-if="thread.status === 'Abierto'" @click="handleClickWriteReplyButton" class="px-7 py-2 rounded-2xl bg-neon-blue">{{writeReplyIsOpen === false ? 'Responder' : 'Cerrar'}}</button>
        </div>
        <Form v-if="writeReplyIsOpen" v-bind:validation-schema="replyValidationSchema" @submit="postReply" id="replyForm" class="flex flex-col rounded-md bg-dark-surface border-[1px] border-neon-blue/20">
            <div class="flex flex-col gap-1">
                <Field v-model="content" name="content">
                    <tiptap v-model="content" class="tiptap"/>
                </Field>
                <!-- <Field v-model="replyText" as="textarea" id="contentReply" name="content" cols="50" rows="4" class="bg-dark-base text-gray-400 font-normal w-full h-36 p-5 "></Field> -->
                <p class="text-red-500 text-sm text-center">
                    <ErrorMessage name="content"></ErrorMessage>
                </p>
            </div>
            <div class="flex justify-center p-2">
                <button class="bg-neon-blue px-6 py-1 rounded-lg font-semibold text-xl" type="submit">Enviar</button>
            </div>
        </Form>

        <!-- contenedor label + replies -->
        <div class="flex flex-col gap-5">
            <div class="flex flex-row items-center justify-between">
                <div class="flex flex-row gap-1 items-center">
                    <div class="w-1 h-6 md:h-8 rounded-2xl bg-neon-blue"></div>
                    <h2 class="font-bold sm:text-xl md:text-2xl text-white">Respuestas</h2>
                </div>
                <div class="flex flex-row gap-2 items-center">
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

            <!-- contenedor respuestas -->
            <div class="flex flex-col gap-5">
                <!-- respuesta -->
                <div v-for="reply in replies" class="flex flex-col rounded-2xl border-[1px] border-neon-blue/20 bg-dark-reply divide-x divide-neon-blue/20 overflow-hidden">
                    <!-- user -->
                    <div class="flex flex-row divide-x divide-neon-blue/20 overflow-hidden">

                        <div class="flex flex-col gap-2 py-7 justify-start items-center w-64 shrink-0 bg-dark-reply">
                            <div class="w-20 h-20">
                                <img :src="reply.user?.profilePic?.secure_url" class="w-full h-full object-cover rounded-full border-[1px] border-neon-blue"/>
                            </div>
                            <p class="font-bold text-2xl text-white">{{ reply.user?.userName }}</p>
                        </div>
                        <!-- contenido -->
                        <div class="flex flex-col w-full justify-between divide-y divide-neon-blue/20">
                            <p v-html="reply.content" class="p-7 text-base font-medium text-gray-200 tiptap"></p>
                            <!-- footer -->
                            <div class="flex flex-row justify-between items-center px-7 py-2">
                                <div class="flex flex-row gap-2 text-gray-400">
                                    <button @click="votePost(reply._id, '1')" class="flex flex-row gap-1 items-center hover:bg-neon-blue/20 p-1 rounded-md">
                                        <v-icon name="md-thumbup-round" class="text-neon-blue"/>
                                        <p class="font-semibold text-xs">Sí (<span>{{ reply.positiveVotes }}</span>)</p>
                                    </button>
                                    <button @click="votePost(reply._id, '-1')" class="flex flex-row gap-1 items-center hover:bg-neon-blue/20 p-1 rounded-md">
                                        <v-icon name="md-thumbup-round" flip="vertical" class="text-neon-blue"/>
                                        <p class="font-semibold text-xs">No (<span>{{ reply.negativeVotes }}</span>)</p>
                                    </button>
                                    <button v-if="reply.user?._id !== userStore.userId" @click="handleReportButton(reply._id, reply.kind)" class="text-base hover:underline hover:bg-neon-blue/20 p-1 rounded-md">Reportar</button>
                                </div>
                                <button v-if="reply.user?._id === userStore.userId && thread.status === 'Abierto'" @click="handleClickUpdateReply(reply)" class="flex flex-row items-center gap-1 px-3 py-1 rounded-md border-[1px] border-neon-blue bg-neon-blue/10 ">
                                    <v-icon name="oi-pencil" scale="1" class="text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]"/>
                                    <span class="font-bold text-xs text-neon-blue drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">Modificar respuesta</span>
                                </button>
                            </div>
    
                        </div>
                    </div>
                   
                    <Form v-if="reportingPostId === reply._id" v-bind:validation-schema="reportValidationSchema" @submit="sendReport" id="reportForm" class="flex flex-col gap-2 p-3 bg-dark-surface border-[1px] border-neon-blue/20">
                        <div class="flex flex-col gap-1">
                            <label class="font-bold text-gray-400 mx-1">Indique el motivo del reporte:</label>
                            <Field as="textarea" name="reportContent" cols="50" rows="4" class="bg-dark-base text-gray-400 font-normal w-full h-36 p-5 report-area"></Field>
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
    textarea {
        resize: none;
    }
    textarea:focus {
        outline: 1px solid #00d4ff;
    }

    .report-area {
        border-color: rgb(0 212 255 / 0.3);
        border-radius: 16px;
        border-width: 1px;
    }

    input[type=text]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
        
    }
    input[type=text]
    {
        -moz-appearance: textfield;
        padding-left: 4px;
    }
    input[type=text]:focus {
        outline: 1px solid #00d4ff;
    }
</style>