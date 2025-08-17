import { createApp } from 'vue'
import Taro from '@tarojs/taro'
import { API_URLS } from './config/api'
import './app.scss'

const App = createApp({
  onLaunch() {
    // 应用启动时自动登录
    this.autoLogin()
  },

  methods: {
    async autoLogin() {
      try {
        // 检查是否已有token
        const token = Taro.getStorageSync('token')
        if (token) {
          // 如果有token，验证是否有效
          try {
            const response = await Taro.request({
              url: API_URLS.USER_INFO,
              method: 'GET',
              header: {
                'Authorization': `Bearer ${token}`
              }
            })

            if (response.data.success) {
              // token有效，用户信息已存在
              return
            } else {
              // token无效，清除本地存储
              Taro.removeStorageSync('token')
              Taro.removeStorageSync('userInfo')
            }
          } catch (error) {
            // 验证失败，清除本地存储
            Taro.removeStorageSync('token')
            Taro.removeStorageSync('userInfo')
          }
        }

        // 如果没有有效token，尝试自动登录
        const loginRes = await Taro.login()
        if (loginRes.code) {
          const response = await Taro.request({
            url: API_URLS.LOGIN,
            method: 'POST',
            data: {
              code: loginRes.code,
              source: 'weapp'
            }
          })

          if (response.data.success) {
            // 自动登录成功，存储token和用户信息
            Taro.setStorageSync('token', response.data.data.token)
            Taro.setStorageSync('userInfo', response.data.data.userInfo)
          }
        }
      } catch (error) {
        // 自动登录失败，不影响应用启动
      }
    }
  }
})

export default App
