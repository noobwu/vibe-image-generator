# 社交媒体图像生成器

基于 React + Ant Design 6.1.4 开发的社交媒体图像生成器，支持多端适配（手机端、电脑端）。

## 功能特点

- **文本输入**：用户可以输入任意文本描述
- **提示词生成**：通过 LLM API 将用户输入转换为优化的图像生成提示词
- **图像生成**：调用图像生成 API 生成高清图像
- **图像下载**：支持一键下载生成的图像到本地
- **API 配置**：可自定义 LLM 和图像生成 API 的配置
- **调试模式**：支持 VConsole 调试，可查看 API 请求日志
- **响应式设计**：完美适配手机端和电脑端

## 技术栈

- **框架**：React 18.3.1
- **UI 组件库**：Ant Design 6.1.4
- **路由**：React Router DOM 7.1.1
- **构建工具**：Vite 6.0.5
- **状态管理**：React Hooks + LocalStorage
- **调试工具**：VConsole

## 安装和运行

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

3. 构建生产版本：

```bash
npm run build
```

## API 配置

在使用前，请在设置页面配置以下 API 参数：

### LLM API 设置
- **API 地址**：用于提示词生成的 LLM 服务地址
  - 默认：`https://api.siliconflow.cn/v1/chat/completions`
- **API Key**：LLM 服务访问密钥
- **模型名称**：使用的 LLM 模型名称
  - 默认：`Qwen/Qwen3-8B`
- **系统提示词**：指导 LLM 如何生成提示词的系统指令

### 图像生成 API 设置
- **API 地址**：用于图像生成的服务地址
  - 默认：`https://api.siliconflow.cn/v1/images/generations`
- **API Key**：图像生成服务访问密钥
- **模型名称**：使用的图像生成模型名称
  - 默认：`Kwai-Kolors/Kolors`

### 调试模式设置
- **调试模式**：开启后可在 VConsole 控制台查看 API 请求和响应日志
  - 开启方式：在设置页面开启"调试模式"开关
  - 查看日志：点击页面右下角的 VConsole 按钮打开控制台
  - 日志内容：包含 API 请求参数、响应数据、错误信息等

## 交互流程

```
用户输入文本 → 生成优化提示词 → 调用API生成图像 → 显示预览图 → 用户操作（下载/重试）
```

## 项目结构

```
├── src/
│   ├── components/
│   │   └── Layout/
│   │       └── MainLayout.jsx      # 主布局组件
│   ├── pages/
│   │   ├── HomePage.jsx            # 主页面（图像生成）
│   │   └── SettingsPage.jsx        # 设置页面（API配置）
│   ├── App.jsx                     # 应用根组件
│   ├── main.jsx                    # 应用入口
│   └── index.css                   # 全局样式
├── index.html                      # HTML 模板
├── package.json                    # 项目依赖配置
└── vite.config.js                  # Vite 配置
```

## 响应式设计

- **手机端**（< 768px）：使用抽屉式导航，单列布局
- **电脑端**（≥ 768px）：使用侧边栏导航，双列布局

## 注意事项

- 需要有有效的 LLM 和图像生成 API 服务才能正常使用
- API Key 等敏感信息存储在本地缓存中，请注意安全
- 图像生成结果取决于 API 服务的质量和稳定性
- 建议使用 Chrome、Edge、Firefox 等现代浏览器

## License

MIT
