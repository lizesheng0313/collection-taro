<template>
  <view class="detail-page">
    <view v-if="loading" class="loading">
      加载中...
    </view>
    
    <view v-else-if="!article" class="empty">
      <view class="empty-icon">😕</view>
      <view class="empty-text">文章不存在</view>
    </view>
    
    <view v-else class="article-content">
      <!-- 文章头部 -->
      <view class="article-header">
        <view class="title-row">
          <view class="article-title">{{ article.title }}</view>
          <view class="favorite-btn" :class="{ favorited: isFavorited }" @tap="toggleFavorite">
            <view class="favorite-icon">
              <view class="icon-heart" :class="{ filled: isFavorited }"></view>
            </view>
          </view>
        </view>
        
        <!-- GitHub项目信息 -->
        <view v-if="article.article_type === 'github_project'" class="github-info">
          <view class="github-stats">
            <view class="stat-item">
              <text class="stat-icon">⭐</text>
              <text class="stat-value">{{ formatNumber(article.stars_count || article.github_info?.stars || 0) }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">🍴</text>
              <text class="stat-value">{{ formatNumber(article.forks_count || article.github_info?.forks || 0) }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">📖</text>
              <text class="stat-value">{{ article.read_count || 0 }}</text>
            </view>
            <view class="stat-item" v-if="article.overall_score">
              <text class="stat-icon">📊</text>
              <text class="stat-value">{{ article.overall_score }}/10</text>
            </view>
          </view>

          <view class="github-tags" v-if="getDetailTopics(article).length">
            <text
              v-for="topic in getDetailTopics(article)"
              :key="topic"
              class="tag"
            >
              {{ topic }}
            </text>
          </view>
        </view>
        
        <view class="article-meta">
          <text class="meta-item">{{ formatDate(article.collect_time) }}</text>
          <text class="meta-item">阅读 {{ article.read_count }}</text>
        </view>
      </view>

      <!-- 项目介绍 -->
      <view v-if="article.article_type === 'github_project'" class="project-intro">
        <view class="intro-title">📋 项目介绍</view>
        <view class="intro-sections">
          <!-- 项目描述 -->
          <view v-if="article.translated_description || article.original_description" class="intro-section">
            <view class="section-title">� 项目描述</view>
            <view class="section-content">
              {{ article.translated_description || article.original_description }}
            </view>
          </view>

          <!-- 详细介绍 -->
          <view v-if="article.project_intro" class="intro-section">
            <view class="section-title">📖 详细介绍</view>
            <view class="section-content">
              <rich-text :nodes="formatContent(article.project_intro)" />
            </view>
          </view>

          <!-- 技术信息 -->
          <view v-if="article.github_url" class="intro-section">
            <view class="section-title">🔧 技术信息</view>
            <view class="section-content">
              <view v-if="article.github_url" class="tech-item">
                <text class="tech-label">项目地址：</text>
                <text class="tech-value tech-link" @tap="openGitHub">{{ article.github_url }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 商业价值分析 -->
      <view v-if="businessAnalysis" class="business-analysis">
        <view class="analysis-title">💰 商业分析</view>

        <!-- 解决的问题 -->
        <view v-if="businessAnalysis.problem_solved" class="analysis-section">
          <view class="section-title">🎯 解决什么问题？</view>
          <view class="section-content">{{ businessAnalysis.problem_solved }}</view>
        </view>

        <!-- 目标客户 -->
        <view v-if="businessAnalysis.target_customers" class="analysis-section">
          <view class="section-title">👥 谁会买单？</view>
          <view class="section-content">{{ businessAnalysis.target_customers }}</view>
        </view>

        <!-- 赚钱方法 -->
        <view v-if="businessAnalysis.money_making_ideas && businessAnalysis.money_making_ideas.length" class="analysis-section">
          <view class="section-title">💡 赚钱方法</view>
          <view class="money-ideas">
            <view v-for="(idea, index) in businessAnalysis.money_making_ideas" :key="index" class="idea-card">
              <view class="idea-header">
                <text class="idea-method">{{ idea.method }}</text>
                <text class="idea-difficulty" :class="getDifficultyClass(idea.difficulty)">{{ idea.difficulty }}</text>
              </view>
              <view class="idea-description">{{ idea.description }}</view>
              <view class="idea-price">💰 {{ idea.price_range }}</view>
            </view>
          </view>
        </view>

        <!-- 销售渠道 -->
        <view v-if="businessAnalysis.sales_channels" class="analysis-section">
          <view class="section-title">🛒 在哪里卖？</view>
          <view class="section-content">{{ businessAnalysis.sales_channels }}</view>
        </view>

        <!-- 推广建议 -->
        <view v-if="businessAnalysis.marketing_tips" class="analysis-section">
          <view class="section-title">📢 怎么推广？</view>
          <view class="section-content">{{ businessAnalysis.marketing_tips }}</view>
        </view>

        <!-- 启动成本 -->
        <view v-if="businessAnalysis.startup_cost" class="analysis-section">
          <view class="section-title">💸 启动成本</view>
          <view class="section-content">{{ businessAnalysis.startup_cost }}</view>
        </view>

        <!-- 风险提醒 -->
        <view v-if="businessAnalysis.risks" class="analysis-section">
          <view class="section-title">⚠️ 风险提醒</view>
          <view class="section-content">{{ businessAnalysis.risks }}</view>
        </view>

        <!-- 快速开始 -->
        <view v-if="businessAnalysis.quick_start" class="analysis-section">
          <view class="section-title">🚀 马上行动</view>
          <view class="section-content">
            <view v-if="Array.isArray(businessAnalysis.quick_start)">
              <view v-for="(step, index) in businessAnalysis.quick_start" :key="index" class="quick-step">
                {{ step }}
              </view>
            </view>
            <view v-else>{{ businessAnalysis.quick_start }}</view>
          </view>
        </view>

        <!-- 收益预估 -->
        <view v-if="businessAnalysis.profit_potential" class="analysis-section profit-section">
          <view class="section-title">📈 收益预估</view>
          <view class="profit-content">{{ businessAnalysis.profit_potential }}</view>
        </view>
      </view>

      <!-- 文章内容 -->
      <view v-if="article.article_type !== 'github_project'" class="article-body">
        <rich-text :nodes="formatContent(article.content)" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Taro, { getCurrentInstance, useLoad, useShareAppMessage } from '@tarojs/taro'
import { getArticleDetail, getGitHubProjectDetail, addFavorite, removeFavorite, checkFavorite, type Article } from '../../api/index'

const article = ref<Article | null>(null)
const loading = ref(false)
const isFavorited = ref(false)
const favoriteLoading = ref(false)

// 解析商业价值分析数据
const businessAnalysis = computed(() => {
  if (!article.value?.business_analysis) return null
  try {
    const analysis = typeof article.value.business_analysis === 'string'
      ? JSON.parse(article.value.business_analysis)
      : article.value.business_analysis

    // 如果有raw_ai_response，尝试解析它
    if (analysis.raw_ai_response) {
      try {
        // 提取JSON部分，处理转义字符
        let rawResponse = analysis.raw_ai_response
        // 处理转义的引号
        rawResponse = rawResponse.replace(/\\"/g, '"')
        rawResponse = rawResponse.replace(/\\n/g, '\n')

        const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/)
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[1])
          return parsedData
        }
      } catch (e) {
        console.warn('Failed to parse raw_ai_response:', e)
      }
    }

    return analysis
  } catch (error) {
    console.error('Failed to parse business analysis:', error)
    return null
  }
})

// 这个函数已经不需要了，直接显示原始内容

// 获取页面参数
const instance = getCurrentInstance()
const params = instance?.router?.params || {}

// 加载文章详情
const loadArticle = async () => {
  loading.value = true
  
  try {
    let response
    
    if ((params.type === 'github' || params.type === 'github_project') && params.fullName) {
      // GitHub项目详情
      response = await getGitHubProjectDetail(decodeURIComponent(params.fullName))
    } else if (params.id) {
      // 普通文章详情
      response = await getArticleDetail(Number(params.id))
    } else {
      throw new Error('缺少必要参数')
    }
    
    article.value = response.data

    // 设置页面标题
    if (article.value) {
      Taro.setNavigationBarTitle({
        title: article.value.title.length > 20
          ? article.value.title.substring(0, 20) + '...'
          : article.value.title
      })

      // 检查收藏状态
      checkFavoriteStatus()
    }
  } catch (error) {
    console.error('加载文章失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!article.value) return

  try {
    const token = Taro.getStorageSync('token')
    if (!token) {
      isFavorited.value = false
      return
    }

    const response = await checkFavorite(article.value.id)
    isFavorited.value = response.data.isFavorited
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isFavorited.value = false
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!article.value) return

  const token = Taro.getStorageSync('token')
  if (!token) {
    Taro.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  if (favoriteLoading.value) return
  favoriteLoading.value = true

  try {
    if (isFavorited.value) {
      // 取消收藏
      await removeFavorite({ articleId: article.value.id })
      isFavorited.value = false
      Taro.showToast({
        title: '已取消收藏',
        icon: 'success'
      })
    } else {
      // 添加收藏
      await addFavorite({
        articleId: article.value.id,
        articleType: article.value.article_type
      })
      isFavorited.value = true
      Taro.showToast({
        title: '收藏成功',
        icon: 'success'
      })
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error)
    const errorMessage = error?.message || '操作失败'
    Taro.showToast({
      title: errorMessage,
      icon: 'none'
    })
  } finally {
    favoriteLoading.value = false
  }
}

// 格式化内容
const formatContent = (content: string) => {
  if (!content) return ''

  // 更完整的Markdown转换
  let formatted = content
    // 标题处理 - 添加内联样式确保 margin-top 生效
    .replace(/^### (.*$)/gm, '<h3 style="margin-top: 40rpx; margin-bottom: 20rpx; font-weight: 600; color: #333;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="margin-top: 40rpx; margin-bottom: 20rpx; font-weight: 600; color: #333;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="margin-top: 40rpx; margin-bottom: 20rpx; font-weight: 600; color: #333;">$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 代码块
    .replace(/`(.*?)`/g, '<code class="md-code">$1</code>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link">$1</a>')
    // 列表项
    .replace(/^- (.*$)/gm, '<li class="md-li">$1</li>')
    // 换行
    .replace(/\n\n/g, '</p><p class="md-p">')
    .replace(/\n/g, '<br/>')

  // 包装段落
  if (!formatted.includes('<h') && !formatted.includes('<li')) {
    formatted = `<p class="md-p">${formatted}</p>`
  }

  // 处理列表
  formatted = formatted.replace(/(<li class="md-li">.*?<\/li>)/g, '<ul class="md-ul">$1</ul>')

  // 最后处理数字标题 - 在所有其他处理完成后
  formatted = formatted.replace(/(\d+\.\s+[^<\n]+)/g, '<div class="number-title">$1</div>')

  return formatted
}

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

// 格式化日期 - 简单的年月日格式
const formatDate = (dateStr: string) => {
  if (!dateStr) return '未知时间'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '时间格式错误'

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取详情页标签
const getDetailTopics = (article: Article) => {
  if (article.topics && typeof article.topics === 'string') {
    return article.topics.split(',').filter(topic => topic.trim())
  }
  if (Array.isArray(article.topics)) {
    return article.topics
  }
  return article.github_info?.topics || []
}

// 获取难度等级样式
const getDifficultyClass = (difficulty: string) => {
  const classes = {
    '简单': 'difficulty-easy',
    '中等': 'difficulty-medium',
    '困难': 'difficulty-hard'
  }
  return classes[difficulty] || 'difficulty-default'
}

// 打开GitHub链接
const openGitHub = () => {
  const url = article.value?.github_url || article.value?.github_info?.url
  if (url) {
    Taro.setClipboardData({
      data: url,
      success: () => {
        Taro.showToast({
          title: '链接已复制',
          icon: 'success'
        })
      }
    })
  }
}

// 配置微信自带分享功能
useShareAppMessage(() => {
  if (!article.value) {
    return {
      title: '肥猫猫博客',
      path: '/pages/github/index'
    }
  }

  const title = article.value.title.length > 30
    ? article.value.title.substring(0, 30) + '...'
    : article.value.title

  const path = params.type === 'github_project' && params.fullName
    ? `/pages/detail/index?fullName=${encodeURIComponent(params.fullName)}&type=github_project`
    : `/pages/detail/index?id=${params.id}`

  return {
    title: `${title} - 肥猫猫博客`,
    path: path,
    imageUrl: '' // 可以设置分享图片
  }
})

useLoad(() => {
  loadArticle()
})

onMounted(() => {
  // 页面加载完成
})
</script>

<style lang="scss">
.detail-page {
  min-height: 100vh;
  background: #ffffff;
}

/* 项目介绍样式 */
.project-intro {
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-top: 20rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e9ecef;
}

.project-intro .intro-title {
  font-size: 26px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  text-align: center;
}

.project-intro .intro-section {
  margin-bottom: 24rpx;
  background-color: white;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid #f0f0f0;
}

.project-intro .intro-section + .intro-section {
  margin-top: 48rpx !important;
}

.project-intro .section-title {
  font-size: 26px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.project-intro .section-content {
  font-size: 24px;
  color: #333;
  line-height: 1.6;
}

.project-intro .tech-item {
  margin-bottom: 8rpx;
}

.project-intro .tech-label {
  color: #666;
  font-weight: 500;
}

.project-intro .tech-value {
  color: #333;
}

.project-intro .tech-link {
  color: #007aff;
  text-decoration: underline;
}

/* 商业分析样式 */
.business-analysis {
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-top: 40rpx;
  border: 1rpx solid #e9ecef;
}

.business-analysis .analysis-title {
  font-size: 26px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
  text-align: center;
}

.business-analysis .analysis-section {
  margin-bottom: 24rpx;
  background-color: white;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid #f0f0f0;
}

.business-analysis .analysis-section + .analysis-section {
  margin-top: 48rpx !important;
}

.business-analysis .section-title {
  font-size: 26px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.business-analysis .section-content {
  font-size: 24px;
  color: #333;
  line-height: 1.6;
}

/* 赚钱方法样式 */
.business-analysis .money-ideas .idea-card {
  background-color: #f8f9fa;
  border-radius: 8rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
  border: 1rpx solid #e9ecef;
}

.business-analysis .idea-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.business-analysis .idea-method {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
}

.business-analysis .idea-difficulty {
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
}

.business-analysis .difficulty-easy {
  background-color: #d4edda;
  color: #155724;
}

.business-analysis .difficulty-medium {
  background-color: #fff3cd;
  color: #856404;
}

.business-analysis .difficulty-hard {
  background-color: #f8d7da;
  color: #721c24;
}

.business-analysis .difficulty-default {
  background-color: #e2e3e5;
  color: #383d41;
}

.business-analysis .idea-description {
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
  line-height: 1.5;
}

.business-analysis .idea-price {
  font-size: 22rpx;
  color: #007aff;
  font-weight: 500;
}

/* 快速开始步骤样式 */
.business-analysis .quick-step {
  margin-bottom: 8rpx;
  padding-left: 16rpx;
  position: relative;
}

.business-analysis .quick-step::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #007aff;
}

/* 收益预估特殊样式 */
.business-analysis .profit-section {
  background-color: #e8f5e8;
  border: 1rpx solid #c3e6c3;
}

.business-analysis .profit-content {
  color: #2d5a2d;
  font-weight: 500;
}

.loading {
  text-align: center;
  padding: 80px;
  color: #999;
  font-size: 28px;
}

.empty {
  text-align: center;
  padding: 120px 40px;
  color: #999;
  
  .empty-icon {
    font-size: 120px;
    margin-bottom: 32px;
  }
  
  .empty-text {
    font-size: 32px;
  }
}

.article-content {
  background: white;
  min-height: 100vh;
}

.article-header {
  padding: 40px 32px 32px;
  border-bottom: 1px solid #eee;
  margin-top: 20rpx;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .article-title {
    flex: 1;
    font-size: 36px;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
    margin-right: 20px;
  }

  .favorite-btn {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);

    &.favorited {
      background: #007aff;
      border-color: #007aff;
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.9);
    }

    .favorite-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon-heart {
        width: 20px;
        height: 18px;
        position: relative;
        transition: all 0.3s ease;

        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 14px;
          border: 2px solid #666;
          border-radius: 10px 10px 0 0;
          transform: rotate(-45deg);
          transform-origin: 0 100%;
          transition: all 0.3s ease;
        }

        &::after {
          left: 8px;
          transform: rotate(45deg);
          transform-origin: 100% 100%;
        }

        &.filled {
          &::before,
          &::after {
            background: white;
            border-color: white;
          }
        }
      }
    }
  }
  
  .github-info {
    margin-bottom: 24px;
    
    .github-stats {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      
      .stat-item {
        display: flex;
        align-items: center;
        margin-right: 32px;
        font-size: 26px;
        color: #666;
        
        .stat-icon {
          margin-right: 8px;
        }
        
        &:last-child {
          margin-right: 0;
        }
      }
    }
    
    .github-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 20px;

      .tag {
        background: #e6f3ff;
        color: #007aff;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 22px;
      }
    }
  }
}

.article-body {
  padding: 32px;
  font-size: 28px;
  line-height: 1.8;
  color: #333;
  margin-top: 20rpx;
}

.github-link {
  padding: 32px;
  text-align: center;
  margin-top: 20rpx;
}

.github-link .link-btn {
  background: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 24px;
  font-size: 28px;
  font-weight: 500;
}

/* 为动态生成的标题添加 margin-top */
.md-h1, .md-h2, .md-h3 {
  margin-top: 40rpx !important;
  margin-bottom: 20rpx !important;
}

/* 第一个标题不需要顶部间距 */
.section-content .md-h1:first-child,
.section-content .md-h2:first-child,
.section-content .md-h3:first-child {
  margin-top: 0 !important;
}

/* rich-text 内部的标题样式 */
rich-text h1,
rich-text h2,
rich-text h3 {
  margin-top: 40rpx !important;
  margin-bottom: 20rpx !important;
}

rich-text h1:first-child,
rich-text h2:first-child,
rich-text h3:first-child {
  margin-top: 0 !important;
}

/* 使用深度选择器确保样式生效 */
::v-deep .md-h1,
::v-deep .md-h2,
::v-deep .md-h3 {
  margin-top: 40rpx !important;
  margin-bottom: 20rpx !important;
  display: block !important;
}

::v-deep .md-h1:first-child,
::v-deep .md-h2:first-child,
::v-deep .md-h3:first-child {
  margin-top: 0 !important;
}

/* 针对 rich-text 组件的深度样式 */
::v-deep rich-text h1,
::v-deep rich-text h2,
::v-deep rich-text h3 {
  margin-top: 40rpx !important;
  margin-bottom: 20rpx !important;
  display: block !important;
}

::v-deep rich-text h1:first-child,
::v-deep rich-text h2:first-child,
::v-deep rich-text h3:first-child {
  margin-top: 0 !important;
}

/* 使用深度选择器确保样式生效 */
::v-deep .md-h1,
::v-deep .md-h2,
::v-deep .md-h3 {
  margin-top: 40rpx !important;
  margin-bottom: 20rpx !important;
  display: block !important;
}

::v-deep .md-h1:first-child,
::v-deep .md-h2:first-child,
::v-deep .md-h3:first-child {
  margin-top: 0 !important;
}

/* 针对 rich-text 组件的深度样式 */
::v-deep rich-text h1,
::v-deep rich-text h2,
::v-deep rich-text h3 {
  margin-top: 40rpx !important;
  margin-bottom: 20rpx !important;
  display: block !important;
}

::v-deep rich-text h1:first-child,
::v-deep rich-text h2:first-child,
::v-deep rich-text h3:first-child {
  margin-top: 0 !important;
}

/* 数字标题样式 */
.number-title {
  margin-top: 40rpx !important;
  margin-bottom: 20rpx !important;
  font-weight: 600 !important;
  color: #333 !important;
  font-size: 28rpx !important;
  display: block !important;
}

::v-deep .number-title {
  margin-top: 40rpx !important;
  margin-bottom: 20rpx !important;
  font-weight: 600 !important;
  color: #333 !important;
  font-size: 28rpx !important;
  display: block !important;
}
</style>
