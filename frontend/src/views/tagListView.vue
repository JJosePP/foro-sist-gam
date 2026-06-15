<script setup>
    import { ref, onMounted, nextTick } from 'vue';
    import api from '@/boot/axios';
    import { useUserStore } from '../stores/userStore.js';
    import {useToastStore} from '../stores/toastStore.js'
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import * as yup from 'yup';

    const tags = ref([]);
    const userStore = useUserStore()
    const toastStore = useToastStore();
    const formIsOpen = ref(false)
    const tag = ref({})
    const validationSchema = yup.object({
        name: yup.string().required("Debe escribir el nombre de la etiqueta")
            .min(2, "El nombre de la etiqueta debe tener como mínimo 2 caracteres")
            .max(30, "El nombre de la etiqueta debe tener como máximo 30 caracteres"),
    })

    const getTags = async () => {
        try {
            const {data} = await api({
                url: 'tags',
                method: 'GET'
            })
            tags.value = data.result

            return tags
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const deleteTag = async (tagId) => {
        try {
            if(confirm("¿Está seguro? La operación es irreversible")){
                const {data} = await api({
                    url:`/tags/${tagId}`,
                    method: 'DELETE',
                    headers:{
                        Authorization: "Bearer " + userStore.token
                    }
                })
                toastStore.alert(data.message)
                tags.value = tags.value.filter(tag => tag._id !== tagId)
            }else{
                return
            }
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const handleAddButton = async () => {
        formIsOpen.value = !formIsOpen.value
        await nextTick()
        document.getElementById('form')?.scrollIntoView({
            behavior: 'smooth'
        });
    }

    const createTag = async (values) => {
        try {
            const {data} = await api.post('tags',
                {
                    name: values.name
                },
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                }
            )
            
            tag.value = data.createdTag
            toastStore.alert(data.msg)
            
            tags.value.push(tag.value)

            return tag

        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }finally{
            formIsOpen.value = false
        }
    }

    onMounted(async()=> {
        await getTags()
    })
</script>

<template>
    <div class="flex flex-col gap-8 w-full">

        <ul class="flex flex-col  max-h-[560px] rounded-b-md divide-y divide-neon-blue/30 bg-dark-surface border-[1px] border-neon-blue/30 overflow-y-scroll">
            <li v-for="tag in tags"  class="py-2 px-20 flex flex-row justify-between items-center">
                <p class="font-semibold text-lg text-gray-200">{{tag.name}}</p>

                <button type="button" @click="deleteTag(tag._id)">
                    <v-icon name="md-delete-outlined" scale="1.3" class="text-red-950"/>
                </button>
            </li>
        </ul>
        <div class="flex flex-row justify-center">
            <button type="button" class="px-8 py-2 rounded-md font-semibold text-lg bg-neon-blue" @click="handleAddButton">{{formIsOpen ? 'Cancelar' : 'Añadir'}}</button>          
        </div>

        <div v-if="formIsOpen" class="flex flex-col items-center justify-center gap-2 p-3 bg-dark-surface rounded-md border-[1px] border-neon-blue/30">

            <Form id="form" v-bind:validation-schema="validationSchema" @submit="createTag" class="flex flex-col items-center gap-2">
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2 justify-center">
                        <label for="tName" class="font-bold text-gray-400"> Nombre de la etiqueta:</label>
                        <Field id="tName" name="name" type="text" class=" bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                </div>
                <p class="text-red-500 text-sm text-center">
                    <ErrorMessage name="name"></ErrorMessage>       
                </p>
                <div class="flex flex-row justify-center">
                    <button type="submit" class="px-4 py-1 bg-neon-blue rounded-md font-semibold">Crear</button>
                </div>
            </Form>
        </div>
    </div>
</template>