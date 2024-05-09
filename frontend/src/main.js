import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {OhVueIcon, addIcons} from "oh-vue-icons"
import {FaFlag, MdAutofpsselectOutlined, RiZhihuFill} from "oh-vue-icons/icons"
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

addIcons(FaFlag, RiZhihuFill)

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(Vue3Toastify, {
    autoClose: 3000
})
app.component("v-icon", OhVueIcon)
app.use(router)

app.mount('#app')
