import request from '../utils/request'

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
