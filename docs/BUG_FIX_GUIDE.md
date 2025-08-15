# Bug修复指南和测试步骤

## 🐛 已修复的问题

### 1. Chat Record 重复写入问题 ✅
**原因**: 流式响应完成后状态更新异步导致的重复调用
**解决方案**: 
- 使用独立的保存函数 `saveChatTextWithContent`
- 直接传递收集的完整响应内容
- 添加保存状态控制防止重复

### 2. 用量统计功能不生效问题 ✅  
**原因**: 
- 用量统计在API请求开始时就执行，而不是成功完成后
- 前端组件使用错误的API端点
- 数据库操作兼容性问题

**解决方案**:
- 创建独立的用量增加API (`/api/usage/increment`)
- 在流式响应完成后调用用量统计
- 修复数据库操作使用SELECT+INSERT/UPDATE模式
- 优化前端组件使用正确的API端点

## 🧪 测试步骤

### 启动测试环境
```bash
# 1. 确保数据库已初始化
node scripts/init-payment-db.js

# 2. 重置用量数据（开发环境）
curl -X POST "http://localhost:3000/api/usage/reset?all=true"

# 3. 启动开发服务器
npm run dev
```

### 测试 Chat Record 保存功能

#### 测试1: 正常代码生成
1. 打开 http://localhost:3000
2. 输入代码生成请求（如："写一个简单的React组件"）
3. 等待生成完成
4. 检查浏览器控制台日志：
   ```
   Stream completed, saving chat with response length: [数字]
   Saving chat text: {inputLength: [数字], outputLength: [数字]}
   saveChatText
   内容已保存到数据库
   ```
5. 检查数据库：每次请求应该只产生一条 `chat_record` 记录

#### 测试2: 验证无重复保存
1. 连续发送多个请求
2. 检查数据库 `chat_record` 表
3. 确认每个请求对应一条记录，无重复

### 测试用量统计功能

#### 测试1: 未登录用户用量统计
1. 在无痕浏览器中打开网站
2. 观察用量指示器显示："Guest Plan" 和 "0/10"
3. 进行代码生成
4. 观察用量更新为 "1/10"
5. 继续测试直到达到10次限制
6. 验证限制提示模态框显示

#### 测试2: 登录用户用量统计
1. 使用Google登录
2. 观察用量指示器显示："Free Plan" 和 "0/30"
3. 进行代码生成
4. 观察用量实时更新
5. 测试到接近限制时的升级提示

#### 测试3: 检查控制台日志
生成代码时应该看到：
```
Incrementing usage for: {userId: "xxx", clientIP: "xxx"}
Usage incremented successfully
Usage increment result: {success: true, message: "Usage incremented successfully"}
```

### 测试数据库状态

#### 检查 daily_usage 表
```sql
SELECT * FROM daily_usage ORDER BY created_at DESC;
```
应该看到：
- `user_id`: 登录用户的ID或NULL（未登录）
- `ip_address`: 未登录用户的IP或NULL（登录用户）
- `usage_count`: 当日使用次数
- `user_type`: guest/free/premium
- `usage_date`: 当天日期

#### 检查 chat_record 表
```sql
SELECT COUNT(*) FROM chat_record WHERE DATE(created_at) = CURRENT_DATE;
```
记录数应该等于实际生成的次数

## 🔧 调试工具

### 重置用量数据
```bash
# 重置所有用量
curl -X POST "http://localhost:3000/api/usage/reset?all=true"

# 重置今日用量
curl -X POST "http://localhost:3000/api/usage/reset"

# 重置特定用户用量
curl -X POST "http://localhost:3000/api/usage/reset?userId=USER_ID"
```

### 查看用量状态
```bash
# 未登录用户
curl "http://localhost:3000/api/usage/status"

# 登录用户
curl "http://localhost:3000/api/usage/status?userId=USER_ID"
```

### 手动增加用量
```bash
curl -X POST "http://localhost:3000/api/usage/increment" \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID"}'
```

## ✅ 预期结果

### 正常工作的功能
- [x] 聊天记录正确保存，无重复
- [x] 用量统计实时更新
- [x] 未登录用户10次限制
- [x] 登录用户30次限制  
- [x] 达到限制时显示升级提示
- [x] 用量指示器准确显示
- [x] 数据库记录正确

### 错误日志检查
如果功能不正常，检查控制台是否有以下错误：
- "Error incrementing usage"
- "Error fetching usage"
- "Error saving chat record"

## 🚨 故障排除

### 问题：用量不更新
1. 检查数据库连接
2. 确认 `daily_usage` 表存在
3. 检查 `/api/usage/increment` 是否正常响应

### 问题：聊天记录不保存  
1. 检查 `/api/chat/saveText` 是否正常
2. 确认 `chat_record` 表存在
3. 检查流式响应是否完整

### 问题：用量指示器不显示
1. 检查 `/api/usage/status` 是否正常
2. 确认前端组件正确加载
3. 检查浏览器网络请求

现在您的付费功能应该完全正常工作了！🎉