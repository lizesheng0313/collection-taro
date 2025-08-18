<template>
  <view class="search-page">
    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索文章和项目..."
          confirm-type="search"
          @confirm="handleSearch"
          focus
        />
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-content">
      <!-- 加载中 -->
      <view v-if="loading" class="loading">
        <text>搜索中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="hasSearched && results.length === 0" class="empty">
        <text>没有找到相关内容</text>
      </view>

      <!-- 结果列表 -->
      <view v-else-if="results.length > 0" class="results-list">
        <view
          v-for="item in results"
          :key="item.id"
          class="result-item"
          @tap="goToDetail(item)"
        >
          <view class="item-title">{{ item.title }}</view>
          <view class="item-desc">{{ item.translated_description || item.original_description }}</view>
          <view class="item-stats">
            <text v-if="item.stars_count">⭐ {{ item.stars_count }}</text>
            <text v-if="item.forks_count">🍴 {{ item.forks_count }}</text>
          </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading && results.length > 0" class="loading-more">
          <text>加载中...</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useReachBottom } from '@tarojs/taro'
import { searchArticles, type Article } from '../../api/index'

const keyword = ref('')
const results = ref<Article[]>([])
const loading = ref(false)
const hasSearched = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 20

// 搜索函数
const handleSearch = async () => {
  const searchKeyword = keyword.value.trim()
  if (!searchKeyword) {
    Taro.showToast({
      title: '请输入搜索关键词',
      icon: 'none'
    })
    return
  }

  loading.value = true
  hasSearched.value = true
  results.value = []
  page.value = 1
  hasMore.value = true

  try {
    const response = await searchArticles({
      keyword: searchKeyword,
      page: 1,
      pageSize
    })

    if (response.success) {
      results.value = response.data.list || []
      hasMore.value = response.data.list.length === pageSize
      page.value = 2
    } else {
      Taro.showToast({
        title: '搜索失败',
        icon: 'none'
      })
    }
  } catch (error) {
    Taro.showToast({
      title: '搜索失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = async () => {
  if (loading.value || !hasMore.value) return

  const searchKeyword = keyword.value.trim()
  if (!searchKeyword) return

  loading.value = true

  try {
    const response = await searchArticles({
      keyword: searchKeyword,
      page: page.value,
      pageSize
    })

    if (response.success) {
      results.value.push(...response.data.list)
      hasMore.value = response.data.list.length === pageSize
      page.value++
    }
  } catch (error) {
    Taro.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 跳转到详情页
const goToDetail = (item: Article) => {
  if (item.article_type === 'github_project' && item.github_full_name) {
    Taro.navigateTo({
      url: `/pages/detail/index?type=github&fullName=${encodeURIComponent(item.github_full_name)}`
    })
  } else {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${item.id}`
    })
  }
}

// 滑动到底部自动加载
useReachBottom(() => {
  loadMore()
})
</script>

<style lang="scss">
.search-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 搜索框样式已移至全局样式 app.scss */

.search-content {
  padding: 20px;
}

.loading, .empty {
  text-align: center;
  padding: 80px 20px;
  color: #999;
  font-size: 32px;
}

.results-list {
  .result-item {
    background: white;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .item-title {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-desc {
      font-size: 28px;
      color: #666;
      margin-bottom: 16px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-stats {
      display: flex;
      gap: 24px;
      font-size: 24px;
      color: #999;
    }
  }
}

.loading-more {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 28px;
}
</style>
