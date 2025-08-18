<template>
  <view class="qrcode-page">
    <!-- 头部 -->
    <view class="header">
      <view class="title">扫码加入AI编辑器白嫖群</view>
    </view>

    <!-- 二维码展示 -->
    <view class="qrcode-container">
      <view class="qrcode-wrapper">
        <image
          class="qrcode-image"
          :src="qrCodeImage"
          mode="aspectFit"
          :show-menu-by-longpress="true"
          @error="onImageError"
          @longpress="saveImage"
        />
      </view>
      
      <view class="tips">
        <text class="tips-highlight">请注明来源</text>
        <text class="tips-normal">，群主拉你入群</text>
      </view>
      
      <view class="description">
        <view class="desc-item">免费AI编辑器资源分享</view>
        <view class="desc-item">最新AI工具推荐</view>
        <view class="desc-item">技术交流与讨论</view>
      </view>
    </view>

    <!-- 保存提示 -->
    <view class="save-tips">
      <text>长按二维码保存到相册</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'

// 二维码图片路径
const qrCodeImage = ref(require('../../assets/images/wechat.png'))

// 图片加载错误处理
const onImageError = () => {
  Taro.showToast({
    title: '二维码加载失败',
    icon: 'none'
  })
}

// 保存图片到相册
const saveImage = () => {
  Taro.saveImageToPhotosAlbum({
    filePath: qrCodeImage.value,
    success: () => {
      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },
    fail: () => {
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    }
  })
}
</script>

<style lang="scss">
.qrcode-page {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 40px;

  .title {
    font-size: 44px;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
}

.qrcode-container {
  background: white;
  border-radius: 24px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 650px;
  width: 100%;
}

.qrcode-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;

  .qrcode-image {
    width: 500px;
    height: 500px;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.tips {
  font-size: 36px;
  margin-bottom: 24px;
  font-weight: 600;

  .tips-highlight {
    color: #ff6b6b;
    font-weight: 700;
  }

  .tips-normal {
    color: #333;
  }
}

.description {
  text-align: left;

  .desc-item {
    font-size: 28px;
    color: #666;
    margin-bottom: 12px;
    padding-left: 16px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      background: #007aff;
      border-radius: 50%;
    }
  }
}

.save-tips {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);

  text {
    color: white;
    font-size: 26px;
  }
}
</style>
