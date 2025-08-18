<template>
  <view class="favorites-page">
    <!-- 头部 -->
    <view class="header">
      <view class="header-content">
        <view class="title-section">
          <view class="title">我的收藏</view>
          <view class="subtitle">{{ favorites.length }} 个精选项目</view>
        </view>
        <view class="header-icon">
          <view class="icon-heart"></view>
        </view>
      </view>
    </view>

    <!-- 收藏列表 -->
    <view class="favorites-list">
      <view v-if="loading && favorites.length === 0" class="loading">
        <view class="loading-spinner"></view>
        <view class="loading-text">加载中...</view>
      </view>

      <view v-else-if="favorites.length === 0" class="empty">
        <view class="empty-icon">
          <view class="icon-star-empty"></view>
        </view>
        <view class="empty-text">还没有收藏</view>
        <view class="empty-desc">去发现一些优质项目吧</view>
        <view class="empty-action" @tap="goToExplore">
          <text>去探索</text>
        </view>
      </view>

      <view v-else class="cards-container">
        <view
          v-for="item in favorites"
          :key="item.id"
          class="favorite-card"
          @tap="goToDetail(item)"
        >
          <view class="card-header">
            <view class="project-info">
              <view class="project-name">{{ item.title }}</view>
              <view class="project-desc" v-if="item.translated_description">
                {{ item.translated_description }}
              </view>
            </view>
            <view class="favorite-badge">
              <view class="badge-icon">
                <view class="icon-heart-filled"></view>
              </view>
            </view>
          </view>

          <view class="project-stats">
            <view class="stat-item" v-if="item.stars_count">
              <view class="stat-icon">
                <view class="icon-star"></view>
              </view>
              <view class="stat-value">{{ formatNumber(item.stars_count) }}</view>
            </view>
            <view class="stat-item" v-if="item.read_count">
              <view class="stat-icon">
                <view class="icon-eye"></view>
              </view>
              <view class="stat-value">{{ formatNumber(item.read_count) }}</view>
            </view>
            <view class="stat-item" v-if="item.forks_count">
              <view class="stat-icon">
                <view class="icon-fork"></view>
              </view>
              <view class="stat-value">{{ formatNumber(item.forks_count) }}</view>
            </view>
          </view>

          <view class="card-footer">
            <view class="favorite-time">收藏于 {{ formatTime(item.favorite_time) }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore && !loading" class="load-more" @tap="loadMore">
      <text>加载更多</text>
    </view>
    <view v-if="loading && favorites.length > 0" class="loading-more">
      <view class="loading-spinner small"></view>
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro, { useReachBottom, useDidShow } from '@tarojs/taro'
import { getFavorites, type Article } from '../../api/index'

const favorites = ref<Article[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 10

// 加载收藏列表
const loadFavorites = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const response = await getFavorites({
      page: isLoadMore ? page.value : 1,
      pageSize
    })
    
    if (isLoadMore) {
      favorites.value.push(...response.data.list)
    } else {
      favorites.value = response.data.list
    }
    
    hasMore.value = response.data.list.length === pageSize
    if (isLoadMore) {
      page.value++
    } else {
      page.value = 2
    }
  } catch (error: any) {
    const errorMessage = error?.message || '加载失败'
    Taro.showToast({
      title: errorMessage,
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    loadFavorites(true)
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

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
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

// 去探索页面
const goToExplore = () => {
  Taro.switchTab({
    url: '/pages/github/index'
  })
}

// 下拉刷新
const onPullDownRefresh = async () => {
  page.value = 1
  hasMore.value = true
  await loadFavorites()
  Taro.stopPullDownRefresh()
}

// 触底加载更多
useReachBottom(() => {
  loadMore()
})

// 页面显示时加载数据（tab页面不会卸载，需要用onShow）
useDidShow(() => {
  loadFavorites()
})

onMounted(() => {
  // 首次加载
  loadFavorites()
})
</script>

<style lang="scss">
.favorites-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.header {
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  padding: 40px 24px 32px 24px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-section {
    flex: 1;

    .title {
      font-size: 44px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
    }

    .subtitle {
      font-size: 28px;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .header-icon {
    .icon-heart {
      width: 40px;
      height: 36px;
      position: relative;

      &::before,
      &::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 32px;
        background: white;
        border-radius: 20px 20px 0 0;
        transform: rotate(-45deg);
        transform-origin: 0 100%;
      }

      &::after {
        left: 20px;
        transform: rotate(45deg);
        transform-origin: 100% 100%;
      }
    }
  }
}

.favorites-list {
  padding: 24px;
  padding-bottom: 100px;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.favorite-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.08);
  border: 1px solid rgba(0, 122, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #007aff, #5856d6);
  }

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 122, 255, 0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .project-info {
      flex: 1;
      margin-right: 16px;

      .project-name {
        font-size: 32px;
        font-weight: 700;
        color: #1d1d1f;
        line-height: 1.3;
        margin-bottom: 8px;
      }

      .project-desc {
        font-size: 26px;
        color: #666;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .favorite-badge {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #007aff, #5856d6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .badge-icon {
        .icon-heart-filled {
          width: 20px;
          height: 18px;
          position: relative;

          &::before,
          &::after {
            content: '';
            position: absolute;
            width: 10px;
            height: 16px;
            background: white;
            border-radius: 10px 10px 0 0;
            transform: rotate(-45deg);
            transform-origin: 0 100%;
          }

          &::after {
            left: 10px;
            transform: rotate(45deg);
            transform-origin: 100% 100%;
          }
        }
      }
    }
  }

  .project-stats {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 16px;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;

      .stat-icon {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon-star {
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 4px solid #007aff;
          position: relative;
          transform: rotate(35deg);

          &::before {
            content: '';
            position: absolute;
            left: -6px;
            top: -3px;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 4px solid #007aff;
            transform: rotate(-70deg);
          }

          &::after {
            content: '';
            position: absolute;
            left: -6px;
            top: 1px;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 4px solid #007aff;
            transform: rotate(70deg);
          }
        }

        .icon-code {
          width: 16px;
          height: 12px;
          position: relative;

          &::before,
          &::after {
            content: '';
            position: absolute;
            width: 6px;
            height: 2px;
            background: #666;
          }

          &::before {
            top: 2px;
            left: 0;
            transform: rotate(45deg);
          }

          &::after {
            top: 8px;
            left: 0;
            transform: rotate(-45deg);
          }
        }

        .icon-fork {
          width: 16px;
          height: 16px;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            width: 2px;
            height: 12px;
            background: #666;
            left: 7px;
            top: 2px;
          }

          &::after {
            content: '';
            position: absolute;
            width: 8px;
            height: 2px;
            background: #666;
            left: 4px;
            top: 6px;
          }
        }

        .icon-eye {
          width: 16px;
          height: 12px;
          position: relative;
          background: #666;
          border-radius: 8px;

          &::before {
            content: '';
            position: absolute;
            width: 6px;
            height: 6px;
            background: white;
            border-radius: 50%;
            left: 5px;
            top: 3px;
          }

          &::after {
            content: '';
            position: absolute;
            width: 3px;
            height: 3px;
            background: #666;
            border-radius: 50%;
            left: 6.5px;
            top: 4.5px;
          }
        }
      }

      .stat-value {
        font-size: 24px;
        color: #666;
        font-weight: 500;
      }
    }
  }

  .card-footer {
    .favorite-time {
      font-size: 22px;
      color: #999;
      font-style: italic;
    }
  }
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007aff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;

    &.small {
      width: 24px;
      height: 24px;
      border-width: 2px;
      margin-bottom: 8px;
    }
  }

  .loading-text {
    font-size: 28px;
    color: #666;
  }
}

