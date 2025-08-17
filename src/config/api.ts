// API配置文件 - 统一管理所有API地址

// 环境配置
const ENV = process.env.NODE_ENV || 'development'

// 不同环境的API配置
const API_CONFIGS = {
  // 开发环境
  development: {
    BASE_URL: 'http://127.0.0.1:7003',
    WS_URL: 'ws://127.0.0.1:7003'
  },
  
  // 生产环境
  production: {
    BASE_URL: 'https://ai.zjkdongao.cn',
    WS_URL: 'wss://ai.zjkdongao.cn'
  },
  
  // 测试环境
  test: {
    BASE_URL: 'https://test-api.zjkdongao.cn',
    WS_URL: 'wss://test-api.zjkdongao.cn'
  }
}

// 当前环境的API配置
export const API_CONFIG = API_CONFIGS[ENV] || API_CONFIGS.development

// API端点配置
export const API_ENDPOINTS = {
  // 文章相关
  ARTICLES: {
    LIST: '/api/articles/list',
    DETAIL: '/api/articles/detail',
    SEARCH: '/api/articles/search',
    GITHUB: '/api/articles/github',
    GITHUB_DETAIL: '/api/articles/github'
  },
  
  // 微信小程序相关
  MINIPROGRAM: {
    LOGIN: '/api/miniprogram/login',
    USER_INFO: '/api/miniprogram/userInfo',
    ADD_FAVORITE: '/api/miniprogram/addFavorite',
    FAVORITES: '/api/miniprogram/favorites'
  },
  
  // GitHub相关
  GITHUB: {
    TRENDING: '/api/github/trending',
    SEARCH: '/api/github/search',
    REPOS: '/api/github/repos',
    SUGGESTIONS: '/api/github/suggestions'
  },
  
  // 分析相关
  ANALYSIS: {
    ANALYZE: '/api/analysis',
    TRANSLATE: '/api/analysis/translate',
    BATCH_TRANSLATE: '/api/analysis/translate/batch',
    HISTORY: '/api/analysis/history'
  }
}

// 导出完整的API URL构建函数
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// 常用的API URL
export const API_URLS = {
  // 微信小程序
  LOGIN: buildApiUrl(API_ENDPOINTS.MINIPROGRAM.LOGIN),
  USER_INFO: buildApiUrl(API_ENDPOINTS.MINIPROGRAM.USER_INFO),
  ADD_FAVORITE: buildApiUrl(API_ENDPOINTS.MINIPROGRAM.ADD_FAVORITE),
  FAVORITES: buildApiUrl(API_ENDPOINTS.MINIPROGRAM.FAVORITES),
  
  // 文章
  ARTICLES_LIST: buildApiUrl(API_ENDPOINTS.ARTICLES.LIST),
  ARTICLES_SEARCH: buildApiUrl(API_ENDPOINTS.ARTICLES.SEARCH),
  GITHUB_PROJECTS: buildApiUrl(API_ENDPOINTS.ARTICLES.GITHUB),
  
  // GitHub
  GITHUB_TRENDING: buildApiUrl(API_ENDPOINTS.GITHUB.TRENDING),
  GITHUB_SEARCH: buildApiUrl(API_ENDPOINTS.GITHUB.SEARCH)
}

export default API_CONFIG
