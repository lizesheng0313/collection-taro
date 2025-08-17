import Taro from '@tarojs/taro'
import { API_CONFIG } from '../config/api'

// 基础配置
const BASE_URL = API_CONFIG.BASE_URL

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: any
}

interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  code?: number
}

// 请求拦截器
const request = async <T = any>(options: RequestOptions): Promise<ApiResponse<T>> => {
  const { url, method = 'GET', data, header = {} } = options

  // 显示加载提示
  Taro.showLoading({
    title: '加载中...',
    mask: true
  })

  try {
    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      }
    })

    Taro.hideLoading()

    const result = response.data as ApiResponse<T>

    // 处理业务错误
    if (!result.success) {
      Taro.showToast({
        title: result.message || '请求失败',
        icon: 'none',
        duration: 2000
      })
      throw new Error(result.message || '请求失败')
    }

    return result
  } catch (error) {
    Taro.hideLoading()
    
    // 网络错误处理
    Taro.showToast({
      title: '网络请求失败',
      icon: 'none',
      duration: 2000
    })
    
    throw error
  }
}

export default request
