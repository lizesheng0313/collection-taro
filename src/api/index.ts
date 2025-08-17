import request from '../utils/request'
import Taro from '@tarojs/taro'

// 文章相关接口
export interface Article {
  id: number
  title: string
  content: string
  summary?: string
  article_type: 'blog' | 'github_project'
  status: string
  collect_time: string
  update_time: string
  read_count: number
  github_full_name?: string
  github_url?: string
  original_description?: string
  translated_description?: string
  project_intro?: string
  programming_language?: string
  stars_count?: number
  forks_count?: number
  topics?: string
  overall_score?: number
  business_analysis?: any
  github_info?: {
    full_name: string
    url: string
    language: string
    stars: number
    forks: number
    topics: string[]
    original_description: string
    translated_description: string
  }
}

export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 获取文章列表
export const getArticles = (params: {
  page?: number
  pageSize?: number
  article_type?: string
}) => {
  return request<PaginationResult<Article>>({
    url: '/api/articles/list',
    method: 'GET',
    data: params
  })
}

// 获取文章详情
export const getArticleDetail = (id: number) => {
  return request<Article>({
    url: `/api/articles/detail/${id}`,
    method: 'GET'
  })
}

// 获取GitHub项目列表
export const getGitHubProjects = (params: {
  page?: number
  pageSize?: number
  trending_period?: 'daily' | 'weekly' | 'monthly'
  language?: string
  min_stars?: number
}) => {
  return request<PaginationResult<Article>>({
    url: '/api/articles/github',
    method: 'GET',
    data: params
  })
}

// 获取GitHub项目详情
export const getGitHubProjectDetail = (fullName: string) => {
  const [owner, repo] = fullName.split('/')
  return request<Article>({
    url: `/api/articles/github/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    method: 'GET'
  })
}

// 搜索文章和项目
export const searchArticles = (params: {
  keyword: string
  page?: number
  pageSize?: number
  article_type?: string
}) => {
  return request<PaginationResult<Article>>({
    url: '/api/articles/search',
    method: 'GET',
    data: params
  })
}

// 小程序用户相关接口
export interface LoginParams {
  code: string
  source?: string
}

export interface UserInfo {
  id: number
  openid: string
  unionid?: string
  nickName?: string
  avatarUrl?: string
  gender?: number
  city?: string
  province?: string
  country?: string
  language?: string
  source: string
  create_time: number
  update_time: number
}

export interface LoginResult {
  userInfo: UserInfo
  openid: string
  unionid?: string
  token: string
  session_key?: string
}

// 微信登录
export const login = (params: LoginParams) => {
  return request<LoginResult>({
    url: '/api/miniprogram/login',
    method: 'POST',
    data: params
  })
}

// 更新用户信息
export const updateUserInfo = (userInfo: Partial<UserInfo>) => {
  return request({
    url: '/api/miniprogram/updateUserInfo',
    method: 'POST',
    data: userInfo,
    header: {
      authorization: getToken()
    }
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request<UserInfo>({
    url: '/api/miniprogram/userInfo',
    method: 'GET',
    header: {
      authorization: getToken()
    }
  })
}

// 添加收藏
export const addFavorite = (params: {
  articleId: number
  articleType: 'blog' | 'github_project'
}) => {
  return request({
    url: '/api/miniprogram/addFavorite',
    method: 'POST',
    data: params,
    header: {
      authorization: getToken()
    }
  })
}

// 取消收藏
export const removeFavorite = (params: {
  articleId: number
}) => {
  return request({
    url: '/api/miniprogram/removeFavorite',
    method: 'POST',
    data: params,
    header: {
      authorization: getToken()
    }
  })
}

// 获取收藏列表
export const getFavorites = (params: {
  page?: number
  pageSize?: number
  articleType?: 'blog' | 'github_project'
}) => {
  return request<PaginationResult<Article>>({
    url: '/api/miniprogram/favorites',
    method: 'GET',
    data: params,
    header: {
      authorization: getToken()
    }
  })
}

// 检查是否已收藏
export const checkFavorite = (articleId: number) => {
  return request<{
    isFavorited: boolean
    favoriteTime?: number
  }>({
    url: `/api/miniprogram/checkFavorite/${articleId}`,
    method: 'GET',
    header: {
      authorization: getToken()
    }
  })
}

// 获取token的辅助函数
const getToken = () => {
  try {
    return Taro.getStorageSync('token') || ''
  } catch (error) {
    return ''
  }
}
