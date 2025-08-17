<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view v-if="!isLoggedIn" class="login-section">
        <view class="avatar-container">
          <view class="avatar-placeholder">
            <view class="avatar-icon">
              <view class="icon-user"></view>
            </view>
          </view>
          <view class="avatar-ring"></view>
        </view>
        <view class="login-content">
          <view class="welcome-text">
            <view class="login-title">欢迎来到</view>
            <view class="app-name">肥猫猫项目分析</view>
          </view>
          <view class="login-subtitle">发现优质开源项目，收藏你的最爱</view>
          <button class="login-btn" @tap="handleLogin">
            <view class="btn-content">
              <text class="wechat-icon">💬</text>
              <text class="login-btn-text">微信登录</text>
            </view>
          </button>
        </view>
      </view>

      <view v-else class="user-section">
        <view class="user-header">
          <view class="user-avatar">
            <image v-if="userInfo?.avatarUrl" :src="userInfo.avatarUrl" class="avatar-img" />
            <view v-else class="avatar-placeholder">
              <view class="avatar-icon">
                <view class="icon-user"></view>
              </view>
            </view>
            <view class="online-indicator"></view>
          </view>

          <view class="user-info">
            <view class="username">{{ userInfo?.nickName || '微信用户' }}</view>
            <view class="user-desc">
              <text class="status-dot">●</text>
              <text>GitHub项目探索者</text>
            </view>
          </view>


        </view>

        <!-- 统计信息 -->
        <view class="stats-section">
          <view class="stat-item">
            <view class="stat-number">{{ favoriteCount }}</view>
            <view class="stat-label">收藏项目</view>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <view class="stat-number">{{ daysSinceJoin }}</view>
            <view class="stat-label">使用天数</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="group-title">更多</view>
        <view class="menu-item" @tap="showAbout">
          <view class="menu-icon-wrapper">
            <view class="menu-icon">
              <view class="icon-info"></view>
            </view>
          </view>
          <view class="menu-content">
            <view class="menu-title">关于我们</view>
            <view class="menu-desc">了解更多信息</view>
          </view>
          <view class="menu-arrow">
            <view class="icon-arrow-right"></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { getUserInfo, getFavorites, type UserInfo } from '../../api/index'
import { API_URLS } from '../../config/api'

const isLoggedIn = ref(false)
const userInfo = ref<UserInfo | null>(null)
const favoriteCount = ref(0)
const daysSinceJoin = ref(0)

// 检查登录状态
const checkLoginStatus = async () => {
  const token = Taro.getStorageSync('token')
  if (!token) {
    isLoggedIn.value = false
    return
  }

  try {
    const response = await getUserInfo()
    if (response.success) {
      isLoggedIn.value = true
      userInfo.value = response.data
      // 加载收藏数量
      loadFavoriteCount()
      // 计算使用天数
      calculateDaysSinceJoin()
    } else {
      isLoggedIn.value = false
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('userInfo')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    isLoggedIn.value = false
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userInfo')
  }
}

// 微信登录
const handleLogin = async () => {
  try {
    // 1. 获取微信登录code
    const res = await Taro.login()
    if (!res.code) {
      Taro.showToast({
        title: '获取登录凭证失败',
        icon: 'none'
      })
      return
    }

    // 2. 调用后端登录接口
    const response = await Taro.request({
      url: API_URLS.LOGIN,
      method: 'POST',
      data: {
        code: res.code,
        source: 'weapp'
      }
    })

    if (response.data.success) {
      // 存储token和用户信息
      Taro.setStorageSync('token', response.data.data.token)
      Taro.setStorageSync('userInfo', response.data.data.userInfo)

      isLoggedIn.value = true
      userInfo.value = response.data.data.userInfo

      // 加载收藏数量
      loadFavoriteCount()
      // 计算使用天数
      calculateDaysSinceJoin()

      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })
    } else {
      Taro.showToast({
        title: response.data.message || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    Taro.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  }
}



// 加载收藏数量
const loadFavoriteCount = async () => {
  try {
    const response = await getFavorites({
      page: 1,
      pageSize: 1 // 只需要获取总数
    })
    if (response.success) {
      favoriteCount.value = response.data.total || 0
    }
  } catch (error) {
    favoriteCount.value = 0
  }
}

// 计算使用天数
const calculateDaysSinceJoin = () => {
  if (userInfo.value?.create_time) {
    const joinDate = new Date(userInfo.value.create_time * 1000) // 时间戳转换
    const today = new Date()
    const diffTime = today.getTime() - joinDate.getTime() // 当前时间 - 注册时间
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) // 向下取整
    daysSinceJoin.value = Math.max(0, diffDays) // 确保不为负数
  } else {
    daysSinceJoin.value = 0
  }
}

// 跳转到收藏页面
const goToFavorites = () => {
  Taro.navigateTo({
    url: '/pages/favorites/index'
  })
}

// 显示关于信息
const showAbout = () => {
  Taro.showModal({
    title: '关于肥猫猫博客',
    content: '一个专注于技术分享的博客平台，收录优质的技术文章和GitHub项目。',
    showCancel: false
  })
}

// 页面显示时检查登录状态（tab页面不会卸载，需要用onShow）
useDidShow(() => {
  checkLoginStatus()
})

onMounted(() => {
  checkLoginStatus()
})
</script>

<style lang="scss">
.profile-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 0;
}

