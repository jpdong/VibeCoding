# 支付流程文档

## 概述

本文档描述了基于 Creem 平台的完整支付流程实现，支持 9.99/月的连续订阅服务。

## 系统架构

### 核心组件
- **前端**: Next.js 应用
- **支付服务商**: Creem 支付平台
- **数据库**: PostgreSQL
- **认证**: NextAuth.js

### 支付产品配置
- **产品ID**: `prod_xxx` (通过环境变量 `CREEM_PRODUCT_ID` 配置)
- **价格**: $9.99/月
- **计费方式**: 连续订阅

## 环境配置

### 必需的环境变量
```bash
# Creem 支付配置
CREEM_API_KEY=your_creem_api_key_here
CREEM_PRODUCT_ID=prod_xxx
SUCCESS_URL=http://localhost:3000/payment/success

# NextAuth 配置
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# 数据库配置
POSTGRES_URL=postgresql://user:password@localhost:5432/vibe_coding_db
```

## 数据库结构

### 订阅计划表 (subscription_plans)
```sql
- plan_id: 计划唯一标识 (包括 Creem 产品ID)
- name: 计划名称
- price: 价格
- currency: 货币代码
- daily_limit: 每日使用限制
- features: 功能特性 JSON
```

### 用户订阅表 (user_subscriptions)
```sql
- user_id: 用户ID
- plan_id: 订阅计划ID
- creem_subscription_id: Creem 订阅ID
- status: 订阅状态 (active, canceled, expired)
- current_period_start/end: 当前周期时间
```

### 支付记录表 (payment_records)
```sql
- user_id: 用户ID
- creem_payment_id: Creem 支付ID
- amount: 支付金额
- status: 支付状态
- payment_method: 支付方式
```

## 支付流程

### 1. 获取产品和价格信息

**API**: `GET /api/payments/products`

**功能**: 
- 获取 Creem 平台的产品列表
- 返回本地订阅计划配置
- 提供包含产品ID的定价信息

**响应示例**:
```json
{
  "success": true,
  "data": {
    "creemProducts": [...],
    "subscriptionPlans": [...],
    "premiumProduct": {
      "creemProductId": "prod_xxx",
      "price": 9.99,
      "currency": "USD",
      "name": "Premium Monthly",
      "dailyLimit": 300
    }
  }
}
```

### 2. 创建支付会话

**API**: `GET /api/payments/checkout?product_id=prod_xxx`

**流程**:
1. 验证用户身份认证
2. 使用默认产品ID (如果未提供)
3. 调用 Creem SDK 创建支付会话
4. 返回支付URL

**请求示例**:
```
GET /api/payments/checkout?product_id=prod_xxx
```

**响应示例**:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.creem.io/cs_123..."
}
```

### 3. 用户完成支付

用户通过 Creem 支付页面完成支付过程。

### 4. Webhook 处理

**API**: `POST /api/payments/webhook`

**支持的事件类型**:

#### 订阅支付成功 (`subscription.paid`)
- 创建或更新用户订阅记录
- 设置订阅状态为 `active`
- 计算订阅周期 (30天)
- 记录支付信息
- 更新用户权益

#### 订阅取消 (`subscription.canceled`)
- 更新订阅状态为 `canceled`
- 保持服务直到周期结束

#### 订阅过期 (`subscription.expired`)
- 更新订阅状态为 `expired`
- 撤销用户权益

#### 一次性支付完成 (`checkout.completed`)
- 记录一次性支付信息

### 5. 订阅状态查询

**API**: `GET /api/subscription/status?userId=xxx`

**功能**:
- 获取用户当前订阅状态
- 返回使用配额信息
- 支持访客用户查询

### 6. 订阅取消

**API**: `POST /api/subscription/cancel?subscription_id=xxx`

**功能**:
- 调用 Creem SDK 取消订阅
- 标记在周期结束时取消
- 保持服务到周期结束

## 用户权益管理

### 权益等级
- **Free 用户**: 每日 30 次使用限制
- **Premium 用户**: 每日 300 次使用限制 + 高级功能

### 权益控制
订阅状态通过以下方式控制用户权益：
1. `user_info` 表的 `current_plan` 字段
2. `subscription_status` 字段
3. 与 `usage_tracking` 系统集成

## 错误处理

### 支付失败
- Webhook 会收到相应事件
- 系统记录失败原因
- 不影响现有订阅状态

### 网络问题
- 所有 API 调用都有错误处理
- 记录详细错误日志
- 返回用户友好的错误信息

### 数据同步
- Webhook 处理具有幂等性
- 支持重试机制
- 避免重复处理

## 安全考虑

### API 安全
- 所有支付 API 都需要用户认证
- 使用 NextAuth.js 进行会话管理
- Webhook 应该验证来源

### 数据保护
- 不存储敏感的支付信息
- 仅保存必要的订阅状态数据
- 所有数据库操作使用参数化查询

### 环境变量
- API Key 等敏感信息通过环境变量配置
- 生产环境使用不同的 Creem 服务器索引

## 测试

### 本地测试
1. 配置测试环境的 Creem API Key
2. 使用测试产品ID
3. 运行 `npm run build` 确保无编译错误

### 生产部署
1. 更新环境变量为生产值
2. 设置正确的 Creem 服务器索引
3. 配置生产数据库连接
4. 测试完整的支付流程

## API 端点总览

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/payments/products` | GET | 获取产品和价格信息 |
| `/api/payments/checkout` | GET | 创建支付会话 |
| `/api/payments/webhook` | POST | 处理支付事件 |
| `/api/payments/subscription/cancel` | POST | 取消订阅 |
| `/api/subscription/status` | GET | 查询订阅状态 |
| `/api/subscription/plans` | GET | 获取订阅计划 |

## 常见问题

### Q: 用户如何升级到 Premium？
A: 调用 `/api/payments/checkout` API 创建支付会话，用户完成支付后自动升级。

### Q: 订阅如何自动续费？
A: Creem 平台自动处理续费，每次成功支付都会触发 `subscription.paid` webhook。

### Q: 如何处理支付失败？
A: 支付失败不会影响现有订阅，用户可以重新尝试支付或等待下次自动扣费。

### Q: 数据库迁移如何处理？
A: 运行 `/sql/` 目录下的 SQL 文件，确保表结构包含新的产品ID字段。

## 维护和监控

### 日志监控
- 监控 webhook 处理成功率
- 记录支付异常和错误
- 跟踪订阅状态变化

### 性能优化
- 数据库查询优化
- API 响应时间监控
- 缓存策略优化

### 数据备份
- 定期备份支付和订阅数据
- 确保数据恢复流程可靠

---

以上文档描述了完整的支付流程实现。如有问题，请参考 Creem 官方文档或联系技术支持。