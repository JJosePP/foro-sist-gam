<script setup>
    import { ref, onMounted, nextTick } from 'vue';
    import api from '@/boot/axios';
    import { useUserStore } from '../stores/userStore.js';
    import {useToastStore} from '../stores/toastStore.js'
    import { ErrorMessage, Field, Form } from 'vee-validate';
    import * as yup from 'yup';

    const games = ref([]);
    const userStore = useUserStore()
    const toastStore = useToastStore();
    const formIsOpen = ref(false)
    const formMode = ref('create')
    const selectedGameIndex = ref(null)
    const genres = ref([])
    const platforms = ref([])
    const selectedScreenshots = ref([])
    const selectedFile = ref(null)
    const game = ref({
        name: null,
        description: null,
        developmentCompany: null,
        releaseDate: null,
        platforms: [],
        genres: [],
        screenshots: [],
        mainImage: {
            public_id: null,
            secure_url: null
        }
    })

    const validationSchema = yup.object({
        name: yup.string().required("Debe escribir el nombre del juego")
            .min(2, "El nombre debe tener como mínimo 2 carácter")
            .max(60, "El nombre debe tener como máximo 60 caracteres"),
        developmentCompany: yup.string().required("Debe escribir una desarrolladora")
            .min(2, "El título debe tener como mínimo 2 carácter")
            .max(50, "El título debe tener como máximo 50 caracteres"),
        description: yup.string().required("Debe escribir la sinopsis del juego")
            .max(1000, "La descripción puede tener 1000 caracteres como máximo"),
        releaseDate: yup.date().required('La fecha es obligatoria'),
        genres: yup.array().required("Debe seleccionar al menos un género")
            .min(1,"Debe seleccionar al menos un género"),
        platforms: yup.array().required("Debe seleccionar al menos una plataforma")
            .min(1,"Debe seleccionar al menos una plataforma"),
        mainImage: yup.mixed().required("Debe seleccionar una imagen")
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
            ),
        screenshots: yup.mixed()
            .test('fileType', 'Solo se permiten imágenes',
                (files) => {
                    let res = true
                    if(files){
                        for(let file of files){
                            if(typeof file === 'string' && !file.startsWith("https://res.cloudinary.com/jjose/image/upload")){
                                res = false;
                                break;
                            }
                            if(file && !file.type?.startsWith("image/")){
                                res = false;
                                break;
                            }
                        }     
                        return res
                    }
                    return true
                }
            ),
    })

    const getGames = async () => {
        try {
            const {data} = await api({
                url: 'games/admin',
                method: 'GET'
            })
            games.value = data
            return games
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }
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
    const getPlatforms = async () => {
        try {
            const {data} = await api({
                url: 'platforms',
                method: 'GET'
            })
            platforms.value = data.result

            return platforms
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const deleteGame = async (gameId) => {
        try {
            if(confirm("¿Está seguro? La operación es irreversible")){
                const {data} = await api({
                    url:`/games/${gameId}`,
                    method: 'DELETE',
                    headers:{
                        Authorization: "Bearer " + userStore.token
                    }
                })
                console.log(data.message)
                toastStore.alert(data.message)
                games.value = games.value.filter(game => game._id !== gameId)
            }else{
                return
            }
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const handleAddButton = async () => {
        resetForm()
        formMode.value = 'create'
        formIsOpen.value = !formIsOpen.value

        if(formIsOpen.value ){
            if(genres.value.length === 0){
                await getGenres()
            }
            if(platforms.value.length === 0){
                await getPlatforms()
            }
        }

        document.getElementById('form')?.scrollIntoView({
            behavior: 'smooth'
        });
    }
    const handleEditButton = async (g,index) => {
        resetForm()
        formMode.value = 'update'
        formIsOpen.value = true
        selectedGameIndex.value = index
        game.value = {
            ...g,
            genres: g.genres.map(genre => genre._id),
            platforms: g.platforms.map(platform => platform._id)
        }

        if(formIsOpen.value ){
            if(genres.value.length === 0){
                await getGenres()
            }
            if(platforms.value.length === 0){
                await getPlatforms()
            }
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

    const handleScreenshots = (event) => {
        if(selectedScreenshots.value.length > 0){
            let imgsToAdd = [...event.target.files].map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }))
            selectedScreenshots.value = [...imgsToAdd, ...selectedScreenshots.value]
        }else{
            selectedScreenshots.value = [...event.target.files].map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }))
        }
    }

    const cancelScreenshot = (index) => {
        selectedScreenshots.value.splice(index,1)
    }

    //probar cuando pueda crear juego
    const removeScreenshot = async (screenshot, index) => {
        try {
            console.log("?????? :",screenshot)
            let public_id = screenshot.public_id
            console.log("??????2 :", public_id)
            console.log('TIPO: ',typeof public_id)
            let imageId = public_id.substring(public_id.lastIndexOf('/') + 1)
            console.log(imageId)
            const {data} = await api.put(`games/${game.value._id}/${imageId}`,
                {},
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token
                    }
                })
            toastStore.alert(data)
            game.value.screenshots.splice(index,1)
            //nextick??
            return game
        } catch (error) {
            console.log(error)
        }
    }

    const createGame = async(values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description)
        formData.append('developmentCompany', values.developmentCompany)
        formData.append('releaseDate', values.releaseDate)
        values.genres.forEach(genre => {
            formData.append('genres[]', genre)
        })
        values.platforms.forEach(platform => {
            formData.append('platforms[]', platform)
        })
        formData.append('mainImage', selectedFile.value);
        if(selectedScreenshots.value.length > 0){
            selectedScreenshots.value.forEach(screenshot => {
                formData.append('screenshots', screenshot.file)
            })
        }

        console.log(formData)
        const {data} = await api.post('games',
            formData,
            {
                headers: {
                    Authorization: "Bearer " + userStore.token
                }
            }
        )
        game.value = data.createdGame;
        toastStore.alert(data.msg)

        games.value.push(game.value)

        return game;
    }

    const editGame = async (values) => {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description)
        formData.append('developmentCompany', values.developmentCompany)
        formData.append('releaseDate', values.releaseDate)
        values.genres.forEach(genre => {
            formData.append('genres[]', genre)
        })
        values.platforms.forEach(platform => {
            formData.append('platforms[]', platform)
        })
        formData.append('mainImage', selectedFile.value);
        if(selectedScreenshots.value.length > 0){
            selectedScreenshots.value.forEach(screenshot => {
                formData.append('screenshots', screenshot.file)
            })
        }

        const {data} = await api.put(`/games/${game.value._id}`,
            formData,
            {
                headers: {
                    Authorization: "Bearer " + userStore.token
                }
            }
        )
        games.value[selectedGameIndex.value] = data.editedGame
        toastStore.alert(data.msg)

        return game
    }
    const handleSubmit = async (values) => {
        try {
            if(formMode.value === 'create'){
                console.log('Creando')
                console.log(values)
                await createGame(values)
            }
            if(formMode.value === 'update'){
                console.log('EDITANDO')
                console.log(values)
                await editGame(values)
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
        game.value ={
            name: null,
            description: null,
            developmentCompany: null,
            releaseDate: null,
            platforms: [],
            genres: [],
            screenshots: [],
            mainImage: {}
        }
        selectedFile.value = null
        selectedGameIndex.value = null
        selectedScreenshots.value = []
    }

    onMounted(async()=> {
        await getGames()
        console.log("JUEGOS: ", games.value)
    })
</script>

<template>
    <div class="flex flex-col gap-8 w-full">
        <div class="flex flex-col max-h-[560px] rounded-b-md divide-y divide-neon-blue/30 bg-dark-surface border-[1px] border-neon-blue/30 overflow-y-scroll">
            <div v-for="(game,index) in games"  class="py-2 px-20 grid grid-cols-6 gap-2 items-center">
                <p class="col-span-1 font-semibold text-lg text-gray-200">{{game.name}}</p>
    
                <ul class="flex flex-row gap-1 col-span-2 justify-center flex-wrap">
                    <li v-for="genre in game.genres" class="px-2 bg-neon-blue/50 rounded-md text-white">
                        {{ genre.name}}
                    </li>
                </ul>
                <ul class="flex flex-row gap-1 col-span-2 justify-center flex-wrap">
                    <li v-for="platform in game.platforms" class="px-2 bg-neon-blue/50 rounded-md  text-white">
                        {{platform.name}}
                    </li>
                </ul>
                <div class="flex justify-self-end gap-8 ">
                    <button type="button" class="justify-self-end" @click="handleEditButton(game,index)">
                        <v-icon name="oi-pencil" scale="1.3" class="text-neon-blue/70"/>
                    </button>
                    <button type="button" @click="deleteGame(game._id)" >
                        <v-icon name="md-delete-outlined" scale="1.3" class="text-red-950"/>
                    </button>
                </div>
            </div>
        </div>

        <div class="flex flex-row justify-center">
            <button type="button" class="px-8 py-2 rounded-md font-semibold text-lg bg-neon-blue" @click="handleAddButton">{{formIsOpen ? 'Cancelar' : 'Añadir'}}</button>
        </div>

        <div v-if="formIsOpen" class="flex flex-col items-center justify-center gap-2 p-3 bg-dark-surface rounded-md border-[1px] border-neon-blue/30">
            <Form id="form" v-bind:validation-schema="validationSchema" @submit="handleSubmit" @invalid-submit="invalidSubmit" class="flex flex-col max-w-2xl gap-2 ">
                
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="gname" class="font-bold text-gray-400"> Nombre:</label>
                        <Field v-model="game.name" id="gname" name="name" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="name"></ErrorMessage>       
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="gDescription" class="font-bold text-gray-400 shrink-0"> Sinopsis:</label>            
                        <Field v-model="game.description" id="gDescription" name="description" as="textarea" cols="50" rows="4" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="description"></ErrorMessage>
                    </p>
                </div>
               <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="gDevelopmentCompany" class="font-bold text-gray-400"> Desarrolador:</label>
                        <Field v-model="game.developmentCompany" id="gDevelopmentCompany" name="developmentCompany" type="text" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="developmentCompany"></ErrorMessage>       
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label for="gReleaseDate" class="font-bold text-gray-400 shrink-0">Fecha de lanzamiento:</label>            
                        <Field v-model="game.releaseDate" id="gReleaseDate" name="releaseDate" type="date" class="w-full bg-dark-base text-gray-400 border-[1px] border-neon-blue/30 rounded-md px-2"></Field>
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="releaseDate"></ErrorMessage>
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label class="font-bold text-gray-400"> Géneros:</label>
                        <div class="grid grid-cols-5 w-full max-h-20 bg-dark-base p-2 overflow-y-auto rounded-md border-[1px] border-neon-blue/30 text-gray-200">
                            <label v-for="genre in genres">
                                <Field v-model="game.genres" name="genres" type="checkbox" :value="genre._id"></Field>
                               {{genre.name}}
                            </label>
    
                        </div>        
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="tags"></ErrorMessage>
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="w-full flex gap-2">
                        <label class="font-bold text-gray-400"> Géneros:</label>
                        <div class="grid grid-cols-5 w-full max-h-20 bg-dark-base p-2 overflow-y-auto rounded-md border-[1px] border-neon-blue/30 text-gray-200">
                            <label v-for="platform in platforms">
                                <Field v-model="game.platforms" name="platforms" type="checkbox" :value="platform._id"></Field>
                               {{platform.name}}
                            </label>
    
                        </div>        
                    </div>
                    <p class="text-red-500 text-sm text-center">
                        <ErrorMessage name="platforms"></ErrorMessage>
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-5">
                        <label class="font-bold text-gray-400">Imagen de portada:</label>
                        <label for="gImage" class="flex custom-file-upload py-1 px-4 rounded-md bg-neon-blue/50">
                            <v-icon name="fa-cloud-upload-alt"/>
                            Elegir imagen
                        </label>
                        <Field v-if="game.mainImage.secure_url" v-model="game.mainImage.secure_url" id="gImage" name="mainImage" type="file" @change="handleFile" class="custom-file-upload"/>
                        <Field v-else id="gImage" name="mainImage" type="file" @change="handleFile" class="custom-file-upload A"/>
                    </div>
                    <div class="flex flex-row justify-center">
                        <div class="w-36 h-36 rounded-md shrink-0">
                            <img v-if="game.mainImage.secure_url" id="output" :src="game.mainImage.secure_url" class="w-full h-full object-contain border-neon-blue/30 border-[1px] rounded-md">
                            <img v-else id="output" class="w-full h-full border-neon-blue/30 border-[1px] rounded-md">
                        </div>

                    </div>
                    <p class="text-red-500 text-sm text-center ">
                        <ErrorMessage name="mainImage"></ErrorMessage>
                    </p>
                </div>

                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-5">
                        <label class="font-bold text-gray-400">Capturas:</label>
                        <label for="gScreenshots" class="flex custom-file-upload py-1 px-4 rounded-md bg-neon-blue/50">
                            <v-icon name="fa-cloud-upload-alt"/>
                            Elegir capturas
                        </label>
                        <Field v-if="game.screenshots.length > 0" id="gScreenshots" name="screenshots" type="file" multiple @change="handleScreenshots" class="custom-file-upload"/>
                        <Field v-else id="gScreenshots" name="screenshots" type="file" multiple @change="handleScreenshots" class="custom-file-upload A"/>
                    </div>
                    <div v-if="game.screenshots.length > 0" class="flex flex-row gap-6 p-6 rounded-md border-[1px] overflow-x-auto bg-dark-base border-neon-blue/30 scrollbar">
                        <div class="flex flex-row">
                            <div v-for="(screenshot, index) in game.screenshots" class="w-36 h-36 rounded-md shrink-0 relative">
                                <!-- @click llamar eliminar screenshot -->
                                <button type="button" @click="removeScreenshot(screenshot, index)" class="text-white absolute top-1 right-1">
                                    <v-icon name="md-removecircleoutline" class="text-red-950"/>
                                </button>
                                <img :src="screenshot.secure_url" class="w-full h-full object-contain border-neon-blue/30 border-[1px] rounded-md"/>
                            </div>
                        </div>
                        
                    </div>
                    <div class="flex flex-row gap-6 p-6 rounded-md border-[1px] overflow-x-auto bg-dark-base border-neon-blue/30 scrollbar">
                        <div class="flex flex-row">
                            <div v-for="(screenshot, index) in selectedScreenshots" class="w-36 h-36 rounded-md shrink-0 relative">
                                <button type="button" class="text-white absolute top-1 right-1" @click="cancelScreenshot(index)">
                                    <v-icon name="md-removecircleoutline" class="text-red-950"/>
                                </button>
                                <img :src="screenshot.preview" class="w-full h-full border-neon-blue/30 border-[1px] rounded-md">
                            </div>
                        </div>
                    </div>
                    <p class="text-red-500 text-sm text-center ">
                        <ErrorMessage name="screenshots"></ErrorMessage>
                    </p>
                </div>


                <div class="flex flex-row justify-center">
                    <button type="submit" class="px-4 py-1 bg-neon-blue rounded-md font-semibold">Crear</button>
                </div>
            </Form>
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

</style>