.user-card {
  background: white;
  border-radius: 16px;
  margin: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.login-section {
  padding: 48px 32px;
  text-align: center;

  .avatar-container {
    margin-bottom: 32px;

    .avatar-placeholder {
      width: 80px;
      height: 80px;
      background: #007aff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;

      .avatar-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon-user {
          width: 24px;
          height: 24px;
          border: 2px solid white;
          border-radius: 50% 50% 0 0;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            width: 12px;
            height: 12px;
            border: 2px solid white;
            border-radius: 50%;
            top: -8px;
            left: 3px;
          }

          &::after {
            content: '';
            position: absolute;
            width: 32px;
            height: 16px;
            border: 2px solid white;
            border-radius: 50px 50px 0 0;
            top: 16px;
            left: -6px;
          }
        }
      }
    }
  }

  .login-content {
    .welcome-text {
      margin-bottom: 16px;

      .login-title {
        font-size: 32px;
        color: #666;
        margin-bottom: 4px;
      }

      .app-name {
        font-size: 36px;
        font-weight: 600;
        color: #333;
      }
    }

    .login-subtitle {
      font-size: 28px;
      color: #666;
      margin-bottom: 40px;
      line-height: 1.5;
    }

    .login-btn {
      background: #007aff;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 0;
      font-size: 32px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:active {
        background: #0056d3;
      }

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 48px;

        .wechat-icon {
          font-size: 28px;
          margin-right: 12px;
        }

        .login-btn-text {
          color: white;
        }
      }
    }
  }
}

.user-section {
  padding: 0;

  .user-header {
    padding: 32px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;

    .user-avatar {
      position: relative;
      margin-right: 24px;

      .avatar-img {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .avatar-placeholder {
        width: 72px;
        height: 72px;
        background: #007aff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .avatar-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;

          .icon-user {
            width: 22px;
            height: 22px;
            border: 2px solid white;
            border-radius: 50% 50% 0 0;
            position: relative;

            &::before {
              content: '';
              position: absolute;
              width: 10px;
              height: 10px;
              border: 2px solid white;
              border-radius: 50%;
              top: -7px;
              left: 3px;
            }

            &::after {
              content: '';
              position: absolute;
              width: 28px;
              height: 14px;
              border: 2px solid white;
              border-radius: 50px 50px 0 0;
              top: 14px;
              left: -5px;
            }
          }
        }
      }

      .online-indicator {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        background: #52c41a;
        border: 3px solid white;
        border-radius: 50%;
      }
    }

    .user-info {
      flex: 1;

      .username {
        font-size: 36px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      .user-desc {
        display: flex;
        align-items: center;
        font-size: 28px;
        color: #666;

        .status-dot {
          color: #52c41a;
          margin-right: 8px;
          font-size: 16px;
        }
      }
    }

    .logout-btn {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 20px;
      padding: 12px 20px;

      .logout-text {
        font-size: 28px;
        color: #666;
      }

      &:active {
        background: #e9ecef;
      }
    }
  }

  .stats-section {
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: space-around;

    .stat-item {
      text-align: center;
      flex: 1;

      .stat-number {
        font-size: 40px;
        font-weight: 700;
        color: #007aff;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 24px;
        color: #666;
      }
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: #f0f0f0;
      margin: 0 16px;
    }
  }
}

.menu-section {
  margin: 0 20px 40px 20px;
}

.menu-group {
  background: white;
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .group-title {
    padding: 20px 24px 12px 24px;
    font-size: 28px;
    font-weight: 600;
    color: #333;
    background: #f8f9fa;
  }
}

.menu-item {
  padding: 24px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f8f9fa;
  }

  .menu-icon-wrapper {
    width: 56px;
    height: 56px;
    background: #007aff;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;

    .menu-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon-heart-outline {
        width: 20px;
        height: 18px;
        position: relative;

        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 14px;
          border: 2px solid white;
          border-radius: 10px 10px 0 0;
          transform: rotate(-45deg);
          transform-origin: 0 100%;
        }

        &::after {
          left: 8px;
          transform: rotate(45deg);
          transform-origin: 100% 100%;
        }
      }

      .icon-info {
        width: 20px;
        height: 20px;
        border: 2px solid white;
        border-radius: 50%;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          width: 2px;
          height: 8px;
          background: white;
          left: 7px;
          top: 8px;
        }

        &::after {
          content: '';
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          left: 7px;
          top: 4px;
        }
      }
    }
  }

  .menu-content {
    flex: 1;

    .menu-title {
      font-size: 32px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .menu-desc {
      font-size: 26px;
      color: #666;
    }
  }

  .menu-arrow {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon-arrow-right {
      width: 8px;
      height: 8px;
      border-top: 2px solid #ccc;
      border-right: 2px solid #ccc;
      transform: rotate(45deg);
    }
  }
}


</style>
