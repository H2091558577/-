# 鲜花订购与管理系统（Flower Ordering & Management System）

> 广东交通职业技术学院 · 软件技术专业 · 毕业设计（论文）作品
> 依据《任务书：鲜花销售系统》实现：模拟网上花店销售业务，构建鲜花浏览、预定、销售、购买、
> 添加、删除、修改与库存管理的完整系统，同时提供**用户端**与**管理端**。

---

## 一、题目与需求对照（任务书 → 实现）

任务书要求：模拟网上花店销售的业务，构建一个鲜花浏览、预定、销售、购买、添加、删除、修改和库存管理的系统；系统包括用户界面和管理员界面；用户界面主要实现用户注册登录、选购鲜花、订购鲜花；后台管理主要实现添加删除鲜花、修改鲜花信息、用户管理、订单发送。

| 任务书要求 | 本项目实现 | 所在位置 |
| --- | --- | --- |
| 用户注册登录 | 账号密码登录（小程序端另支持微信授权登录） | 网页版 `#/login`、小程序 `pages/auth/*`、后端 `/wx/auth/**` |
| 鲜花浏览 | 首页轮播 / 鲜花分类 / 搜索 / 品牌 / 专题 / 详情 | `/wx/home/index`、`/wx/goods/**`、`/wx/catalog/**` |
| 鲜花预定 | 下单时填写期望送达时间、贺卡内容（订单备注） | `/wx/order/submit` 的 `message` 字段 |
| 鲜花购买 | 购物车、立即购买、结算、优惠券抵扣、模拟支付 | `#/cart`、`#/checkout`、`/wx/cart/**`、`/wx/order/**` |
| 鲜花添加 | 后台「鲜花管理 → 添加鲜花」 | 管理后台 `/goods/create`、`POST /admin/goods/create` |
| 鲜花删除 | 后台列表批量删除 / 单条删除（逻辑删除） | `POST /admin/goods/delete` |
| 鲜花修改 | 后台「鲜花管理 → 编辑鲜花」，可改价格、库存、类目、图片、详情 | `POST /admin/goods/update` |
| 库存管理 | 每款鲜花 3 个规格货品（标准/豪华/尊享），下单扣减库存、后台可改库存 | `litemall_goods_product.number`、`/wx/order/submit` |
| 用户管理 | 后台会员列表、详情、等级、禁用 | 管理后台 `/user/user`、`/admin/user/**` |
| 订单发送（发货） | 后台订单列表 → 发货（快递公司 + 单号），用户端可见「已发货」 | `POST /admin/order/ship` |
| 订单管理 | 订单查询、详情、发货、退款、删除、导出 | 管理后台 `/mall/order` |
| 界面友好、温馨 | 玫瑰粉主题、花艺插画、卡片式布局、移动端自适应 | `frontend/flower-web/css/app.css` 等 |

---

## 二、两个客户端 + 一个管理端

| 端 | 说明 | 目录 | 访问方式 |
| --- | --- | --- | --- |
| **小程序版（客户端 1）** | 微信小程序，Vant Weapp 组件库，鲜花商城全套页面 | `frontend/litemall-wx` | 微信开发者工具导入该目录 |
| **网页版（客户端 2）** | 原生 JS 单页应用，桌面端 + 手机端自适应，无需构建 | `frontend/flower-web` | <http://localhost:8081/web/> |
| 管理后台 | Vue + Element UI 后台，鲜花 / 类目 / 订单 / 会员 / 库存管理 | `frontend/litemall-admin` | <http://localhost:8081/#/login> |

> 网页版与小程序端共用同一套 `/wx/**` 接口与同一份数据库数据，功能一一对应：
> 首页、分类、搜索、详情、购物车、结算、订单、地址、优惠券、会员中心。

---

## 三、技术栈

| 层次 | 技术 |
| --- | --- |
| 后端 | Spring Boot 2.1.5、MyBatis、PageHelper、Shiro（管理端鉴权）、JWT（客户端鉴权） |
| 数据库 | MySQL 5.7（`utf8mb4`，34 张表） |
| 管理后台 | Vue 2 + Element UI + Axios（vue-cli 3 / webpack 4） |
| 网页版客户端 | 原生 ES6 + Fetch + hash 路由，零依赖、零构建 |
| 小程序客户端 | 微信小程序原生框架 + Vant Weapp |
| 构建运行 | Maven 3、JDK 11、Node 22 |

---

## 四、目录结构

