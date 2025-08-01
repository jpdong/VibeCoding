# Vibe Coding
Vibe Coding - AI-powered coding assistant for developers

### 1. 右上角 Fork 本项目到你自己的 github 仓库

### 2. Clone 你自己的仓库代码到本地

```bash
git clone your git url
```

### 3. 安装依赖

```bash
cd vibe-coding && yarn
#or
cd vibe-coding && npm install
#or
cd vibe-coding && pnpm install
```

### 4. 复制 .env.example 重命名为 .env.local

修改.env.local其中的配置为你自己的配置，生产环境配置在 .env.production

### 5. 额外的配置

1) 谷歌登录认证配置 👉 [Google-Auth-Help](https://github.com/SoraWebui/SoraWebui/blob/login/help/Google-Auth.md)
2) 数据库配置 👉 Any PostgreSQL
3) 在目录 /sql 下有所需要的数据库表，创建项目的数据库，并执行这些语句创建数据表

### 6. 运行

```bash
yarn dev
#or
npm run dev
#or
pnpm dev
```

### 7. 在浏览器打开 [http://localhost](http://localhost)


## 有任何疑问联系 Wechat: GeFei55

