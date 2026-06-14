<script setup>
    import { ref, onMounted, nextTick } from 'vue';
    import api from '@/boot/axios';
    import { useUserStore } from '../stores/userStore.js';
    import {useToastStore} from '../stores/toastStore.js'
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import * as yup from 'yup';


    const questions = ref([]);
    const userStore = useUserStore()
    const toastStore = useToastStore();
    const question = ref({
        question: null,
        answer: null,
        distractors: [],
        tags: [],
        difficulty: null,
        image: null
    })
    const selectedFile = ref(null)
    const formIsOpen = ref(false)
    const tags = ref([])
    const formMode = ref('create')
    

    const validationSchema = yup.object({
        question: yup.string().required("Debe escribir una pregunta")
            .min(1, "La pregunta debe tener como mínimo 1 carácter")
            .max(300, "La pregunta debe tener como máximo 300 caracteres"),
        answer: yup.string().required("Debe escribir la respuesta")
            .min(1, "La respuesta debe tener como mínimo 1 carácter")
            .max(150, "La respuesta debe tener como máximo 150 caracteres"),
        distractor1: yup.string().required("Debe escribir una respuesta distractora")
            .min(1, "La respuesta distractora debe tener como mínimo 1 carácter")
            .max(150, "La respuesta distractora debe tener como máximo 150 caracteres"),
        distractor2: yup.string().required("Debe escribir una respuesta distractora")
            .min(1, "La respuesta distractora debe tener como mínimo 1 carácter")
            .max(150, "La respuesta distractora debe tener como máximo 150 caracteres"),
        distractor3: yup.string().required("Debe escribir una respuesta distractora")
            .min(1, "La respuesta distractora debe tener como mínimo 1 carácter")
            .max(150, "La respuesta distractora debe tener como máximo 150 caracteres"),
        tags: yup.array().required("Debe seleccionar al menos una etiqueta")
            .min(1,"Debe seleccionar al menos una etiqueta"),
        difficulty: yup.string().required("Debe seleccionar un nivel de dificultad"),
        image: yup.mixed()
            .test('fileType', 'Solo se permiten imágenes',
                (file) => {
                    if(file && !file?.type.startsWith("image/")){
                        return false
                    }
                    return true
                }
            )
      //seguir aqui  
    })

    const getQuestions = async () => {
        try {
            const {data} = await api({
                url: 'questions',
                method: 'GET'
            })
            questions.value = data.result

            return questions
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const deleteQuestion = async (questionId) => {
        try {
            if(confirm("¿Está seguro? La operación es irreversible")){
                const {data} = await api({
                    url:`/questions/${questionId}`,
                    method: 'DELETE',
                    headers:{
                        Authorization: "Bearer " + userStore.token
                    }
                })
                toastStore.alert(data.msg)
                questions.value = questions.value.filter(question => question._id !== questionId)
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

    const handleEditButton = async (q) => {
        formMode.value = 'update'
        formIsOpen.value = true
        question.value = {
            ...q,
            tags: q.tags.map(tag => tag._id)
        }
        console.log("Question: ", question.value)
        if(formIsOpen.value && tags.value.length === 0){
            await getTags();
            console.log(tags.value)
        }
        // await nextTick()
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

    const createQuestion = async (values) => {
        console.log("Valores: ", values)
        let distractors = [values.distractor1, values.distractor2, values.distractor3]
        const formData = new FormData()
        formData.append('question', values.question)
        formData.append('answer', values.answer)
        formData.append('difficulty', values.difficulty)
        distractors.forEach(distractor => {
            formData.append('distractors[]', distractor)
        })
        values.tags.forEach(tag => {
            formData.append('tags[]', tag)
        })
        formData.append('image', selectedFile.value)
        console.log(formData)
        const {data} = await api.post('questions',
            formData,
            {
                headers: {
                        Authorization: "Bearer " + userStore.token
                }
            }
        )
        question.value = data.createdQuestion
        toastStore.alert(data.msg)

        questions.value.push(question.value)

        return question
    }

    const editQuestion = async (values) => {
        let distractors = [values.distractor1, values.distractor2, values.distractor3]
        const formData = new FormData()
        formData.append('question', values.question)
        formData.append('answer', values.answer)
        formData.append('difficulty', values.difficulty)
        distractors.forEach(distractor => {
            formData.append('distractors[]', distractor)
        })
        values.tags.forEach(tag => {
            formData.append('tags[]', tag)
        })

        if(selectedFile.value){
            formData.append('image', selectedFile.value)
        }

        const {data} = await api.put(`questions/${question.value._id}`,
            formData,
            {
                headers: {
                    Authorization: "Bearer " + userStore.token
                }
            }
        )
        questions.value = questions.value.map(q => 
            q._id === data.editedQuestion._id
            ? data.editedQuestion : q
        )
        
        toastStore.alert(data.msg)
        await nextTick()
        return question
    }

    const handleSubmit = async (values) => {
        try {
            if(formMode.value === 'create'){
                await createQuestion(values)
            }
            if(formMode.value === 'update'){
                await editQuestion(values)
            }  
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        } finally {
            formIsOpen.value = false
            resetForm()
        }
    }

    const invalidSubmit = (values) => {
        console.log(values)
    }

    const resetForm = () => {
        question.value = {
                question: null,
                answer: null,
                distractors: [],
                tags: [],
                difficulty: null,
                image: null
        }
        selectedFile.value = null
    }
    onMounted(async()=> {
        await getQuestions()
        console.log("LISTA PREGUNTAS: ", questions.value)
    })
</script>

<template>
    <div class="flex flex-col gap-8 w-full ">

        <div class="flex flex-col max-h-[560px] rounded-b-md divide-y divide-neon-blue/30 bg-dark-surface border-[1px] border-neon-blue/30 overflow-y-scroll">
            <div v-for="question in questions"  class="py-2 px-20 grid grid-cols-5 justify-between items-center">
                <p class="col-span-2 font-semibold text-lg text-gray-200">{{question.question}}</p>
                <!-- <div class="flex flex-row gap-3">
                    <v-icon name="oi-pencil" scale="1.3" class="text-neon-blue"/>
                    <v-icon name="md-delete-outlined" scale="1.3" class="text-red-950"/>
                </div> -->
                <ul class="flex flex-row gap-1 col-span-2 justify-center flex-wrap">
                    <li v-for="tag in question.tags" class="px-2 bg-neon-blue/50 rounded-md text-white">
                        {{ tag.name }}
                    </li>
                </ul>
                <div class="flex justify-self-end gap-8">
                    <button type="button" @click="handleEditButton(question)" class="justify-self-end">
                        <v-icon name="oi-pencil" scale="1.3" class="text-neon-blue/70"/>
                    </button>
                    <button type="button" @click="deleteQuestion(question._id)" >
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
            <Form id="form" v-bind:validation-schema="validationSchema" @submit="handleSubmit" @invalid-submit="invalidSubmit" class="flex flex-col max-w-2xl gap-2">
                
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="qQuestion" class="font-bold text-gray-400"> Pregunta:</label>
                        <Field v-model="question.question" id="qQuestion" name="question" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="question"></ErrorMessage>       
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="qAnswer" class="font-bold text-gray-400 shrink-0"> Respuesta correcta:</label>            
                        <Field v-model="question.answer" id="qAnswer" name="answer" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="answer"></ErrorMessage>
                    </p>
                </div>
                <div v-for="n in 3" class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label :for="`qDistractor-${n}`" class="font-bold text-gray-400 shrink-0"> {{'Distractor ' + n}}:</label>            
                        <Field v-model="question.distractors[n-1]" :id="`qDistractor-${n}`" :name="`distractor${n}`" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage :name="`distractor${n}`"></ErrorMessage>
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label class="font-bold text-gray-400"> Etiquetas:</label>
                        <div class="grid grid-cols-5 w-full max-h-20 bg-dark-base p-2 overflow-y-auto rounded-md border-[1px] border-neon-blue/30 text-gray-200">
                            <label v-for="tag in tags">
                                <Field v-model="question.tags" name="tags" type="checkbox" :value="tag._id"></Field>
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
                                <Field v-model="question.difficulty"  id="qDifficulty" name="difficulty" type="radio" value="Fácil"></Field>
                            Fácil
                            </label>
                            <label>
                                <Field v-model="question.difficulty" id="qDifficulty" name="difficulty" type="radio" value="Intermedio"></Field>
                            Intermedio
                            </label>
    
                            <label>
                                <Field v-model="question.difficulty" id="qDifficulty" name="difficulty" type="radio" value="Difícil"></Field>
                            Difícil
                            </label>
                        </div>
    
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="difficulty"></ErrorMessage>
                    </p>
                </div>
    
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-5">
                        <label class="font-bold text-gray-400">Imagen(opcional):</label>
                        <label for="qImage" class="flex custom-file-upload py-1 px-4 rounded-md bg-neon-blue/50">
                            <v-icon name="fa-cloud-upload-alt"/>
                            Elegir imagen
                        </label>
                        <Field id="qImage" name="image" type="file" @change="handleFile" class="custom-file-upload"/>
                        
                    </div>
                    <div class="flex flex-row justify-center">
                        <div class="w-36 h-36 rounded-md shrink-0">
                            <img v-if="question.image?.secure_url" id="output" :src="question.image.secure_url" class="w-full h-full object-contain border-neon-blue/30 border-[1px] rounded-md">
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
<style>
input[type="file"] {
    display: none;
}
.custom-file-upload {
    border: 1px solid #ccc;
    display: inline-block;
    padding: 6px 12px;
    cursor: pointer;
}
</style>