```
D:\桌面\litemall
├── backend                         后端（Maven 多模块）
│   ├── litemall-core               通用工具 / 配置 / 对象存储 / 支付 / 短信
│   ├── litemall-db                 实体、DAO、Mapper、service、SQL 脚本
│   │   └── sql                     schema / table / data / flower_data.sql
│   ├── litemall-wx-api             客户端接口 /wx/**
│   ├── litemall-admin-api          管理端接口 /admin/**
│   ├── litemall-all                启动模块（8081，jar 内含后台页面 + 网页版 + 鲜花图片）
│   ├── litemall-db/sql             flower_data.sql（鲜花业务数据）
│   └── logs / storage              运行时日志、上传文件
├── frontend
│   ├── litemall-admin              管理后台（Vue，构建产物打进 jar 的 / 路径）
│   ├── flower-web                  ★ 网页版客户端（静态站点，打进 jar 的 /web/ 路径）
│   ├── litemall-wx                 ★ 小程序版客户端（微信开发者工具导入）
│   ├── litemall-vue                原始 H5 商城（归档参考，未参与交付）
│   └── renard-wx                   另一套小程序皮肤（归档参考）
├── tools                           图片资源 / 演示数据生成脚本、接口自测脚本
├── docs                            设计说明、测试记录
├── start-backend.cmd               一键启动后端（8081：后台 + 网页版 + 接口）
├── start-admin.cmd                 可选：后台前端热更新开发模式（9527）
├── 本地启动说明.md                 环境、导入数据、启动与排错
└── README.md                       本文
```

---

## 五、快速开始

### 1. 准备数据库（MySQL 5.7）

```bat
cd D:\phpstudy_pro\Extensions\MySQL5.7.26\bin
mysql -h127.0.0.1 -uroot -proot --default-character-set=utf8mb4 < D:\桌面\litemall\backend\litemall-db\sql\litemall_schema.sql
mysql -h127.0.0.1 -uroot -proot --default-character-set=utf8mb4 litemall < D:\桌面\litemall\backend\litemall-db\sql\litemall_table.sql
mysql -h127.0.0.1 -uroot -proot --default-character-set=utf8mb4 litemall < D:\桌面\litemall\backend\litemall-db\sql\flower_data.sql
```

`flower_data.sql` 为**鲜花业务数据**：8 个一级类目 / 20 个二级类目 / 50 款鲜花 / 150 个规格货品 /
4 个花艺品牌 / 4 张优惠券 / 4 条首页轮播 / 3 个专题 / 5 条常见问题 / 3 个演示会员 / 4 个演示订单。

### 2. 启动服务

```bat
双击 start-backend.cmd
```

或手工：

```bat
cd backend
set JAVA_HOME=E:\java\jdk-11.0.20
java -Dfile.encoding=UTF-8 -jar litemall-all\target\litemall-all-0.1.0-exec.jar
```

启动后：

- 管理后台：<http://localhost:8081/#/login>
- 网页版商城：<http://localhost:8081/web/>
- 接口根：`/admin/**`（管理端）、`/wx/**`（客户端）

### 3. 小程序版

用微信开发者工具「导入项目」选择 `frontend/litemall-wx`，在「详情 → 本地设置」勾选
**「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」**，
接口地址在 `frontend/litemall-wx/config/api.js`（默认 `http://localhost:8081/wx/`）。

---

## 六、演示账号

| 端 | 账号 | 密码 | 说明 |
| --- | --- | --- | --- |
| 管理后台 | `admin123` | `admin123` | 超级管理员（全部权限） |
| 管理后台 | `mall123` | `mall123` | 商城管理员 |
| 管理后台 | `promotion123` | `promotion123` | 推广管理员 |
| 网页版 / 小程序 | `flower01` | `123456` | 演示会员（花小仙） |
| 网页版 / 小程序 | `flower02` | `123456` | 演示会员（花小主） |
| 网页版 / 小程序 | `flower03` | `123456` | 演示会员（花满楼） |

> 小程序端的「微信登录」需要真实 appid/secret 与商户号，本地无法完成，请使用「账号登录」入口。

---

## 七、功能地图

### 用户端（小程序 / 网页版）

- 首页：4 张轮播、8 个类目入口、领券中心、人气鲜花、本周新花、花艺品牌、花艺专题、分类楼层
- 分类：一级类目 + 二级类目树、按类目/新品/热销筛选、价格与上架时间排序、分页
- 搜索：关键词搜索、热门关键词
- 详情：多图、价格、规格（标准/豪华/尊享，各自价格与库存）、数量、花语详情、商品参数、用户评价、相关推荐
- 购物车：勾选、增减数量、删除、合计与免运费提示
- 结算：收货地址（新增/选择）、鲜花清单、优惠券、订单备注（期望送达时间/贺卡）、金额明细
- 订单：待付款 / 待发货 / 待收货 / 待评价，支付（演示环境模拟支付）、取消、确认收货、删除、详情
- 会员中心：订单数量看板、地址管理、我的优惠券、退出登录

