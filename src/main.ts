import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {createI18n} from "vue-i18n";
// @ts-ignore
import en from "./i18n/en.json"
// @ts-ignore
import zh from "./i18n/zh.json"

const i18n = createI18n({
    locale: 'zh',
    fallbackLocale: 'en',
    legacy: false,
    messages: {
        en,
        zh
    }
})

const app = createApp(App)

app.use(router)
app.use(i18n)
app.mount('#app')
