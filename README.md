# litemall（前后端分离版）

又一个小商场系统：Spring Boot 后端 + Vue 管理后台 + Vue 移动商城 + 微信小程序。
本仓库按**前后端分离**的方式组织，后端、前端各自独立，可分别打开、分别构建、分别运行。

## 目录结构

```
.
├── backend                      后端（Maven 多模块）
│   ├── pom.xml                  父 pom
│   ├── litemall-core            通用工具 / 配置 / 对象存储
│   ├── litemall-db              实体、DAO、Mapper、sql 脚本
│   ├── litemall-wx-api          小程序接口 /wx/**
│   ├── litemall-admin-api       管理后台接口 /admin/**
│   ├── litemall-all             启动模块（8080，打成可执行 jar）
│   ├── litemall-all-war         war 部署版
│   ├── deploy / docker          部署脚本与配置
│   └── doc                      项目文档
└── frontend                     前端
    ├── litemall-admin           管理后台（Vue，开发端口 9527）
    ├── litemall-vue             移动端商城（Vue，开发端口 6255）
    ├── litemall-wx              微信小程序
    └── renard-wx                微信小程序（另一套皮肤）
```

前后端只通过 HTTP 交互：前端 dev 服务器把 `/admin`、`/wx` 代理到 `http://localhost:8080`。

## 技术栈

- 后端：Spring Boot 2.1.5、MyBatis、Druid、Shiro、PageHelper
- 管理后台：Vue 2 + Element UI（vue-element-admin 4.3.0）
- 移动商城：Vue 2 + Vant
- 小程序：原生微信小程序
- 数据库：MySQL 5.7（utf8mb4）

## 快速启动

### 1. 数据库

```bash
mysql -h127.0.0.1 -uroot -proot --default-character-set=utf8mb4 < backend/litemall-db/sql/litemall_schema.sql
mysql -h127.0.0.1 -uroot -proot --default-character-set=utf8mb4 litemall < backend/litemall-db/sql/litemall_table.sql
mysql -h127.0.0.1 -uroot -proot --default-character-set=utf8mb4 litemall < backend/litemall-db/sql/litemall_data.sql
```

数据源默认 `localhost:3306/litemall`，账号 `root` / `root`（见 `backend/litemall-db/src/main/resources/application-db.yml`）。

### 2. 前端页面（打包进 jar，单端口 8080）

```bash
cd frontend/litemall-admin
npm install --legacy-peer-deps
npm run build        # 生成 dist，构建后端时会被复制进 jar
```

### 3. 后端（8080，页面与接口同一个地址）

```bash
cd backend
mvn -DskipTests -pl litemall-all -am clean install
java -jar litemall-all/target/litemall-all-0.1.0-exec.jar
```

浏览器打开 `http://localhost:8080` 即为管理后台登录页（`/#/login`），接口同源（`/admin/**`、`/wx/**`）。

### 4. 前端开发模式（可选，热更新）

```bash
cd frontend/litemall-admin
NODE_OPTIONS=--openssl-legacy-provider npm run dev
```

访问 `http://localhost:9527`，接口代理到 `http://localhost:8080`；与 8080 可同时使用。

### 5. 移动商城（可选）

```bash
cd frontend/litemall-vue
NODE_OPTIONS=--openssl-legacy-provider npm run dev
```

访问 `http://localhost:6255`。

## 登录账号

| 账号 | 密码 | 角色 |
| --- | --- | --- |
| `admin123` | `admin123` | 超级管理员 |
| `mall123` | `mall123` | 商城管理员 |
| `promotion123` | `promotion123` | 推广管理员 |

## 说明

- 页面与接口同源部署在 8080：前端 `npm run build` 出的 dist 由 `litemall-all` 打包时复制进 jar（`BOOT-INF/classes/static`），前端 `VUE_APP_BASE_API` 使用相对路径 `/admin`。
- 微信小程序的微信登录、微信支付需要真实的小程序 appid/secret 与商户号，仓库中为官方示例值。
- 本项目组件依赖较旧，Node 17+ 运行 `npm run dev` / `npm run build` 需加 `NODE_OPTIONS=--openssl-legacy-provider`（webpack 4 的 md4 哈希限制）。

## License

MIT，基于 [linlinjava/litemall](https://github.com/linlinjava/litemall)。
