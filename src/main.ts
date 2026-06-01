import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import './style.css'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 全局配置
app.use(ElementPlus, {
  size: 'small', // 设置默认组件尺寸
  zIndex: 3000, // 设置弹出组件的初始 z-index
})

app.use(router)

app.mount('#app')