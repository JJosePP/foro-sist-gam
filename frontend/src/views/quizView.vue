<script setup>
    import api from '@/boot/axios';
    import { ref,onMounted, onUnmounted,computed } from 'vue';
    import { useUserStore } from '../stores/userStore.js';
    import { useRouter, useRoute } from 'vue-router';
    import {useToastStore} from '../stores/toastStore.js'


    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const toastStore = useToastStore();

    const timer = ref('');
    let intervalId = null
    const selectedAnswer = ref(null)
    const actualQuestionId = ref(null)
    const actualQuestion = ref({})
    const duration = ref(null)
    let abortController = null
    const sessionId = ref(null)
    const expiresAt = ref(null)
    // const errorInSession = ref(false)
    const answerContainer = ref(null)
    const currentQuestionIndex = ref(null)
    let timeoutId = null
    const numQuestions = ref(null)
    let score = null;
    let passedQuiz = null
    const sessionIsFinished = ref(false)

    if(localStorage.getItem('sessionExpiresAt')){
        expiresAt.value = localStorage.getItem('sessionExpiresAt')
    }

    if(localStorage.getItem('sessionId')){
        sessionId.value = localStorage.getItem('sessionId')
    }

    let dur =  Date.parse(expiresAt.value) < Date.now() ? null : (Date.parse(expiresAt.value) - Date.now())/1000

    const resetSession = () => {
        localStorage.removeItem("sessionExpiresAt")
        localStorage.removeItem("sessionId")
        sessionId.value = null
        expiresAt.value = null
    }
    const startTimer = (dur) => {
        let minutes;
        let seconds
        if(!dur){
            dur = 15*60
        }
  
        intervalId = setInterval(async ()=>{
            minutes = parseInt(dur/60,10);
            seconds = parseInt(dur%60,10);
            duration.value = parseInt(dur)
            minutes = minutes < 10 ? '0' + minutes : minutes
            seconds = seconds < 10 ? '0' + seconds : seconds

            timer.value = minutes + ':' + seconds
            // timer.value--
            if(--dur < 0){
                dur = 0
                clearInterval(intervalId)

                timeoutId = setTimeout(async ()=>{
                    await endTest()
                    // resetSession()
                },10000)
            }
        }, 1000)

        return intervalId
    }

    const timeEnds = computed(() => {
        if(duration.value === 0){
            return true
        }
        return false
    })

    const selectAnswer = (answer) => {
        selectedAnswer.value = answer
    }

    const handleClickOutside = (event) => {
        if(answerContainer.value && !answerContainer.value.contains(event.target)){
            selectedAnswer.value = null
        }
    }

    const getQuestion = async (questionId) => {
        try {

            const {data} = await api({
                url: `questions/${actualQuestionId.value}`,
                method: 'GET',
                headers:{ 
                    Authorization: "Bearer " + userStore.token,
                }
            })

            actualQuestion.value = data.formatedQuestion
            return actualQuestion
        } catch (error) {
            console.log("ERROR: ", error)
        }
    }
    const startQuiz = async () => {
        let intervalId
        let data
        try {
            if(userStore.isAdmin){
                abortController = new AbortController()
                toastStore.alert('Los administradores no deberían poder participar')
                router.push({name:'quizzes'})
                return
            }

            if(sessionId.value){

                data = await api({
                    url: `quizzes/session/${sessionId.value}`,
                    method: 'GET',
                    headers:{
                        Authorization: "Bearer " + userStore.token,
                    }
                });
                toastStore.alert('La prueba sigue')

            }else {
                if(abortController){
                    abortController.abort()
                }
                abortController = new AbortController()

                data = await api.post(`${route.path}/start`,
                    {},
                    {
                        headers: {
                            Authorization: "Bearer " + userStore.token
                        },
                        signal: abortController.signal
                    }
                )

                sessionId.value = data.data.sessionId
                expiresAt.value = data.data.expiresAt
                localStorage.setItem('sessionId', sessionId.value)
                localStorage.setItem('sessionExpiresAt', expiresAt.value)
                toastStore.alert('La prueba ha comenzado')
            } 
            actualQuestionId.value = data.data.question
            currentQuestionIndex.value = data.data.currentQuestionIndex
            numQuestions.value = data.data.numQuestions

            await getQuestion(actualQuestionId.value)

            intervalId = startTimer(dur)

        } catch (error) {
            console.log("ERROR: ", error)
            timer.value = '15:00'
            clearInterval(intervalId)
            resetSession()
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const endTest = async () => {
        let data
        try {
            data = await api.put(`quizzes/session/${sessionId.value}`,
                {},
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token,
                    }
                }
            )
            clearInterval(intervalId);
            resetSession()
            router.push({name:'quizzes'})
            
        } catch (error) {
            toastStore.alert(error.response.data.details, 'error')
        }finally{
            toastStore.alert(data.data.msg)
        }
    }
    const finishTest = async () => {
        if(confirm("¿Está seguro de finalizar la prueba?")){
            await endTest()
        }else{
            location.reload()
        }
    }

    const returnButton = async () => {
        clearTimeout(timeoutId)
        await endTest()
    }
    const answerQuestion = async () => {
        try {
            const {data} = await api.post(`quizzes/session/${sessionId.value}/answer`,
                {
                    answer: selectedAnswer.value
                },
                {
                    headers: {
                        Authorization: "Bearer " + userStore.token,
                    }
                }
            );

            if(currentQuestionIndex.value + 1 >= numQuestions.value){
                score = data.score
                passedQuiz = data.passed
                sessionIsFinished.value = true
                toastStore.alert(data.msg)
                resetSession()
                clearInterval(intervalId)


            }else{
                currentQuestionIndex.value = data.currentQuestionIndex;
                actualQuestionId.value = data.question;
                numQuestions.value = data.numQuestions
                await getQuestion(actualQuestion.value)
            }
        
        } catch (error) {
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const nextAnswer = async  () => {
        if(!selectedAnswer.value){
            toastStore.alert("Tienes que seleccionar una respuesta para continuar")
        }else{
            await answerQuestion()
        }
    }

    onMounted(async () => {
        document.addEventListener('click', handleClickOutside)
        await startQuiz()
        // startTimer()
    })

    onUnmounted( () => {
        clearInterval(intervalId)
        document.removeEventListener('click', handleClickOutside)
    })
</script>

<template>
    <div v-if="!sessionIsFinished" class="flex flex-col max-w-[80%] mx-auto gap-5 items-center justify-center">
        <div v-if="timeEnds" class="flex flex-col absolute w-full h-96 py-5 rounded-lg border-2 border-neon-blue/30 bg-dark-surface items-center justify-between">
            <h1 class="font-bold text-9xl text-white">¡Se acabó el tiempo!</h1>
            <button type="button" @click="returnButton" class="px-14 py-4 rounded-md bg-neon-blue font-bold text-black">Volver</button>
        </div>
        <div class="font-bold text-6xl text-white">{{ timer }}</div>

        <div class="flex flex-col w-full px-6 py-10 gap-2 rounded-md border-[1px] border-neon-blue/30 bg-dark-surface items-center">
            <h2 class="font-bold text-2xl text-gray-200">{{ 'Pregunta ' + (currentQuestionIndex+1) + ':' }}</h2>
            <p class="font-semibold text-xl text-gray-200 text-start w-full">{{actualQuestion.question}}</p>
            <div v-if="actualQuestion.image" class="w-96 h-64">
                <img :src="actualQuestion.image.secure_url" class="w-full h-full rounded-md border-[1px] border-neon-blue/30"/>
            </div>
        </div>

        <div ref="answerContainer" class="grid grid-cols-2 gap-10 w-full">
            <button v-for="answer in actualQuestion.possibleAnswers" type="button" class="p-3 rounded-md border-[1px] border-neon-blue/30 bg-dark-surface font-semibold text-xl text-gray-200 hover:bg-neon-blue hover:text-black focus:bg-neon-blue focus:text-black" @click="selectAnswer(answer)">
                {{answer}}
            </button>
        </div>
        <button type="button" class="px-5 py-3 rounded-md font-semibold text-2xl text-black bg-neon-blue" @click="nextAnswer">Siguiente</button>


        <button type="button" @click="finishTest" class="px-3 py-1 rounded-md font-semibold text-xl text-white bg-dark-surface border-[1px] border-red-900 hover:bg-red-700 hover:text-black">Retirarse</button>
    </div>

    <div v-else class="flex flex-col max-w-[80%] mx-auto gap-5 items-center justify-center">
        <div class="flex flex-col gap-2 rounded-md border-[1px] border-neon-blue/30 p-10 bg-dark-surface">
            <div v-if="passedQuiz" class="flex flex-col gap-2 items-center">
                <h1 class="font-bold text-9xl text-center text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">¡Enhorabuena!</h1>
                <p class="font-semibold text-3xl text-gray-200">Has conseguido una nueva medalla</p>
            </div>
            <div v-else class="flex flex-col gap-2 items-center">
                <h1 class="font-bold text-9xl text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">¡Lo sentimos!</h1>
                <p class="font-semibold text-2xl text-gray-200">Te animamos a que lo vuelvas a intentar</p>
            </div>
            <div class="flex flex-col items-center gap-2">
                <p class="font-semibold text-4xl text-gray-200">Puntuación:</p>
                <h2 v-if="passedQuiz" class="text-6xl font-bold text-green-600 drop-shadow-[0_0_8px_rgba(21,128,61,0.8)]">{{ score + '/' + numQuestions}}</h2>
                <h2 v-else class="text-6xl font-bold text-red-600 drop-shadow-[0_0_8px_rgba(185,28,28,0.8)]">{{ score + '/' + numQuestions}}</h2>
            </div>
        </div>
        <RouterLink to="/quizzes" class="px-10 py-2 rounded-md font-semibold text-xl text-black bg-neon-blue/50 hover:bg-neon-blue">Volver</RouterLink>
    </div>
</template>
<style scope>

</style>