<script setup>
    import { ref, onMounted, nextTick } from 'vue';
    import api from '@/boot/axios';
    import { useUserStore } from '../stores/userStore.js';
    import {useToastStore} from '../stores/toastStore.js'
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import * as yup from 'yup';

    const genres = ref([]);
    const userStore = useUserStore()
    const toastStore = useToastStore();
    const formIsOpen = ref(false)
    const genre = ref({})
    const validationSchema = yup.object({
        name: yup.string().required("Debe escribir el nombre del género")
            .min(2, "El nombre del género debe tener como mínimo 2 caracteres")
            .max(30, "El nombre del género debe tener como máximo 30 caracteres"),
    })

    const getGenres = async () => {
        try {
            const {data} = await api({
                url: 'genres',
                method: 'GET'
            })
            genres.value = data.result

            return genres
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

        const deleteGenre = async (genreId) => {
        try {
            if(confirm("¿Está seguro? La operación es irreversible")){
                const {data} = await api({
                    url:`/genres/${genreId}`,
                    method: 'DELETE',
                    headers:{
                        Authorization: "Bearer " + userStore.token
                    }
                })
                toastStore.alert(data.message)
                genres.value = genres.value.filter(genre => genre._id !== genreId)
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

    const createGenre = async (values) => {
        try {
            const {data} = await api.post('genres',
                {
                    name: values.name
                },
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                }
            )
            
            genre.value = data.createdGenre
            toastStore.alert(data.msg)
            
            genres.value.push(genre.value)

            return genre

        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }finally{
            formIsOpen.value = false
        }
    }

    onMounted(async()=> {
        await getGenres()
    })
</script>

<template>
    <div class="flex flex-col gap-8 w-full ">

        <ul class="flex flex-col max-h-[560px] rounded-b-md divide-y divide-neon-blue/30 bg-dark-surface border-[1px] border-neon-blue/30 overflow-y-scroll">
            <li v-for="genre in genres"  class="py-2 px-20 flex flex-row justify-between items-center">
                <p class="font-semibold text-lg text-gray-200">{{genre.name}}</p>
                <!-- <div class="flex flex-row gap-3">
                    <v-icon name="oi-pencil" scale="1.3" class="text-neon-blue"/>
                    <v-icon name="md-delete-outlined" scale="1.3" class="text-red-950"/>
                </div> -->
                <button type="button" @click="deleteGenre(genre._id)">
                    <v-icon name="md-delete-outlined" scale="1.3" class="text-red-950"/>
                </button>
            </li>
        </ul>
        <div class="flex flex-row justify-center">
            <!-- añadir enlace ha vista de formulario -->
            <button type="button" class="px-8 py-2 rounded-md font-semibold text-lg bg-neon-blue" @click="handleAddButton">{{formIsOpen ? 'Cancelar' : 'Añadir'}}</button>
        </div>
        <div v-if="formIsOpen" class="flex flex-col items-center justify-center gap-2 p-3 bg-dark-surface rounded-md border-[1px] border-neon-blue/30">

            <Form id="form" v-bind:validation-schema="validationSchema" @submit="createGenre" class="flex flex-col items-center gap-2">      
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2 justify-center">
                        <label for="gName" class="font-bold text-gray-400"> Nombre del género:</label>
                        <Field id="gName" name="name" type="text" class=" bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
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