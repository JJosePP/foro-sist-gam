<script setup>
import { RouterLink } from 'vue-router'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup';
import YupPassword from 'yup-password'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore.js'
import { ref } from 'vue';
import { useToastStore } from '../stores/toastStore.js';

YupPassword(yup)

const router = useRouter()
const userStore = useUserStore();
const toastStore = useToastStore()
const userName = ref('')
const password = ref('')
const email = ref('')
const name = ref('')
const lastName = ref('')

const validationSchema = yup.object({
    userName: yup.string().required("El nombre de usuario es necesario"),
    email: yup.string().email("Introduzca un correo electrónico valido").required("El correo electrónico es necesario"),
    password: yup.string()
        .min(8, "La contraseña debe tener mínimo 8 caracteres")
        .minLowercase(1, "La contraseña debe tener al menos 1 letra minúscula")
        .minUppercase(1, "La contraseña debe tener al menos 1 letra mayúscula")
        .minNumbers(1, "La contraseña debe tener al menos 1 número")
        .minSymbols(1, "La contraseña debe tener al menos 1 carácter especial")
        .required("La contraseña es necesaria"),
    confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Las contraseñas deben coincidir"),
    name: yup.string().required("El nombre es necesario"),
    lastName: yup.string().required("Los apellidos son necesarios"),
})

const handleSubmit = async () => {
    try {
        const data = await userStore.register(userName.value, email.value, password.value, name.value, lastName.value)
        router.push('/login')
        userName.value = "",
        email.value = "",
        password.value = "",
        name.value = "",
        lastName.value = ""
        toastStore.alert(data?.message)
        
    } catch (error) {
        for (let er in error.errors) {
            toast.error(error.errors[er].message,{
                autoClose:9000
            })
        }
    }
}
</script>

<template>
    <Form v-on:submit="handleSubmit" v-bind:validation-schema="validationSchema">
        <div class="w-[90%] mt-12 md:w-1/2 mx-auto flex py-16 flex-col px-10 bg-gray-200 rounded-md">
            <h1 class="text-center font-semibold text-4xl flex-1">Regístrate</h1>
            <div class="mb-3 w-full">
                <label class="text-start">Usuario <span class="text-red-500">*</span></label>
                <Field v-model="userName" name="userName" type="text"
                    class="outline-none border-none w-full text-xl rounded-md shadow-md py-3 px-4 font-serif"></Field>
                <p class="text-red-500">
                    <ErrorMessage name="userName"></ErrorMessage>
                </p>
            </div>
            <div class="mb-3 w-full">
                <label class="text-start">Correo electrónico <span class="text-red-500">*</span></label>
                <Field v-model="email" name="email" type="text"
                    class="outline-none border-none w-full text-xl rounded-md shadow-md py-3 px-4 font-serif"></Field>
                <p class="text-red-500">
                    <ErrorMessage name="email"></ErrorMessage>
                </p>
            </div>
            <div class="mb-3 w-full">
                <label class="text-start">Nombre <span class="text-red-500">*</span></label>
                <Field v-model="name" name="name" type="text"
                    class="outline-none border-none w-full text-xl rounded-md shadow-md py-3 px-4 font-serif"></Field>
                <p class="text-red-500">
                    <ErrorMessage name="name"></ErrorMessage>
                </p>
            </div>
            <div class="mb-3 w-full">
                <label class="text-start">Apellidos <span class="text-red-500">*</span></label>
                <Field v-model="lastName" name="lastName" type="text"
                    class="outline-none border-none w-full text-xl rounded-md shadow-md py-3 px-4 font-serif"></Field>
                <p class="text-red-500">
                    <ErrorMessage name="lastname"></ErrorMessage>
                </p>
            </div>
            <div class="mb-3 w-full">
                <label class="text-start">Contraseña <span class="text-red-500">*</span></label>
                <Field v-model="password" name="password" type="password"
                    class="outline-none border-none w-full text-xl rounded-md shadow-md py-3 px-4 font-serif"></Field>
                <p class="text-red-500">
                    <ErrorMessage name="password"></ErrorMessage>
                </p>
            </div>
            <div class="mb-3 w-full">
                <label class="text-start">Repetir contraseña <span class="text-red-500">*</span></label>
                <Field name="confirmPassword" type="password"
                    class="outline-none border-none w-full text-xl rounded-md shadow-md py-3 px-4 font-serif"></Field>
                <p class="text-red-500">
                    <ErrorMessage name="confirmPassword"></ErrorMessage>
                </p>
            </div>
            <div class="flex justify-center">
                <div class="mb-3 w-96 flex justify-center">
                    <button typeof="submit"
                        class="bg-indigo-500 hover:bg-indigo-600 cursor-pointer px-12 py-3 rounded-md text-white text-2xl flex-1">Registro</button>
                </div>
            </div>

            <div class="mb-1">
                <p class="text-center text-lg">¿Ya tienes cuenta?<span class="text-indigo-500">
                        <RouterLink to="/login"> Entra aquí</RouterLink>
                    </span></p>
            </div>
        </div>
    </Form>
</template>

<style></style>