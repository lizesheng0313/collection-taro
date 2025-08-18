<template>
  <view class="ai-group-page">
    <!-- 页面头部 -->
    <view class="header-section">
      <view class="header-title">加入AI编辑器白嫖群</view>
      <view class="header-desc">观看广告后即可查看群二维码</view>
    </view>

    <!-- 广告按钮 -->
    <view v-if="!showQRCode" class="ad-section">
      <view class="ad-tips">
        <text class="tips-icon">💡</text>
        <text class="tips-text">观看完整广告后即可获取群二维码</text>
      </view>
      <button class="watch-ad-btn" @tap="showRewardedVideoAd">
        <text class="btn-icon">📺</text>
        <text class="btn-text">观看广告获取二维码</text>
      </button>
    </view>

    <!-- 二维码展示 -->
    <view v-if="showQRCode" class="qr-section">
      <view class="qr-container">
        <view class="qr-title">扫码加入AI编辑器白嫖群</view>
        <view class="qr-image-wrapper">
          <image
            class="qr-image"
            :src="qrCodeImage"
            mode="aspectFit"
            @error="onImageError"
          />
        </view>
        <view class="qr-tips">
          <text class="tips-highlight">请注明来源</text>
          <text class="tips-normal">，群主拉你入群</text>
        </view>
        <view class="qr-desc">
          <text>• 免费AI编辑器资源分享</text>
          <text>• 最新AI工具推荐</text>
          <text>• 技术交流与讨论</text>
        </view>
      </view>

      <!-- 重新观看广告按钮 -->
      <view class="retry-section">
        <button class="retry-btn" @tap="showRewardedVideoAd">
          <text>重新观看广告</text>
        </button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-section">
      <text class="loading-text">广告加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'

const showQRCode = ref(false)
const loading = ref(false)
const qrCodeImage = ref('/assets/images/wechat.png') // 使用本地微信二维码图片

let videoAd: any = null

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
        // 用户观看完整广告
        showQRCode.value = true
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
    // 开发环境直接显示二维码
    if (process.env.NODE_ENV === 'development') {
      showQRCode.value = true
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

// 图片加载错误处理
const onImageError = () => {
  Taro.showToast({
    title: '二维码加载失败',
    icon: 'none'
  })
}

onMounted(() => {
  initRewardedVideoAd()
})

onUnmounted(() => {
  if (videoAd) {
    videoAd.destroy()
  }
})
</script>

<style lang="scss">
.ai-group-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 60px;

  .header-title {
    font-size: 48px;
    font-weight: 700;
    color: white;
    margin-bottom: 16px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .header-desc {
    font-size: 28px;
    color: rgba(255, 255, 255, 0.9);
  }
}

.ad-section {
  background: white;
  border-radius: 24px;
  padding: 48px 32px;
  margin-bottom: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  .ad-tips {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
    padding: 24px;
    background: #f8f9fa;
    border-radius: 16px;

    .tips-icon {
      font-size: 32px;
      margin-right: 12px;
    }

    .tips-text {
      font-size: 28px;
      color: #666;
    }
  }

  .watch-ad-btn {
    width: 100%;
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 32px;
    font-size: 32px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
    transition: all 0.3s ease;

    .btn-icon {
      font-size: 36px;
      margin-right: 12px;
    }

    &:active {
      transform: translateY(2px);
      box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
    }
  }
}

.qr-section {
  .qr-container {
    background: white;
    border-radius: 24px;
    padding: 48px 32px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    margin-bottom: 32px;

    .qr-title {
      font-size: 36px;
      font-weight: 600;
      color: #333;
      margin-bottom: 32px;
    }

    .qr-image-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 32px;

      .qr-image {
        width: 400px;
        height: 400px;
        border-radius: 16px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }
    }

    .qr-tips {
      font-size: 32px;
      margin-bottom: 32px;

      .tips-highlight {
        color: #ff6b6b;
        font-weight: 600;
      }

      .tips-normal {
        color: #666;
      }
    }

    .qr-desc {
      text-align: left;

      text {
        display: block;
        font-size: 28px;
        color: #666;
        margin-bottom: 12px;
        padding-left: 16px;

        &:before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #007aff;
          border-radius: 50%;
          margin-right: 12px;
          vertical-align: middle;
        }
      }
    }
  }

  .retry-section {
    text-align: center;

    .retry-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50px;
      padding: 24px 48px;
      font-size: 28px;
      backdrop-filter: blur(10px);

      &:active {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.loading-section {
  text-align: center;
  padding: 80px 20px;

  .loading-text {
    font-size: 32px;
    color: white;
  }
}
</style>