### 管理端

- 数据看板：会员数、鲜花数、规格库存数、订单数
- 鲜花管理：列表检索、添加、编辑（价格/库存/类目/图片/富文本详情）、上架下架、批量删除、评价管理
- 鲜花商城：类目树维护、花艺品牌、订单查询与发货、售后、常见问题、搜索关键词
- 会员管理：会员列表、详情、收藏/足迹/搜索历史/意见反馈
- 营销推广：轮播广告、优惠券、专题、拼团规则与活动
- 系统管理：管理员、角色权限、操作日志、对象存储、通知
- 系统配置：商城信息（名称/地址/电话）、运费（满 99 免运费）、订单超时、小程序配置
- 统计报表：会员统计、订单统计、鲜花统计

---

## 八、接口概览

| 分类 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `GET /wx/home/index` | 轮播、类目、优惠券、热销、新品、品牌、专题、楼层 |
| 类目 | `GET /wx/catalog/index`、`/wx/catalog/all`、`/wx/catalog/getsecondcategory` | 类目树 |
| 鲜花 | `GET /wx/goods/list`、`/wx/goods/detail`、`/wx/goods/related`、`/wx/goods/category` | 列表/详情/推荐 |
| 搜索 | `GET /wx/search/index`、`/wx/search/helper` | 关键词 |
| 购物车 | `POST /wx/cart/add`、`/wx/cart/fastadd`、`/wx/cart/update`、`/wx/cart/checked`、`/wx/cart/delete`、`GET /wx/cart/index`、`/wx/cart/checkout` | 加购到结算 |
| 订单 | `POST /wx/order/submit`、`/wx/order/cancel`、`/wx/order/confirm`、`/wx/order/delete`、`/wx/order/mockpay`、`GET /wx/order/list`、`/wx/order/detail` | 下单与订单流转 |
| 地址 | `GET /wx/address/list`、`/wx/address/detail`、`POST /wx/address/save`、`/wx/address/delete` | 收货地址（字段为 `tel`） |
| 优惠券 | `GET /wx/coupon/list`、`/wx/coupon/mylist`、`/wx/coupon/selectlist`、`POST /wx/coupon/receive` | 领券/用券 |
| 会员 | `POST /wx/auth/login`、`GET /wx/auth/info`、`GET /wx/user/index` | 登录与统计 |
| 管理端 | `/admin/**` | Shiro 鉴权，请求头 `X-Litemall-Admin-Token` |

客户端登录态：`POST /wx/auth/login` 返回 `token`，后续请求带请求头 `X-Litemall-Token`。

**模拟支付说明**：微信支付需要真实商户号与证书，本地无法回调，因此后端提供
`POST /wx/order/mockpay {orderId}`，把未支付订单直接置为「已付款」，便于演示完整订单流转。

---

## 九、测试

```bat
powershell -ExecutionPolicy Bypass -File tools\test_api.ps1
```

覆盖 24 项：首页数据、会员登录、鲜花详情、加购、购物车、收货地址、结算计算、提交订单、
模拟支付、订单状态流转、管理员登录、后台鲜花/类目/订单/会员列表、后台发货、
客户端状态同步、订单统计、静态资源可访问。当前结果：**24 项全部通过**（见 `docs/测试记录.md`）。

---

## 十、文档索引

- `本地启动说明.md` —— 环境依赖、数据库导入、启动、打包、常见问题
- `docs/设计说明.md` —— 需求分析、功能设计、数据库设计、核心流程、界面设计
- `docs/测试记录.md` —— 接口联调自测结果与功能测试用例
- `tools/` —— `gen_images.py`（鲜花图片生成）、`gen_data.py`（鲜花演示数据生成）、
  `test_api.ps1`（接口自测）、`patch_ui.py`（界面文案/主题批量替换）

---

## 十一、说明

- 本项目基于开源商城 litemall 的工程结构改造为「鲜花订购与管理系统」，复用其电商基础能力
  （类目、商品、SKU 库存、购物车、订单、优惠券、会员、权限），并按任务书完成鲜花业务数据、
  花艺主题界面、网页版客户端与演示流程增强。
- 鲜花图片为脚本生成的插画资源（`tools/gen_images.py`），位于
  `backend/litemall-all/src/main/resources/static/flower/`，随 jar 一起发布，离线可用。
- 本机 8080 端口被其它程序占用，服务改用 **8081**；如需换端口，修改
  `backend/litemall-all/src/main/resources/application.yml` 的 `server.port`，并同步
  `flower_data.sql` 中图片地址前缀与 `frontend/litemall-wx/config/api.js`。
