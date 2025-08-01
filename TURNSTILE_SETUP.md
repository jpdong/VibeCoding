# Cloudflare Turnstile 集成说明

## 概述
已成功集成 Cloudflare Turnstile 人机验证，在用户点击"获取答案"前进行安全验证。

## 配置步骤

### 1. 获取 Turnstile 密钥
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Turnstile" 部分
3. 创建新的站点
4. 获取 Site Key 和 Secret Key

### 2. 环境变量配置
在 `.env.local` 和 `.env.production` 中添加：

```bash
# Cloudflare Turnstile config
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_actual_site_key
TURNSTILE_SECRET_KEY=your_actual_secret_key
```

**注意：** 当前使用的是测试密钥，需要替换为实际的生产密钥。

### 3. 测试密钥（仅用于开发）
- Site Key: `0x4AAAAAAAkqiE_JF_bJqJJJ`
- Secret Key: `0x4AAAAAAAkqiE_JF_bJqJJJ`

## 工作流程

### 用户交互流程
1. 用户输入编程问题
2. 点击"获取代码帮助"按钮
3. 如果没有验证令牌，显示 Turnstile 验证组件
4. 用户完成人机验证
5. 验证成功后，发送请求到 AI 服务
6. 返回代码解决方案

### 技术实现
1. **前端验证**：`TurnstileWidget` 组件处理用户验证
2. **令牌管理**：验证成功后获取令牌，请求完成后重置
3. **后端验证**：API 端点验证令牌有效性
4. **安全检查**：双重验证确保请求安全性

## 文件结构

```
src/
├── components/
│   └── TurnstileWidget.tsx          # Turnstile 验证组件
├── app/[locale]/
│   ├── PageComponent.tsx             # 主页面组件（已集成验证）
│   └── api/
│       ├── turnstile/verify/route.ts # 验证 API 端点
│       └── chat/generateTextStream/  # 聊天 API（已添加验证）
└── configs/
    └── languageText.ts               # 语言配置（已添加验证文本）
```

## 语言支持

### 英文
- `securityVerificationText`: "Please complete the security verification:"
- `securityVerificationRequired`: "Please complete the security verification first."
- `securityVerificationFailed`: "Security verification failed. Please try again."
- `securityVerificationError`: "Security verification error. Please refresh and try again."

### 中文
- `securityVerificationText`: "请完成安全验证："
- `securityVerificationRequired`: "请先完成安全验证。"
- `securityVerificationFailed`: "安全验证失败，请重试。"
- `securityVerificationError`: "安全验证错误，请刷新页面重试。"

## 安全特性

1. **双重验证**：前端和后端都进行令牌验证
2. **令牌管理**：使用后立即重置，防止重复使用
3. **错误处理**：完善的错误提示和重试机制
4. **用户体验**：验证成功后自动隐藏验证组件

## 部署注意事项

1. **生产环境**：必须使用真实的 Turnstile 密钥
2. **域名配置**：确保 Site Key 配置了正确的域名
3. **HTTPS**：生产环境必须使用 HTTPS
4. **监控**：建议监控验证成功率和失败原因

## 故障排除

### 常见问题
1. **验证失败**：检查密钥配置和域名设置
2. **组件不显示**：确认 Site Key 环境变量正确设置
3. **API 错误**：检查 Secret Key 和网络连接

### 调试方法
1. 查看浏览器控制台错误信息
2. 检查网络请求和响应
3. 验证环境变量是否正确加载

## 依赖包

- `@marsidev/react-turnstile`: React Turnstile 组件库

安装命令：
```bash
npm install @marsidev/react-turnstile
```