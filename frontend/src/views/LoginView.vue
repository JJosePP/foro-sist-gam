<script setup>
    import {RouterLink} from 'vue-router'
    import {Form, Field, ErrorMessage} from 'vee-validate'
    import * as yup from 'yup';
    import YupPassword from 'yup-password'
    import {useRouter} from 'vue-router'
    import {useUserStore} from '../stores/userStore.js'
    import { ref } from 'vue';
    import {useToastStore} from '../stores/toastStore.js'

    YupPassword(yup)

    const router = useRouter()
    const userName = ref('')
    const password = ref('')

    const validationSchema = yup.object({
        userName: yup.string().required("El nombre de usuario es necesario"),
        password:yup.string().required("La contraseña es necesaria")
    })

    const userStore = useUserStore();
    const toastStore = useToastStore();

    const handleSubmit = async () => {
        try {
            console.log('AQUI LLEGA')
            const data = await userStore.access(userName.value, password.value)
            console.log("HOLA")
            router.push('/')
            userName.value = "";
            password.value = "";
            toastStore.alert(data?.message)
            console.log('aaaaaaaaaaaaaaaaaaaaaaaa')
            console.log(data)
        } catch (error) {
            console.log("JAJAJAJJ ", error)
            toastStore.alert(error.details, 'error')
        }
    }
</script>

<template>
    <Form @submit="handleSubmit" v-bind:validation-schema="validationSchema" class="about">
        <div class="w-[90%] mt-12 md:w-1/2 mx-auto flex py-24 flex-col px-10 bg-gray-200 rounded-md">
            <h1 class="text-center font-semibold text-4xl flex-1">Login</h1>
            <div class="mb-3 w-full">
                <label class="text-start" for="userName">Usuario <span class="text-red-500">*</span></label>
                <Field v-model="userName" name="userName" type="text" id="userName" class="form-input outline-none border-none w-full text-xl rounded-md shadow-md py-3 px-4 font-serif" required placeholder="Nombre de usuario"></Field>
                <p class="text-red-500">
                    <ErrorMessage name="userName"></ErrorMessage>
                </p>
            </div>
            <div class="mb-3 w-full">
                <label class="text-start" for="password">Contraseña <span class="text-red-500">*</span></label>
                <Field v-model="password" name="password" type="password" id="password" class="outline-none border-none w-full text-xl rounded-md shadow-md py-3 px-4 font-serif" required placeholder="Contraseña"></Field>
                <p class="text-red-500">
                    <ErrorMessage name="password"></ErrorMessage>
                </p>
            </div>
            <div class="mb-3 w-full flex justify-center">
                <button typeof="submit" class="bg-indigo-500 hover:bg-indigo-600 cursor-pointer px-12 py-3 rounded-md text-white text-2xl flex-1">Login</button>
            </div>
            <div class="mb-3">
                <p class="text-center text-lg">¿No tienes cuenta?<span class="text-indigo-500">
                    <RouterLink to="/register"> Regístrate aquí</RouterLink>
                </span></p>
            </div>
        </div>
    </Form>
</template>

<style>
</style>