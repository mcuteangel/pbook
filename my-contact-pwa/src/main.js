import { createApp } from 'vue'
import App from './App.vue'
// Router رو import کن
import router from './router' // <-- این خط رو اضافه کن
import { createPinia } from 'pinia'    // <-- این را اضافه کنید
import 'element-plus/dist/index.css'



const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
// Router رو به برنامه Vue اضافه کن
app.use(router) // <-- این خط رو اضافه کن


app.mount('#app') // برنامه رو به المنت #app در index.html وصل کن