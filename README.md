# Collection Taro 小程序

基于 Taro Vue3 开发的简约博客小程序，用于展示肥猫猫博客的文章和 GitHub 项目。

## 功能特性

- 📱 **简约设计**：清爽的界面设计，专注内容阅读
- 📝 **文章浏览**：支持博客文章和 GitHub 项目展示
- 🔍 **分类筛选**：按时间周期筛选热门 GitHub 项目
- 📊 **项目评分**：显示 AI 分析的项目商业价值评分
- 🏷️ **标签系统**：展示项目技术标签和分类
- 📱 **响应式**：适配各种小程序平台

## 技术栈

- **框架**：Taro 3.6.25
- **前端**：Vue 3 + TypeScript
- **样式**：SCSS
- **构建**：Webpack 5
- **平台**：微信小程序、支付宝小程序等

## 项目结构

```
collection-taro/
├── src/
│   ├── pages/           # 页面
│   │   ├── index/       # 首页 - 文章列表
│   │   ├── github/      # GitHub项目页
│   │   └── detail/      # 详情页
│   ├── api/             # API接口
│   ├── utils/           # 工具函数
│   ├── app.config.ts    # 应用配置
│   ├── app.tsx          # 应用入口
│   └── app.scss         # 全局样式
├── config/              # 构建配置
└── project.config.json  # 小程序配置
```

## 开发指南

### 安装依赖

```bash
cd collection-taro
npm install
```

### 开发模式

```bash
# 微信小程序
npm run dev:weapp

# 支付宝小程序
npm run dev:alipay

# H5
npm run dev:h5
```

### 构建发布

```bash
# 微信小程序
npm run build:weapp

# 支付宝小程序
npm run build:alipay

# H5
npm run build:h5
```

## 页面说明

### 首页 (`pages/index`)
- 展示最新的博客文章
- 支持分页加载
- 点击跳转到详情页

### GitHub页 (`pages/github`)
- 展示热门 GitHub 项目
- 支持按时间周期筛选（今日/本周/本月）
- 显示项目评分、Star数、Fork数等信息

### 详情页 (`pages/detail`)
- 展示文章或项目的详细内容
- 支持 Markdown 格式渲染
- GitHub 项目可复制链接

## API 接口

小程序通过以下接口与后端通信：

- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `GET /api/articles/github` - 获取 GitHub 项目列表
- `GET /api/articles/github/:fullName` - 获取 GitHub 项目详情

## 配置说明

### 后端地址配置

在 `src/utils/request.ts` 中修改 `BASE_URL`：

```typescript
const BASE_URL = 'http://localhost:7001'  // 开发环境
// const BASE_URL = 'https://your-api.com'  // 生产环境
```

### 小程序配置

在 `project.config.json` 中配置小程序 AppID：

```json
{
  "appid": "your-miniprogram-appid"
}
```

## 部署说明

1. 构建项目：`npm run build:weapp`
2. 使用微信开发者工具打开 `dist` 目录
3. 预览和发布到微信小程序平台

## 注意事项

- 确保后端服务正常运行
- 小程序需要配置合法域名
- 开发时可以在开发者工具中关闭域名校验
