// API配置文件 - 简化版本

// 直接从环境变量获取，简化配置
const BASE_URL = process.env.TARO_APP_API_BASE_URL || 'http://127.0.0.1:7003'

export const API_CONFIG = {
  BASE_URL
}

export default API_CONFIG
