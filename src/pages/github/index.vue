<template>
  <view class="github-page">
    <!-- 筛选器 -->
    <view class="filter-bar">
      <view class="filter-tabs">
        <view
          v-for="period in periods"
          :key="period.value"
          :class="['tab-item', { active: currentPeriod === period.value }]"
          @tap="changePeriod(period.value)"
        >
          {{ period.label }}
        </view>
      </view>
    </view>

    <!-- 项目列表 -->
    <view class="project-list">
      <view v-if="loading && projects.length === 0" class="loading">
        加载中...
      </view>

      <view v-else-if="projects.length === 0" class="empty">
        <view class="empty-icon">🚀</view>
        <view class="empty-text">暂无GitHub项目</view>
      </view>

      <view v-else>
        <view
          v-for="project in projects"
          :key="project.id"
          class="project-card"
          @tap="goToDetail(project)"
        >
          <view class="project-header">
            <view class="project-name">{{ project.github_full_name || project.github_info?.full_name }}</view>
            <view class="project-score" v-if="project.overall_score">
              {{ project.overall_score }}/10
            </view>
          </view>

          <view class="project-desc" v-if="project.translated_description || project.github_info?.translated_description">
            {{ project.translated_description || project.github_info?.translated_description }}
          </view>

          <view class="project-stats">
            <view class="stat-item">
              <text class="stat-icon">⭐</text>
              <text class="stat-value">{{ formatNumber(project.stars_count || project.github_info?.stars || 0) }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">🍴</text>
              <text class="stat-value">{{ formatNumber(project.forks_count || project.github_info?.forks || 0) }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-icon">📖</text>
              <text class="stat-value">{{ project.read_count || 0 }}</text>
            </view>
          </view>

          <view class="project-tags" v-if="getTopics(project).length">
            <text
              v-for="topic in getTopics(project).slice(0, 3)"
              :key="topic"
              class="tag"
            >
              {{ topic }}
            </text>
          </view>

          <!-- 时间信息 -->
          <view class="project-time">
            <text class="time-text">{{ formatDate(project.collect_time) }}</text>
          </view>
        </view>

        <!-- 加载更多提示 -->
        <view v-if="loading" class="loading-more">
          正在加载更多...
        </view>

        <view v-else-if="!hasMore && projects.length > 0" class="no-more">
          没有更多内容了
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro, { useShareAppMessage, useReachBottom } from '@tarojs/taro'
import { getGitHubProjects, type Article } from '../../api/index'

const projects = ref<Article[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 10
const currentPeriod = ref<'daily' | 'weekly' | 'monthly'>('daily')

const periods = [
  { label: '今日热门', value: 'daily' as const },
  { label: '本周精选', value: 'weekly' as const },
  { label: '月度推荐', value: 'monthly' as const }
]

// 加载GitHub项目列表
const loadProjects = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const response = await getGitHubProjects({
      page: isLoadMore ? page.value : 1,
      pageSize,
      trending_period: currentPeriod.value
    })
    
    if (isLoadMore) {
      projects.value.push(...response.data.list)
    } else {
      projects.value = response.data.list
    }
    
    hasMore.value = response.data.list.length === pageSize
    if (isLoadMore) {
      page.value++
    } else {
      page.value = 2
    }
  } catch (error) {
    console.error('加载GitHub项目失败:', error)
  } finally {
    loading.value = false
  }
}

// 切换时间周期
const changePeriod = (period: 'daily' | 'weekly' | 'monthly') => {
  if (currentPeriod.value === period) return
  
  currentPeriod.value = period
  page.value = 1
  hasMore.value = true
  loadProjects()
}

// 使用页面的触底事件
useReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadProjects(true)
  }
})

// 跳转到详情页
const goToDetail = (project: Article) => {
  const fullName = project.github_full_name || project.github_info?.full_name
  if (fullName) {
    Taro.navigateTo({
      url: `/pages/detail/index?fullName=${encodeURIComponent(fullName)}&type=github_project`
    })
  }
}

// 获取项目标签
const getTopics = (project: Article) => {
  if (project.topics && typeof project.topics === 'string') {
    return project.topics.split(',').filter(topic => topic.trim())
  }
  if (Array.isArray(project.topics)) {
    return project.topics
  }
  return project.github_info?.topics || []
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

// 配置微信自带分享功能
useShareAppMessage(() => {
  return {
    title: '肥猫猫博客 - 发现优质GitHub项目',
    path: '/pages/github/index',
    imageUrl: '' // 可以设置分享图片
  }
})

onMounted(() => {
  loadProjects()

  // 显示分享按钮
  Taro.showShareMenu({
    withShareTicket: true
  })
})
</script>

<style lang="scss">
.github-page {
  min-height: 100vh;
  background: #ffffff;
}

.filter-bar {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #eee;

  .filter-tabs {
    display: flex;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 6px;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 16px 12px;
      font-size: 26px;
      color: #666;
      border-radius: 8px;
      transition: all 0.3s;

      &.active {
        background: #007aff;
        color: white;
        font-weight: 500;
      }
    }
  }
}

.project-list {
  padding: 20px;
}

.project-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    
    .project-name {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      flex: 1;
      margin-right: 16px;
    }
    
    .project-score {
      background: #ff9500;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 22px;
      font-weight: 500;
    }
  }
  
  .project-desc {
    font-size: 28px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .project-stats {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    .stat-item {
      display: flex;
      align-items: center;
      margin-right: 32px;
      font-size: 24px;
      color: #666;
      
      .stat-icon {
        margin-right: 8px;
      }
      
      &:last-child {
        margin-right: 0;
      }
    }
  }
  
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .tag {
      background: #e6f3ff;
      color: #007aff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 22px;
    }
  }

  .project-time {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .time-text {
      font-size: 22px;
      color: #999;
    }
  }
}

.loading {
  text-align: center;
  padding: 80px;
  color: #999;
  font-size: 28px;
}

.loading-more {
  text-align: center;
  padding: 32px;
  color: #999;
  font-size: 26px;
}

.no-more {
  text-align: center;
  padding: 32px;
  color: #ccc;
  font-size: 24px;
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
</style>
