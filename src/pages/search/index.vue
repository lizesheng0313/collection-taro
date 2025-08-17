<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-header">
      <view class="search-input-wrapper">
        <view class="search-icon">
          <view class="icon-search"></view>
        </view>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索文章和项目..."
          confirm-type="search"
          @confirm="handleSearch"
          @input="onInput"
          :focus="!hasSearched"
        />
        <view v-if="searchKeyword" class="clear-btn" @tap="clearSearch">
          <view class="icon-close"></view>
        </view>
      </view>
      <view class="cancel-btn" @tap="goBack">取消</view>
    </view>

    <!-- 搜索建议 -->
    <view v-if="!hasSearched && searchSuggestions.length > 0" class="suggestions">
      <view class="suggestions-title">搜索建议</view>
      <view
        v-for="suggestion in searchSuggestions"
        :key="suggestion"
        class="suggestion-item"
        @tap="searchSuggestion(suggestion)"
      >
        <view class="suggestion-icon">
          <view class="icon-search"></view>
        </view>
        <text class="suggestion-text">{{ suggestion }}</text>
      </view>
    </view>

    <!-- 搜索历史 -->
    <view v-if="!hasSearched && searchHistory.length > 0" class="history">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <text class="clear-history" @tap="clearHistory">清空</text>
      </view>
      <view class="history-list">
        <view
          v-for="item in searchHistory"
          :key="item"
          class="history-item"
          @tap="searchHistoryItem(item)"
        >
          <view class="history-icon">
            <view class="icon-history"></view>
          </view>
          <text class="history-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="hasSearched" class="search-results">
      <view class="results-header">
        <text class="results-count">找到 {{ totalCount }} 个结果</text>
      </view>

      <view v-if="loading && results.length === 0" class="loading">
        搜索中...
      </view>

      <view v-else-if="results.length === 0" class="empty">
        <view class="empty-icon">
          <view class="icon-search-empty"></view>
        </view>
        <view class="empty-text">没有找到相关内容</view>
        <view class="empty-tip">试试其他关键词</view>
      </view>

      <view v-else class="results-list">
        <view
          v-for="item in results"
          :key="item.id"
          class="result-item"
          @tap="goToDetail(item)"
        >
          <view class="result-header">
            <view class="result-title">{{ item.title }}</view>
            <view class="result-type" :class="item.article_type">
              {{ item.article_type === 'blog' ? '博客' : 'GitHub' }}
            </view>
          </view>

          <view class="result-summary" v-if="item.summary || item.translated_description">
            {{ item.summary || item.translated_description }}
          </view>

          <view class="result-meta">
            <view class="meta-item">
              <view class="meta-icon">
                <view class="icon-eye"></view>
              </view>
              <text class="meta-text">{{ item.read_count || 0 }}</text>
            </view>
            <view class="meta-item" v-if="item.stars_count">
              <view class="meta-icon">
                <view class="icon-star"></view>
              </view>
              <text class="meta-text">{{ item.stars_count }}</text>
            </view>
            <view class="meta-item" v-if="item.programming_language">
              <view class="meta-icon">
                <view class="icon-code"></view>
              </view>
              <text class="meta-text">{{ item.programming_language }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && !loading" class="load-more" @tap="loadMore">
        点击加载更多
      </view>
      <view v-if="loading && results.length > 0" class="loading-more">
        加载中...
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { searchArticles, type Article } from '../../api/index'

const searchKeyword = ref('')
const hasSearched = ref(false)
const results = ref<Article[]>([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 10
const totalCount = ref(0)

// 搜索历史
const searchHistory = ref<string[]>([])
// 搜索建议
const searchSuggestions = ref<string[]>([
  '前端框架',
  '后端开发',
  '移动开发',
  '数据库',
  '开发工具',
  '项目管理'
])

// 输入事件
const onInput = (e: any) => {
  searchKeyword.value = e.detail.value

  // 如果输入框被清空，清除搜索结果
  if (!searchKeyword.value.trim()) {
    clearSearch()
  }
}

// 执行搜索
const handleSearch = async (isLoadMore = false) => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    // 搜索关键词为空时，清空搜索结果并返回搜索建议页面
    clearSearch()
    return
  }

  if (!isLoadMore) {
    hasSearched.value = true
    page.value = 1
    results.value = []
    
    // 保存搜索历史
    saveSearchHistory(keyword)
  }

  if (loading.value) return
  loading.value = true

  try {
    const response = await searchArticles({
      keyword,
      page: page.value,
      pageSize
    })

    if (isLoadMore) {
      results.value.push(...response.data.list)
    } else {
      results.value = response.data.list
      totalCount.value = response.data.total
    }

    hasMore.value = response.data.list.length === pageSize
    if (isLoadMore) {
      page.value++
    } else {
      page.value = 2
    }

  } catch (error) {
    console.error('搜索失败:', error)
    Taro.showToast({
      title: '搜索失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 搜索建议
const searchSuggestion = (suggestion: string) => {
  searchKeyword.value = suggestion
  handleSearch()
}

// 搜索历史项
const searchHistoryItem = (item: string) => {
  searchKeyword.value = item
  handleSearch()
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  hasSearched.value = false
  results.value = []
  totalCount.value = 0
  page.value = 1
  hasMore.value = true
}

// 返回
const goBack = () => {
  Taro.navigateBack()
}

// 加载更多
const loadMore = () => {
  if (hasMore.value && !loading.value) {
    handleSearch(true)
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

// 保存搜索历史
const saveSearchHistory = (keyword: string) => {
  const history = [...searchHistory.value]
  const index = history.indexOf(keyword)
  
  if (index > -1) {
    history.splice(index, 1)
  }
  
  history.unshift(keyword)
  
  // 最多保存10条历史记录
  if (history.length > 10) {
    history.splice(10)
  }
  
  searchHistory.value = history
  
  // 保存到本地存储
  Taro.setStorageSync('searchHistory', history)
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  Taro.removeStorageSync('searchHistory')
}

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = Taro.getStorageSync('searchHistory')
    if (history && Array.isArray(history)) {
      searchHistory.value = history
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

onMounted(() => {
  loadSearchHistory()
})
</script>

<style lang="scss">
.search-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 20px;
  padding-top: calc(60px + env(safe-area-inset-top));
  background: white;
  border-bottom: 1px solid #eee;

  .search-input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;

    .search-icon {
      position: absolute;
      left: 20px;
      z-index: 2;

      .icon-search {
        width: 20px;
        height: 20px;
        border: 2px solid #999;
        border-radius: 50%;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 2px;
          background: #999;
          transform: rotate(45deg);
          top: 16px;
          left: 14px;
        }
      }
    }

    .search-input {
      width: 100%;
      padding: 16px 60px 16px 60px;
      background: #f8f9fa;
      border-radius: 50px;
      font-size: 32px;
      border: 2px solid #e9ecef;
      outline: none;
      transition: all 0.3s ease;

      &:focus {
        border-color: #007aff;
        background: white;
      }
    }

    .clear-btn {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ccc;
      border-radius: 50%;
      transition: all 0.3s ease;

      &:active {
        background: #999;
      }

      .icon-close {
        width: 16px;
        height: 16px;
        position: relative;

        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 2px;
          background: white;
          top: 7px;
          left: 0;
        }

        &::before {
          transform: rotate(45deg);
        }

        &::after {
          transform: rotate(-45deg);
        }
      }
    }
  }

  .cancel-btn {
    margin-left: 16px;
    padding: 16px;
    color: #007aff;
    font-size: 32px;
    font-weight: 500;
  }
}

.suggestions, .history {
  background: white;
  margin: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;

  .suggestions-title, .history-title {
    padding: 20px 24px 16px 24px;
    font-size: 28px;
    color: #666;
    font-weight: 500;
    border-bottom: 1px solid #f0f0f0;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px 16px 24px;
    border-bottom: 1px solid #f0f0f0;

    .history-title {
      font-size: 28px;
      color: #666;
      font-weight: 500;
      padding: 0;
      border: none;
    }

    .clear-history {
      color: #007aff;
      font-size: 26px;
      font-weight: 500;
    }
  }
}

.suggestion-item, .history-item {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: #f8f9fa;
  }

  .suggestion-icon, .history-icon {
    margin-right: 16px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon-search {
      width: 16px;
      height: 16px;
      border: 2px solid #007aff;
      border-radius: 50%;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        width: 6px;
        height: 2px;
        background: #007aff;
        transform: rotate(45deg);
        top: 12px;
        left: 10px;
      }
    }

    .icon-history {
      width: 20px;
      height: 20px;
      border: 2px solid #666;
      border-radius: 50%;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 6px;
        height: 6px;
        border-top: 2px solid #666;
        border-right: 2px solid #666;
        top: 4px;
        left: 6px;
        transform-origin: center;
      }
    }
  }

  .suggestion-text, .history-text {
    font-size: 30px;
    color: #333;
    flex: 1;
    font-weight: 400;
  }
}

.search-results {
  margin-top: 20rpx;
  
  .results-header {
    background-color: #fff;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
    
    .results-count {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .results-list {
    background-color: #fff;
  }
  
  .result-item {
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20rpx;
      
      .result-title {
        flex: 1;
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        line-height: 1.4;
        margin-right: 20rpx;
      }
      
      .result-type {
        padding: 6rpx 12rpx;
        border-radius: 16rpx;
        font-size: 20rpx;
        color: #fff;
        
        &.blog {
          background-color: #007aff;
        }
        
        &.github_project {
          background-color: #28a745;
        }
      }
    }
    
    .result-summary {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 20rpx;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .result-meta {
      display: flex;
      align-items: center;
      font-size: 22rpx;
      color: #999;
      
      .meta-item {
        display: flex;
        align-items: center;
        margin-right: 24px;

        .meta-icon {
          margin-right: 6px;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;

          .icon-eye {
            width: 16px;
            height: 10px;
            border: 2px solid #999;
            border-radius: 50%;
            position: relative;

            &::before {
              content: '';
              position: absolute;
              width: 6px;
              height: 6px;
              background: #999;
              border-radius: 50%;
              top: 0px;
              left: 3px;
            }
          }

          .icon-star {
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 6px solid #007aff;
            position: relative;
            transform: rotate(35deg);

            &::before {
              content: '';
              position: absolute;
              left: -8px;
              top: -4px;
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-bottom: 6px solid #007aff;
              transform: rotate(-70deg);
            }

            &::after {
              content: '';
              position: absolute;
              left: -8px;
              top: 2px;
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-bottom: 6px solid #007aff;
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
        }

        .meta-text {
          font-size: 22px;
          color: #666;
        }
      }
    }
  }
}

.loading, .empty {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.loading {
  font-size: 28px;
}

.empty {
  .empty-icon {
    margin-bottom: 24px;
    display: flex;
    justify-content: center;

    .icon-search-empty {
      width: 60px;
      height: 60px;
      border: 4px solid #ddd;
      border-radius: 50%;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 4px;
        background: #ddd;
        transform: rotate(45deg);
        top: 48px;
        left: 42px;
      }

      &::before {
        content: '';
        position: absolute;
        width: 20px;
        height: 4px;
        background: #ddd;
        transform: rotate(-45deg);
        top: 24px;
        left: 20px;
      }
    }
  }

  .empty-text {
    font-size: 32px;
    color: #666;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .empty-tip {
    font-size: 26px;
    color: #999;
  }
}

.load-more, .loading-more {
  text-align: center;
  padding: 40rpx 0;
  color: #007aff;
  font-size: 28rpx;
  background-color: #fff;
  margin-top: 20rpx;
}

.loading-more {
  color: #999;
}
</style>
