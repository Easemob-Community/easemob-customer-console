# easemob-customer-console · 管理控制台

智能客服系统的运营管理与坐席工作台。坐席在此接待访客会话,管理员在此维护账号、AI 配置、分配策略并查看运营数据。

## 相关仓库

- 服务端(Spring Boot):[easemob-customer-service](https://github.com/Easemob-Community/easemob-customer-service)
- Web 访客端:[easemob-customer-web](https://github.com/Easemob-Community/easemob-customer-web)
- 移动端(Flutter,iOS/Android):[easemob-customer-app](https://github.com/Easemob-Community/easemob-customer-app)

## 技术栈

Vue 3 + Vite + TypeScript · Pinia · Vue Router · Element Plus · ECharts · 环信 Web SDK(坐席实时收发消息)

## 功能模块

| 模块 | 说明 |
|------|------|
| 登录 | 坐席/组长/管理员角色登录(返回环信令牌用于 IM 收发) |
| 工作台 workbench | 会话列表、实时收发、历史消息(最近 50 条)、关闭/结束会话 |
| 账号 account | 坐席账号、AI 账号、技能组维护(增删改查、上线/下线) |
| AI 配置 ai | AI 厂家配置(OpenAI/Dify 等,地址/密钥/超时)、转人工词表 |
| 分配策略 assignment | 转人工分配策略查看与配置 |
| 数据看板 dashboard | 会话总览、趋势图、客服接待排名 |

## 目录结构

```
src/
├── api/        # 后端接口封装
├── modules/    # 各功能模块(login/workbench/account/ai/assignment/dashboard)
├── router/     # 路由与守卫
├── sdk/        # 环信 IM 连接(坐席收消息)
├── store/      # Pinia 状态
└── types/      # TS 类型定义
```

## 本地开发

```bash
npm install
npm run dev        # http://localhost:5174,API 默认代理到 http://localhost:8080
```

## 构建与部署

```bash
npm run build      # 产物在 dist/,按 .env.production 构建
```

关键环境变量(`.env.production`):

| 变量 | 说明 |
|------|------|
| VITE_API_BASE | 后端接口地址,生产环境为同源 `/api`(经 nginx 反代到后端) |
| VITE_EASEMOB_APP_KEY | 环信应用标识 |

构建产物为纯静态文件,由 nginx 托管(配置方式同访客端,更换 root 目录即可)。

> 安全提醒:控制台默认无独立鉴权页面逻辑约束,公网部署建议限制来源 IP 或叠加访问认证。