.empty {
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    margin-bottom: 24px;
    display: flex;
    justify-content: center;

    .icon-star-empty {
      width: 80px;
      height: 80px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-left: 40px solid transparent;
        border-right: 40px solid transparent;
        border-bottom: 30px solid #ddd;
        transform: rotate(35deg);
        left: 0;
        top: 20px;
      }

      &::after {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-left: 40px solid transparent;
        border-right: 40px solid transparent;
        border-bottom: 30px solid #ddd;
        transform: rotate(-35deg);
        left: 0;
        top: 20px;
      }
    }
  }

  .empty-text {
    font-size: 36px;
    color: #333;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .empty-desc {
    font-size: 28px;
    color: #666;
    margin-bottom: 32px;
    line-height: 1.5;
  }

  .empty-action {
    display: inline-block;
    background: linear-gradient(135deg, #007aff, #5856d6);
    color: white;
    padding: 16px 32px;
    border-radius: 50px;
    font-size: 28px;
    font-weight: 500;

    &:active {
      opacity: 0.8;
    }
  }
}

.load-more {
  text-align: center;
  padding: 32px;
  margin: 20px;
  background: white;
  border-radius: 50px;
  color: #007aff;
  font-size: 28px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);

  &:active {
    opacity: 0.8;
  }
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: #666;
  font-size: 28px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
