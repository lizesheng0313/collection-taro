import { createApp } from 'vue'
import { autoLogin } from './api/index'
import './app.scss'

const App = createApp({
  onLaunch() {
    // 应用启动时自动登录
    autoLogin()
  }
})

export default App
