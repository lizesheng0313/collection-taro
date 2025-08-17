<template>
  <view class="index-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input" @tap="goToSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索文章和项目...</text>
      </view>
    </view>



    <!-- GitHub项目列表 -->
    <view class="project-list">
      <view v-if="loading && projects.length === 0" class="loading">
        加载中...
      </view>

      <view v-else-if="projects.length === 0" class="empty">
        <view class="empty-icon">📦</view>
        <view class="empty-text">暂无项目</view>
      </view>

      <view v-else>
        <view
          v-for="project in projects"
          :key="project.id"
          class="project-card"
          @tap="goToDetail(project)"
        >
          <view class="project-header">
            <view class="project-name">{{ project.title }}</view>
            <view class="project-score">
              ⭐ {{ project.stars_count || 0 }}
            </view>
          </view>

          <view class="project-desc" v-if="project.translated_description">
            {{ project.translated_description }}
          </view>

          <view class="project-stats">
            <view class="stat-item" v-if="project.programming_language">
              <text class="stat-icon">💻</text>
              <text>{{ project.programming_language }}</text>
            </view>
            <view class="stat-item" v-if="project.forks_count">
              <text class="stat-icon">🍴</text>
              <text>{{ project.forks_count }}</text>
            </view>
          </view>

          <view class="project-time">
            <text class="time-text">{{ formatTime(project.collect_time) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore && !loading" class="load-more" @tap="loadMore">
      点击加载更多
    </view>
    <view v-if="loading && projects.length > 0" class="loading-more">
      加载中...
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro, { useShareAppMessage, useReachBottom } from '@tarojs/taro'
import { getArticles, type Article } from '../../api/index'

const projects = ref<Article[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 10

// 加载GitHub项目列表
const loadProjects = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true

  try {
    const params = {
      page: isLoadMore ? page.value : 1,
      pageSize,
      article_type: 'github_project' // 只加载GitHub项目
    }

    const response = await getArticles(params)

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
    console.error('加载文章失败:', error)
    Taro.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    loadProjects(true)
  }
}

// 跳转到详情页
const goToDetail = (article: Article) => {
  if (article.article_type === 'github_project' && article.github_full_name) {
    Taro.navigateTo({
      url: `/pages/detail/index?type=github&fullName=${encodeURIComponent(article.github_full_name)}`
    })
  } else {
    Taro.navigateTo({
      url: `/pages/detail/index?type=article&id=${article.id}`
    })
  }
}

// 跳转到搜索页
const goToSearch = () => {
  Taro.navigateTo({
    url: '/pages/search/index'
  })
}

// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 30) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

// 页面分享
useShareAppMessage(() => {
  return {
    title: '肥猫猫博客 - 发现优质技术内容',
    path: '/pages/index/index'
  }
})

// 触底加载更多
useReachBottom(() => {
  loadMore()
})

// 下拉刷新
const onPullDownRefresh = async () => {
  page.value = 1
  hasMore.value = true
  await loadProjects()
  Taro.stopPullDownRefresh()
}

onMounted(() => {
  loadProjects()
})

// 页面生命周期函数会自动被Taro识别
</script>

<style lang="scss">
.index-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.search-bar {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #eee;

  .search-input {
    display: flex;
    align-items: center;
    padding: 20px 24px;
    background: #f8f9fa;
    border-radius: 50px;
    border: 1px solid #e9ecef;

    .search-icon {
      margin-right: 16px;
      font-size: 20px;
      color: #666;
    }

    .search-placeholder {
      color: #666;
      font-size: 32px;
    }
  }
}

.project-list {
  padding: 0 20px 100px 20px;
}

.project-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .project-name {
      flex: 1;
      font-size: 32px;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
      margin-right: 16px;
    }

    .project-score {
      background: linear-gradient(135deg, #007aff, #0056d3);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 22px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
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

.loading, .empty {
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    font-size: 120px;
    margin-bottom: 32px;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 32px;
    color: #999;
    font-weight: 500;
  }
}

.loading {
  color: #999;
  font-size: 32px;
  font-weight: 500;
}

.load-more, .loading-more {
  text-align: center;
  padding: 32px;
  color: #999;
  font-size: 28px;
}

.load-more, .loading-more {
  text-align: center;
  padding: 40rpx 0;
  color: #007aff;
  font-size: 28rpx;
}

.loading-more {
  color: #999;
}
</style>
