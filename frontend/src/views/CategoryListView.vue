<script setup>
    import { ref, onMounted, nextTick } from 'vue';
    import api from '@/boot/axios';
    import { useUserStore } from '../stores/userStore.js';
    import {useToastStore} from '../stores/toastStore.js'
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import * as yup from 'yup';


    const categories = ref([]);
    const userStore = useUserStore()
    const toastStore = useToastStore();
    const formIsOpen = ref(false)
    const selectedFile = ref(null)
    const category = ref({})

    const validationSchema = yup.object({
        name: yup.string().required("Debe escribir el nombre de la categoría")
            .min(2, "El nombre de la categoría debe tener como mínimo 2 caracteres")
            .max(30, "El nombre de la categoría debe tener como máximo 30 caracteres"),
        description: yup.string().required("Debe introducir una descripción")
            .max(200, "La descripción puede tener 200 caracteres como máximo"),
        image: yup.mixed().required("Debe seleccionar una imagen")
            .test('fileType', 'Solo se permiten imágenes',
                (file) => {
                    if(!file) return false

                    if(!file.type.startsWith("image/")){
                        return false
                    }
                    return true
                }
            )
    })

    const getCategories = async () => {
        try {
            const {data} = await api({
                url: 'categories',
                method: 'GET'
            })
            categories.value = data.result

            return categories
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const deleteCategory = async (categoryId) => {
        try {
            if(confirm("¿Está seguro? La operación es irreversible")){
                const {data} = await api({
                    url:`/categories/${categoryId}`,
                    method: 'DELETE',
                    headers:{
                        Authorization: "Bearer " + userStore.token
                    }
                })
                toastStore.alert(data.message)
                categories.value = categories.value.filter(category => category._id !== categoryId)
            }else{
                return
            }
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
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

    const handleAddButton = async () => {
        formIsOpen.value = !formIsOpen.value
        await nextTick()
        document.getElementById('form')?.scrollIntoView({
            behavior: 'smooth'
        });
    }
    const createCategory = async (values) => {
        try {
            const formData = new FormData()
            formData.append('name', values.name)
            formData.append('description', values.description)
            formData.append('image', selectedFile.value)

            const {data} = await api.post('categories',
                formData,
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                }
            )

            category.value = data.createdCategory
            toastStore.alert(data.msg)
            
            categories.value.push(category.value)

            return category
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }finally{
            formIsOpen.value = false
        }
    }
    onMounted(async()=> {
        await getCategories()
        console.log("CARGA")
    })
</script>

<template>
    <div class="flex flex-col gap-8 w-full">

        <ul class="flex flex-col max-h-[560px] rounded-b-md divide-y divide-neon-blue/30 bg-dark-surface border-[1px] border-neon-blue/30 overflow-y-scroll">
            <li v-for="category in categories"  class="py-2 px-20 flex flex-row justify-between items-center">
                <p class="font-semibold text-lg text-gray-200">{{category.name}}</p>
                <!-- <div class="flex flex-row gap-3">
                    <v-icon name="oi-pencil" scale="1.3" class="text-neon-blue"/>
                    <v-icon name="md-delete-outlined" scale="1.3" class="text-red-950"/>
                </div> -->
                <button type="button" @click="deleteCategory(category._id)">
                    <v-icon name="md-delete-outlined" scale="1.3" class="text-red-950"/>
                </button>
            </li>
        </ul>
        <div class="flex flex-row justify-center">
            <button type="button" class="px-8 py-2 rounded-md font-semibold text-lg bg-neon-blue" @click="handleAddButton">{{formIsOpen ? 'Cancelar' : 'Añadir'}}</button>
        </div>

        <div v-if="formIsOpen" class="flex flex-col items-center justify-center gap-2 p-3 bg-dark-surface rounded-md border-[1px] border-neon-blue/30">

            <Form id="form" v-bind:validation-schema="validationSchema" @submit="createCategory" class="flex flex-col gap-2">
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="cName" class="font-bold text-gray-400"> Nombre de la categoria:</label>
                        <Field id="cName" name="name" type="text" class=" bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="name"></ErrorMessage>       
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="cDescription" class="font-bold text-gray-400"> Descripción:</label>            
                        <Field id="cDescription" name="description" as="textarea" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="description"></ErrorMessage>
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-5">
                        <label class="font-bold text-gray-400">Imagen:</label>
                        <label for="cImage" class="flex custom-file-upload py-1 px-4 rounded-md bg-neon-blue/50">
                            <v-icon name="fa-cloud-upload-alt"/>
                            Elegir imagen
                        </label>
                        <Field id="cImage" name="image" type="file" @change="handleFile"/>
                    </div>
                    <div class="flex flex-row justify-center">
                        <div class="w-36 h-36 rounded-md shrink-0">
                            <img v-if="category.image?.secure_url" id="output" :src="category.image.secure_url" class="w-full h-full object-contain border-neon-blue/30 border-[1px] rounded-md">
                            <img v-else id="output" class="w-full h-full border-neon-blue/30 border-[1px] rounded-md">
                        </div>
                    </div>
                    <p class="text-red-500 text-sm text-center ">
                        <ErrorMessage name="image"></ErrorMessage>
                    </p>
                </div>
                <div class="flex flex-row justify-center">
                    <button type="submit" class="px-4 py-1 bg-neon-blue rounded-md font-semibold">Crear</button>
                </div>
            </Form>

        </div>

    </div>
</template>