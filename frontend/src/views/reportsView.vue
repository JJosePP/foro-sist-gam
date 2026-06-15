<script setup>
    import { ref, onMounted } from 'vue';
    import api from '@/boot/axios';
    import { useUserStore } from '../stores/userStore.js';
    import { formatRelativeDate } from '@/utils/date';
    import {useToastStore} from '../stores/toastStore.js'
    import { Form, Field, ErrorMessage } from 'vee-validate';
    import * as yup from 'yup';

    const userStore = useUserStore()
    const reports = ref([])
    const toastStore = useToastStore();
    const formIsOpen = ref(false)
    const selectedReport = ref(null)
    const moderationSchema = yup.object({
        reason: yup.string().required('Debe elegir una opción')
        // .oneOf(['Ofensivo', 'Spam', 'Fuera de tema', 'Lenguaje inapropiado'], 'Los valores posibles son: Ofensivo, Spam, Fuera de tema, Lenguaje inapropiado')
    })

    const getReports = async () => {
        try {
            const {data} = await api({
                url: 'reports',
                method: 'GET',
                headers: {
                    Authorization: "Bearer " + userStore.token
                }
            })
            reports.value = data.reports
            return reports
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const removeReport = async (reportId, index) => {
        try {
            const {data} = await api({
                url: `/reports/${reportId}`,
                method: 'DELETE',
                headers: {
                    Authorization: "Bearer " + userStore.token
                }
            })
            toastStore.alert(data.message)
            reports.value.splice(index,1)
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const handleSubmit = async (values, index, postId, reportId) =>{
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
            console.log(data.msg)
            toastStore.alert(data.msg)
            await removeReport(reportId, index)
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const handleAcceptButton = (reportId) => {
        formIsOpen.value = true;
        selectedReport.value = reportId
    }
    const handleCancelButton = () => {
        formIsOpen.value = false;
        selectedReport.value = null
    }

    onMounted(async () => {
        if(!userStore.isModOrAdmin){
            toastStore.alert('No está autorizado a entrar en esta sección', 'error')
            router.push({path: '/'})
        }
        await getReports()
        console.log(reports.value)
    })

</script>

<template>
    <div class="flex flex-col gap-8 w-full">
        <div class="flex flex-col rounded-b-md divide-y divide-neon-blue/30 bg-dark-surface border-[1px] border-neon-blue/30 overflow-y-scroll">
            <div v-for="(report, index) in reports" class="py-2 px-20 grid grid-cols-8 justify-between items-center">
                <div class="flex flex-row items-center gap-2">
                    <div class="w-10 h-10">
                        <img :src="report.user.profilePic.secure_url" class="w-full h-full object-cover rounded-full">
                    </div>
                    <p class="font-semibold text-lg text-gray-200">{{report.user.userName}}</p>
                </div>
                
                <p class="col-span-2 h-32 overflow-y-scroll font-medium p-2 text-lg text-gray-200">{{report.reason}}</p>
            
                <p v-html="report.post.content" class="col-span-2 h-32 overflow-y-scroll font-medium p-2 text-lg text-gray-200 tiptap"></p>

                <time :datetime="report.createdAt" class="justify-self-center font-medium text-lg text-gray-200">{{formatRelativeDate(report.createdAt)}}</time>

                <RouterLink :to="report.urlToPost" class="justify-self-center font-medium text-base underline hover:text-neon-blue text-gray-200">Ir a la publicación</RouterLink>

                <div v-if="!formIsOpen" class="flex flex-col gap-2">
                    <button type="button" @click="handleAcceptButton(report._id)" class="p-1 underline text-gray-400 hover:text-neon-blue">
                        Aceptar
                    </button>
                    <button type="button" @click="removeReport(report._id, index)" class="p-1 underline text-gray-400 hover:text-red-900">
                        Denegar
                    </button>
                </div>
                <Form v-if="formIsOpen && selectedReport === report._id" @submit="(values)=>handleSubmit(values, index,report.post._id, report._id)" v-bind:validation-schema="moderationSchema" class="flex flex-col gap-1">
                    <div class="flex flex-col gap-2 w-full items-center">
                        <div class="w-full flex gap-2">
                            <label for="rReason" class="font-bold text-gray-400">Motivo:</label>
                            <Field id="rReason" name="reason" as="select">
                                <option value="">Seleccionar motivo</option>
                                <option value="Ofensivo">Ofensivo</option>
                                <option value="Spam">Spam</option>
                                <option value="Fuera de tema">Fuera de tema</option>
                                <option value="Lenguaje inapropiado">Lenguaje inapropiado</option>
                            </Field>                  
                        </div>
                        <p class="text-red-500 text-sm text-center">
                            <ErrorMessage name="reason"></ErrorMessage>
                        </p>
                    </div>
                    <button type="submit" class="p-1 underline text-gray-400 hover:text-neon-blue">Confirmar</button>
                    <button type="button" @click="handleCancelButton" class="p-1 underline text-gray-400 hover:text-red-900">Cancelar</button>
                </Form>
            </div>
        </div>
        
    </div>
</template>