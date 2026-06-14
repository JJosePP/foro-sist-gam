<script setup>
    import { ref, onMounted, nextTick } from 'vue';
    import api from '@/boot/axios';
    import { useUserStore } from '../stores/userStore.js';
    import {useToastStore} from '../stores/toastStore.js'
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import * as yup from 'yup';


    const quizzes = ref([]);
    const userStore = useUserStore()
    const toastStore = useToastStore();
    const formIsOpen = ref(false)
    const quiz = ref({
        title: null,
        description: null,
        badge: {
            badgeName: null,
            image: {
                secure_url: null,
                public_id: null
            }
        },
        tags: [],
        difficulty: null,
        numQuestions: null
    })
    const selectedFile = ref(null)
    const tags = ref([])
    const formMode = ref('create')
    const selectedQuizIndex = ref(null)

    const transformNaNToNull = (value) => {
        return Number.isNaN(value) ? null : value
    }

    const validationSchema = yup.object({
        title: yup.string().required("Debe escribir un título")
            .min(5, "El título debe tener como mínimo 5 carácter")
            .max(50, "El título debe tener como máximo 50 caracteres"),
        description: yup.string().optional().nullable().max(1000, "La descripción puede tener 1000 caracteres como máximo"),
        difficulty: yup.string().required("Debe seleccionar un nivel de dificultad"),
        tags: yup.array().required("Debe seleccionar al menos una etiqueta")
            .min(1,"Debe seleccionar al menos una etiqueta"),
        numQuestions: yup.number().transform(transformNaNToNull).nullable().required("Debe introducir un valor numérico")
            .min(10, "El valor mínimo es 10")
            .integer("Debe introducir un valor entero"),

        badgeName: yup.string().required("Debe introducir el nombre de la insignia")
            .min(2, "El nombre de la insignia debe tener como mínimo 2 carácter")
            .max(30,"El nombre de la insignia debe tener como máximo 50 caracteres"),
        badgeImage: yup.mixed().required("Debe seleccionar una imagen")
            .test('fileType', 'Solo se permiten imágenes',
                (file) => {
                    if(!file){
                        return false   
                    } 
                    if(typeof file === 'string' && file.startsWith("https://res.cloudinary.com/jjose/image/upload")){
                        return true   
                    } 
                    if(file && !file.type?.startsWith("image/")){
                        return false
                    }
                    return true
                }
            )
    })

    const getQuizzes = async () => {
        try {
            const {data} = await api({
                url: 'quizzes/admin',
                method: 'GET'
            })
            quizzes.value = data
            return quizzes
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const deleteQuiz = async (quizId) => {
        try {
            if(confirm("¿Está seguro? La operación es irreversible")){
                const {data} = await api({
                    url:`/quizzes/${quizId}`,
                    method: 'DELETE',
                    headers:{
                        Authorization: "Bearer " + userStore.token
                    }
                })
                toastStore.alert(data.msg)
                quizzes.value = quizzes.value.filter(quiz => quiz._id !== quizId)
            }else{
                return
            }
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

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

    const handleAddButton = async () => {
        resetForm()
        formMode.value = 'create'
        formIsOpen.value = !formIsOpen.value

        if(formIsOpen.value && tags.value.length === 0){
            await getTags();
        }

        document.getElementById('form')?.scrollIntoView({
            behavior: 'smooth'
        });
    }

    const handleEditButton = async (q,index) => {
        resetForm()
        console.log('var index: ', index)
        formMode.value = 'update'
        formIsOpen.value = true
        selectedQuizIndex.value = index
        quiz.value = {
            ...q,
            tags: q.tags.map(tag => tag._id)
        }

        if(formIsOpen.value && tags.value.length === 0){
            await getTags();
        }
        await nextTick()
        document.getElementById('form')?.scrollIntoView({
            behavior: 'smooth'
        });
    }

    const handleFile = (event) => {
        selectedFile.value = event.target.files[0];
        let output = document.getElementById('output');
        output.src = URL.createObjectURL(selectedFile.value);
        output.onload = function () {
            URL.revokeObjectURL(output.src)
        }
    }

    const createQuiz = async (values) => {
        const formData = new FormData()
        formData.append('title', values.title)
        formData.append('description', values.description)
        formData.append('difficulty', values.difficulty)
        formData.append('numQuestions', values.numQuestions)
        values.tags.forEach(tag => {
            formData.append('tags[]', tag)
        })
        formData.append('image', selectedFile.value)
        formData.append('badgeName', values.badgeName)

        const {data} = await api.post('quizzes',
            formData,
            {
                headers: {
                    Authorization: "Bearer " + userStore.token
                }
            }
        )
        quiz.value = data.createdQuiz
        toastStore.alert(data.msg)

        quizzes.value.push(quiz.value)

        return quiz
    }

    const editQuiz = async (values) => {
        const formData = new FormData()
        formData.append('title', values.title)
        formData.append('description', values.description)
        formData.append('difficulty', values.difficulty)
        formData.append('numQuestions', values.numQuestions)
        values.tags.forEach(tag => {
            formData.append('tags[]', tag)
        })
        formData.append('badgeName', values.badgeName)
        if(selectedFile.value) {
            formData.append('image', selectedFile.value)
        }

        const {data} = await api.put(`quizzes/${quiz.value._id}`,
            formData,
            {
                headers: {
                    Authorization: "Bearer " + userStore.token
                }
            }
        )
        
        console.log(selectedQuizIndex.value)
        quizzes.value[selectedQuizIndex.value] = data.editedQuiz

        toastStore.alert(data.msg)
        await nextTick()

        return quiz
    }

    const handleSubmit = async (values) => {
        try {
            if(formMode.value === 'create'){
                await createQuiz(values)
            }
            if(formMode.value === 'update'){
                await editQuiz(values)
            }  
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }finally{
            formIsOpen.value = false
            resetForm()
        }
    }

    const resetForm = () => {
        quiz.value = {
            title: null,
            description: null,
            badge: {},
            tags: [],
            difficulty: null,
            numQuestions: null
        }
        selectedFile.value = null
        selectedQuizIndex.value = null
    }

    onMounted(async()=> {
        await getQuizzes()
    })
</script>

<template>
    <div class="flex flex-col gap-8 w-full">

        <div class="flex flex-col max-h-[560px] rounded-b-md divide-y divide-neon-blue/30 bg-dark-surface border-[1px] border-neon-blue/30 overflow-y-scroll">
            <div v-for="(quiz,index) in quizzes"  class="py-2 px-20 grid grid-cols-6 justify-between items-center">
                <p class="col-span-2 font-semibold text-lg text-gray-200">{{quiz.title}}</p>
                <!-- <div class="flex flex-row gap-3">
                    <v-icon name="oi-pencil" scale="1.3" class="text-neon-blue"/>
                    <v-icon name="md-delete-outlined" scale="1.3" class="text-red-950"/>
                </div> -->
  
                    <p v-if="quiz.difficulty === 'Fácil'" class="w-20 p-1 rounded-md font-bold text-base text-green-400 border-[1px] border-green-500/30 bg-green-500/20 text-center">{{ quiz.difficulty }}</p>
                    <p v-else-if="quiz.difficulty === 'Intermedio'" class="w-20 p-1 rounded-md font-bold text-base text-yellow-400 border-[1px] border-yellow-500/30 bg-yellow-500/20 text-center">{{ quiz.difficulty }}</p>
                    <p v-else class="w-20 p-1 rounded-md font-bold text-base text-red-400 border-[1px] border-red-500/30 bg-red-500/20 text-center">{{ quiz.difficulty }}</p>
                    
                <ul class="flex flex-row gap-1 col-span-2 justify-center flex-wrap">
                    <li v-for="tag in quiz.tags" class="px-2 bg-neon-blue/50 rounded-md text-white">
                        {{ tag.name }}
                    </li>
                </ul>
                <div class="flex justify-self-end gap-8">
                    <button type="button" class="justify-self-end" @click="handleEditButton(quiz,index)">
                        <v-icon name="oi-pencil" scale="1.3" class="text-neon-blue/70"/>
                    </button>
                    <button type="button" @click="deleteQuiz(quiz._id)" >
                        <v-icon name="md-delete-outlined" scale="1.3" class="text-red-950"/>
                    </button>
                </div>
            </div>
        </div>
        <div class="flex flex-row justify-center">
            <!-- añadir enlace ha vista de formulario -->
            <button type="button" class="px-8 py-2 rounded-md font-semibold text-lg bg-neon-blue" @click="handleAddButton">{{formIsOpen ? 'Cancelar' : 'Añadir'}}</button>
        </div>

        <div v-if="formIsOpen" class="flex flex-col items-center justify-center gap-2 p-3 bg-dark-surface rounded-md border-[1px] border-neon-blue/30">
            <Form id="form" v-bind:validation-schema="validationSchema" @submit="handleSubmit" @invalid-submit="invalidSubmit" class="flex flex-col max-w-2xl gap-2 ">
                
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="qTitle" class="font-bold text-gray-400"> Título:</label>
                        <Field v-model="quiz.title" id="qTitle" name="title" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="title"></ErrorMessage>       
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="qDescription" class="font-bold text-gray-400 shrink-0"> Descripción:</label>            
                        <Field v-model="quiz.description" id="qDescription" name="description" as="textarea" cols="50" rows="4" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="description"></ErrorMessage>
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="qNumQuestion" class="font-bold text-gray-400 shrink-0">Cantidad de preguntas:</label>            
                        <Field v-model="quiz.numQuestions" id="qNumQuestion" name="numQuestions" type="number" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="numQuestions"></ErrorMessage>
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label class="font-bold text-gray-400"> Etiquetas:</label>
                        <div class="grid grid-cols-5 w-full max-h-20 bg-dark-base p-2 overflow-y-auto rounded-md border-[1px] border-neon-blue/30 text-gray-200">
                            <label v-for="tag in tags">
                                <Field v-model="quiz.tags" name="tags" type="checkbox" :value="tag._id"></Field>
                               {{tag.name}}
                            </label>
    
                        </div>        
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="tags"></ErrorMessage>
                    </p>
                </div>
    
                <div class="flex flex-col gap-2">
                    <div class="flex gap-2">
                        <label for="qDifficulty" class="font-bold text-gray-400">Dificultad:</label>
                        <div class="flex w-full px-2 justify-between font-medium text-lg text-gray-200">
                            <label>
                                <Field v-model="quiz.difficulty"  id="qDifficulty" name="difficulty" type="radio" value="Fácil"></Field>
                            Fácil
                            </label>
                            <label>
                                <Field v-model="quiz.difficulty" id="qDifficulty" name="difficulty" type="radio" value="Intermedio"></Field>
                            Intermedio
                            </label>
    
                            <label>
                                <Field v-model="quiz.difficulty" id="qDifficulty" name="difficulty" type="radio" value="Difícil"></Field>
                            Difícil
                            </label>
                        </div>
    
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="difficulty"></ErrorMessage>
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="qBadgeName" class="font-bold text-gray-400 shrink-0">Nombre de la insignia:</label>            
                        <Field v-model="quiz.badge.name" id="qBadgeName" name="badgeName" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="badgeName"></ErrorMessage>
                    </p>
                </div>
    
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-5">
                        <label class="font-bold text-gray-400">Imagen de insignia:</label>
                        <label for="qImage" class="flex custom-file-upload py-1 px-4 rounded-md bg-neon-blue/50">
                            <v-icon name="fa-cloud-upload-alt"/>
                            Elegir imagen
                        </label>
                        <Field v-if="quiz.badge.image?.secure_url" v-model="quiz.badge.image.secure_url" id="qImage" name="badgeImage" type="file" @change="handleFile" class="custom-file-upload"/>
                        <Field v-else id="qImage" name="badgeImage" type="file" @change="handleFile" class="custom-file-upload"/>
                    </div>
                    <div class="flex flex-row justify-center">
                        <div class="w-36 h-36 rounded-md shrink-0">
                            <img v-if="quiz.badge.image?.secure_url" id="output" :src="quiz.badge.image.secure_url" class="w-full h-full object-contain border-neon-blue/30 border-[1px] rounded-md">
                            <img v-else id="output" class="w-full h-full border-neon-blue/30 border-[1px] rounded-md">
                        </div>

                    </div>
                    <p class="text-red-500 text-sm text-center ">
                        <ErrorMessage name="badgeImage"></ErrorMessage>
                    </p>
                </div>
                <div class="flex flex-row justify-center">
                    <button type="submit" class="px-4 py-1 bg-neon-blue rounded-md font-semibold">Crear</button>
                </div>
            </Form>
        </div>

    </div>
</template>