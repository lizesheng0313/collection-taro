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
            <view class="app-name">FMM项目分析</view>
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
        
        <!-- AI编辑器白嫖群 -->
        <view class="menu-item" @tap="goToAIGroup">
          <view class="menu-icon-wrapper">
            <view class="menu-icon ai-icon">
              <view class="icon-ai">🤖</view>
            </view>
          </view>
          <view class="menu-content">
            <view class="menu-title">加入AI编辑器白嫖群</view>
          </view>
          <view class="menu-arrow">
            <view class="icon-arrow-right"></view>
          </view>
        </view>
        
        <!-- 关于我们 -->
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
import { ref, onMounted, onUnmounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { getUserInfo, getFavorites, manualLogin, validateToken, type UserInfo } from '../../api/index'

const isLoggedIn = ref(false)
const userInfo = ref<UserInfo | null>(null)
const favoriteCount = ref(0)
const daysSinceJoin = ref(0)

// AI群广告相关
const showQRCode = ref(false)
const loading = ref(false)
const qrCodeImage = ref('/assets/images/wechat.png')
let videoAd: any = null

// 检查登录状态
const checkLoginStatus = async () => {
  const token = Taro.getStorageSync('token')
  if (!token) {
    isLoggedIn.value = false
    return
  }

  try {
    const isValid = await validateToken()
    if (isValid) {
      const response = await getUserInfo()
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
    isLoggedIn.value = false
    Taro.removeStorageSync('token')
    Taro.removeStorageSync('userInfo')
  }
}

// 微信登录
const handleLogin = async () => {
  try {
    const loginData = await manualLogin()

    isLoggedIn.value = true
    userInfo.value = loginData.userInfo

    // 加载收藏数量
    loadFavoriteCount()
    // 计算使用天数
    calculateDaysSinceJoin()

    Taro.showToast({
      title: '登录成功',
      icon: 'success'
    })
  } catch (error: any) {
    Taro.showToast({
      title: error.message || '登录失败，请重试',
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
    const joinDate = new Date(userInfo.value.create_time) // 后端存储的已经是毫秒时间戳，不需要乘以1000
    const today = new Date()
    const diffTime = today.getTime() - joinDate.getTime() // 当前时间 - 注册时间
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) // 向下取整
    daysSinceJoin.value = Math.max(0, diffDays) // 确保不为负数
  } else {
    daysSinceJoin.value = 0
  }
}

// 初始化激励视频广告
const initRewardedVideoAd = () => {
  // 若在开发者工具中无法预览广告，请切换开发者工具中的基础库版本
  if (wx.createRewardedVideoAd) {
    videoAd = wx.createRewardedVideoAd({
      adUnitId: 'adunit-1f3addeb7d7c3597'
    })

    videoAd.onLoad(() => {
      console.log('激励视频广告加载成功')
      loading.value = false
    })

    videoAd.onError((err: any) => {
      console.error('激励视频广告加载失败', err)
      loading.value = false
      Taro.showToast({
        title: '广告加载失败，请重试',
        icon: 'none'
      })
    })

    videoAd.onClose((res: any) => {
      if (res && res.isEnded) {
        // 用户观看完整广告，跳转到二维码页面
        Taro.navigateTo({
          url: '/pages/qrcode/index'
        })
        Taro.showToast({
          title: '感谢观看！',
          icon: 'success'
        })
      } else {
        // 用户中途退出
        Taro.showToast({
          title: '请观看完整广告',
          icon: 'none'
        })
      }
    })
  } else {
    console.warn('当前环境不支持激励视频广告')
    // 开发环境直接跳转到二维码页面
    if (process.env.NODE_ENV === 'development') {
      Taro.navigateTo({
        url: '/pages/qrcode/index'
      })
    }
  }
}

// 显示激励视频广告
const showRewardedVideoAd = () => {
  if (!videoAd) {
    initRewardedVideoAd()
    return
  }

  loading.value = true

  videoAd.show().catch(() => {
    // 失败重试
    loading.value = true
    videoAd.load()
      .then(() => {
        loading.value = false
        return videoAd.show()
      })
      .catch((err: any) => {
        console.error('激励视频广告显示失败', err)
        loading.value = false
        Taro.showToast({
          title: '广告显示失败，请重试',
          icon: 'none'
        })
      })
  })
}

// 点击AI群菜单
const goToAIGroup = () => {
  console.log('点击了AI群菜单')

  Taro.showModal({
    title: '加入AI编辑器白嫖群',
    content: '观看完整广告即可获取群二维码\n\n• 免费AI编辑器资源分享\n• 最新AI工具推荐\n• 技术交流与讨论',
    confirmText: '观看广告',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        showRewardedVideoAd()
      }
    }
  })
}

// 显示关于信息
const showAbout = () => {
  Taro.showModal({
    title: '关于FMM博客',
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
  initRewardedVideoAd()
})

onUnmounted(() => {
  if (videoAd) {
    videoAd.destroy()
  }
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
    position: relative;
    display: inline-block;
    margin-bottom: 32px;

    .avatar-placeholder {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;

      .avatar-icon {
        .icon-user {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            width: 24px;
            height: 24px;
            background: #667eea;
            border-radius: 50%;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 20px;
            background: #667eea;
            border-radius: 20px 20px 0 0;
          }
        }
      }
    }

    .avatar-ring {
      position: absolute;
      top: -8px;
      left: -8px;
      right: -8px;
      bottom: -8px;
      border: 3px solid rgba(102, 126, 234, 0.3);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
  }

  .login-content {
    .welcome-text {
      margin-bottom: 24px;

      .login-title {
        font-size: 32px;
        color: #666;
        margin-bottom: 8px;
      }

      .app-name {
        font-size: 48px;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .login-subtitle {
      font-size: 28px;
      color: #999;
      margin-bottom: 48px;
      line-height: 1.5;
    }

    .login-btn {
      width: 100%;
      background: linear-gradient(135deg, #007aff, #0056d3);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 32px;
      font-size: 32px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(7, 193, 96, 0.4);
      transition: all 0.3s ease;

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;

        .wechat-icon {
          font-size: 36px;
          margin-right: 12px;
        }
      }

      &:active {
        transform: translateY(2px);
        box-shadow: 0 2px 8px rgba(7, 193, 96, 0.4);
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.user-section {
  .user-header {
    display: flex;
    align-items: center;
    padding: 32px;
    border-bottom: 1px solid #f0f0f0;

    .user-avatar {
      position: relative;
      margin-right: 24px;

      .avatar-img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 3px solid #f0f0f0;
      }

      .avatar-placeholder {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .avatar-icon {
          .icon-user {
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 50%;
            position: relative;

            &::before {
              content: '';
              position: absolute;
              top: 8px;
              left: 50%;
              transform: translateX(-50%);
              width: 16px;
              height: 16px;
              background: #667eea;
              border-radius: 50%;
            }

            &::after {
              content: '';
              position: absolute;
              bottom: 4px;
              left: 50%;
              transform: translateX(-50%);
              width: 28px;
              height: 14px;
              background: #667eea;
              border-radius: 14px 14px 0 0;
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
        background: #007aff;
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
  display: flex;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f8f9fa;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f8f9fa;
  }

  .menu-icon-wrapper {
    margin-right: 20px;

    .menu-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #007aff, #0056d3);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      &.ai-icon {
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      }

      .icon-info, .icon-ai {
        font-size: 24px;
        color: white;
      }

      .icon-info::before {
        content: 'ℹ️';
      }
    }
  }

  .menu-content {
    flex: 1;

    .menu-title {
      font-size: 32px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .menu-desc {
      font-size: 24px;
      color: #999;
    }
  }

  .menu-arrow {
    .icon-arrow-right {
      width: 0;
      height: 0;
      border-left: 8px solid #ccc;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
    }
  }
}
</style>
