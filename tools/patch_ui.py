# -*- coding: utf-8 -*-
"""
界面文案 / 主题色批量替换工具（鲜花主题）
用法： python tools/patch_ui.py [admin|wx|web|all] [--dry]

每条补丁 (相对路径, 原始片段, 新片段, 期望匹配次数)：
遇到匹配次数不符会报错并跳过，避免误改。
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FE = os.path.join(ROOT, "frontend")
ADMIN = os.path.join(FE, "litemall-admin")
WX = os.path.join(FE, "litemall-wx")

PATCHES = {}

# ----------------------------------------------------------------- 管理后台
PATCHES["admin"] = [
    ("litemall-admin/vue.config.js",
     "const name = 'litemall' // page title",
     "const name = '鲜花订购与管理系统' // page title", 1),

    ("litemall-admin/src/styles/element-variables.scss",
     "$--color-primary: #1890ff;",
     "$--color-primary: #c2456a;", 1),

    ("litemall-admin/src/styles/variables.scss", "$menuText:#bfcbd9;", "$menuText:#e6d3d9;", 1),
    ("litemall-admin/src/styles/variables.scss", "$menuActiveText:#409EFF;", "$menuActiveText:#ffa5ba;", 1),
    ("litemall-admin/src/styles/variables.scss", "$menuBg:#304156;", "$menuBg:#3b2b31;", 1),
    ("litemall-admin/src/styles/variables.scss", "$menuHover:#263445;", "$menuHover:#4a3439;", 1),
    ("litemall-admin/src/styles/variables.scss", "$subMenuBg:#1f2d3d;", "$subMenuBg:#33242a;", 1),
    ("litemall-admin/src/styles/variables.scss", "$subMenuHover:#001528;", "$subMenuHover:#241a1e;", 1),

    ("litemall-admin/src/locales/zh-Hans.js", "商品", "鲜花", 74),
    ("litemall-admin/src/locales/zh-Hans.js", "货品", "规格", 15),
    ("litemall-admin/src/locales/zh-Hans.js", "品牌制造商", "花艺品牌", 2),
    ("litemall-admin/src/locales/zh-Hans.js", "mall: '商场管理',", "mall: '鲜花商城',", 1),
    ("litemall-admin/src/locales/zh-Hans.js", "promotion: '推广管理',", "promotion: '营销推广',", 1),
    ("litemall-admin/src/locales/zh-Hans.js", "config: '配置管理',", "config: '系统配置',", 1),
    ("litemall-admin/src/locales/zh-Hans.js", "title: '管理员登录'",
     "title: '鲜花订购与管理系统 · 管理后台'", 1),
    ("litemall-admin/src/locales/zh-Hans.js", "dashboard: '首页',", "dashboard: '数据看板',", 1),
    ("litemall-admin/src/locales/zh-Hans.js", "user_total: '用户数量',", "user_total: '会员数量',", 1),
    ("litemall-admin/src/locales/zh-Hans.js", "product_total: '规格数量',", "product_total: '规格库存',", 1),

    ("litemall-admin/src/views/login/index.vue",
     """      <div style="position:relative">
        <div class="tips">
          <span> 超级管理员用户名: admin123</span>
          <span> 超级管理员用户名：admin123</span>
        </div>
        <div class="tips">
          <span> 商城管理员用户名: mall123</span>
          <span> 商城管理员用户名：mall123</span>
        </div>
        <div class="tips">
          <span> 推广管理员用户名: promotion123</span>
          <span> 推广管理员用户名：promotion123</span>
        </div>
      </div>""",
     """      <div style="position:relative">
        <div class="tips">
          <span> 超级管理员：admin123 / admin123</span>
        </div>
        <div class="tips">
          <span> 商城管理员：mall123 / mall123</span>
        </div>
        <div class="tips">
          <span> 推广管理员：promotion123 / promotion123</span>
        </div>
      </div>""", 1),

    ("litemall-admin/src/views/login/index.vue",
     """      Copyright © 2022 xxx.com 版权所有 <a href="https://github.com/linlinjava/litemall">沪ICP备xxx号</a>""",
     """      Copyright © 2025 花语鲜花商城 · 鲜花订购与管理系统""", 1),

    ("litemall-admin/src/views/login/index.vue",
     "$bg:#2d3a4b;",
     "$bg:#3b2b31;", 1),

    ("litemall-admin/src/views/login/index.vue",
     """  background-color: $bg;
  overflow: hidden;""",
     """  background: linear-gradient(rgba(59, 43, 49, 0.86), rgba(59, 43, 49, 0.94)),
    url('/flower/banner_1.jpg') center / cover no-repeat;
  overflow: hidden;""", 1),

    ("litemall-admin/src/views/dashboard/index.vue",
     """    <el-row :gutter="40" class="panel-group">""",
     """    <div class="flower-hello">
      <div class="hello-title">花语鲜花商城 · 数据看板</div>
      <div class="hello-sub">鲜花订购与管理系统 —— 鲜花、类目、库存、订单、会员一体化管理</div>
    </div>

    <el-row :gutter="40" class="panel-group">""", 1),

    ("litemall-admin/src/views/dashboard/index.vue",
     """.panel-group {
  margin-top: 18px;""",
     """.flower-hello {
  padding: 22px 26px;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(120deg, #c2456a 0%, #e08aa0 60%, #f2c1c6 100%);
  box-shadow: 0 6px 18px rgba(194, 69, 106, 0.25);

  .hello-title {
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .hello-sub {
    margin-top: 8px;
    font-size: 13px;
    opacity: 0.9;
  }
}

.panel-group {
  margin-top: 18px;""", 1),
]


# ----------------------------------------------------------------- 微信小程序
PATCHES["wx"] = [
    ("litemall-wx/config/api.js",
     "var WxApiRoot = 'http://localhost:8080/wx/';",
     "var WxApiRoot = 'http://localhost:8081/wx/';", 1),

    ("litemall-wx/app.json",
     '"navigationBarTitleText": "litemall小程序商城",',
     '"navigationBarTitleText": "花语鲜花商城",', 1),
    ("litemall-wx/app.json", '"selectedColor": "#AB956D",', '"selectedColor": "#c2456a",', 1),
    ("litemall-wx/app.json", '"text": "个人"', '"text": "我的"', 1),

    ("litemall-wx/pages/index/index.wxml",
     '<text class="txt">商品搜索, 共{{goodsCount}}款好物</text>',
     '<text class="txt">搜索鲜花，共 {{goodsCount}} 款好物</text>', 1),
    ("litemall-wx/pages/index/index.wxml", '<text class="txt">团购专区</text>', '<text class="txt">拼团优惠</text>', 1),
    ("litemall-wx/pages/index/index.wxml", '<text class="txt">品牌制造商直供</text>', '<text class="txt">花艺品牌</text>', 1),
    ("litemall-wx/pages/index/index.wxml", '<text class="txt">周一周四 · 新品首发</text>', '<text class="txt">本周新花 · 每周一上新</text>', 1),
    ("litemall-wx/pages/index/index.wxml", '<text class="txt">人气推荐</text>', '<text class="txt">人气鲜花</text>', 1),
    ("litemall-wx/pages/index/index.wxml", '<text class="txt">专题精选</text>', '<text class="txt">花艺专题</text>', 1),
    ("litemall-wx/pages/index/index.wxml", "{{'更多'+item.name+'好物 >'}}", "{{'更多'+item.name+'鲜花 >'}}", 1),
    ("litemall-wx/pages/index/index.js", "title: 'litemall小程序商场',", "title: '花语鲜花商城',", 1),

    ("litemall-wx/pages/catalog/catalog.wxml",
     '<text class="txt">商品搜索, 共{{goodsCount}}款好物</text>',
     '<text class="txt">搜索鲜花，共 {{goodsCount}} 款好物</text>', 1),

    ("litemall-wx/pages/checkout/checkout.wxml", '<text class="name">商品合计</text>', '<text class="name">鲜花合计</text>', 1),
    ("litemall-wx/pages/goods/goods.json", '"navigationBarTitleText": "商品详情"', '"navigationBarTitleText": "鲜花详情"', 1),
    ("litemall-wx/pages/goods/goods.wxml", '<view class="t">商品参数</view>', '<view class="t">鲜花参数</view>', 1),
    ("litemall-wx/pages/goods/goods.wxml", '<view class="n" wx:if="{{soldout}}">商品已售空</view>', '<view class="n" wx:if="{{soldout}}">鲜花已售空</view>', 1),
    ("litemall-wx/pages/search/search.wxml", '<text class="text">您寻找的商品还未上架</text>', '<text class="text">您寻找的鲜花还未上架</text>', 1),
    ("litemall-wx/pages/ucenter/order/order.wxml", '<text class="number">共{{gitem.number}}件商品</text>', '<text class="number">共{{gitem.number}}件鲜花</text>', 1),
    ("litemall-wx/pages/ucenter/orderDetail/orderDetail.wxml", '<view class="label">商品信息</view>', '<view class="label">鲜花信息</view>', 1),
    ("litemall-wx/pages/ucenter/orderDetail/orderDetail.wxml", '<text class="label">商品合计：</text>', '<text class="label">鲜花合计：</text>', 1),

    ("litemall-wx/pages/about/about.js", "name: 'litemall',", "name: '花语鲜花商城',", 1),
    ("litemall-wx/pages/about/about.js", "address: 'https://github.com/linlinjava/litemall',",
     "address: '广州市天河区花城大道 88 号花语花艺中心',", 1),

    ("litemall-wx/project.config.json", '"projectname": "litemall-wx",', '"projectname": "flower-wx",', 1),
]

GLOB = {
    "wx": [("pages", [
        ("#b4282d", "#c2456a", 61),
        ("#ab956d", "#c2456a", 22),
        ("#a78845", "#c2456a", 19),
        ("#ab2b2b", "#a8304f", 6),
        ("#e3bf79", "#f2c1c6", 4),
    ])],
}


def apply(target, dry=False):
    patches = PATCHES[target]
    files = {}
    msgs = []
    for rel, old, new, expect in patches:
        path = os.path.join(FE, rel)
        if not os.path.exists(path):
            msgs.append("MISS FILE %s" % rel)
            continue
        if path not in files:
            with open(path, "r", encoding="utf-8", newline="") as f:
                files[path] = f.read().replace("\r\n", "\n")
        text = files[path]
        cnt = text.count(old)
        if cnt != expect:
            msgs.append("SKIP %s  (expected %d, found %d): %s" % (rel, expect, cnt, old.strip().splitlines()[0][:48]))
            continue
        files[path] = text.replace(old, new)
        msgs.append("OK   %s  x%d  %s" % (rel, cnt, old.strip().splitlines()[0][:48]))

    for m in msgs:
        print(m)
    if dry:
        print("[dry-run] no file written")
        return
    for path, text in files.items():
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(text)
    print("written: %d files" % len(files))


def apply_glob(target, dry=False):
    """按目录批量替换（主题色等），返回受影响文件数"""
    specs = GLOB.get(target, [])
    if not specs:
        return
    root = os.path.join(FE, specs_root(target))
    targets = []
    for dirpath, _, filenames in os.walk(root):
        for fn in filenames:
            if fn.endswith(".wxss") or fn.endswith(".json"):
                targets.append(os.path.join(dirpath, fn))
    changed = 0
    for old, new, expect in specs[0][1]:
        cnt = 0
        for path in targets:
            with open(path, "r", encoding="utf-8", newline="") as f:
                text = f.read()
            n = text.count(old)
            if n:
                cnt += n
                if not dry:
                    with open(path, "w", encoding="utf-8", newline="\n") as f:
                        f.write(text.replace(old, new))
        print("%s  %s -> %s   found=%d expected=%d%s" % (
            "OK  " if cnt == expect else "WARN", old, new, cnt, expect, "" if cnt == expect else "  !!"))
    changed += len(targets)


def specs_root(target):
    return {"wx": "litemall-wx"}.get(target, "")


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "all"
    dry = "--dry" in sys.argv
    targets = list(PATCHES) if target == "all" else [target]
    for t in targets:
        print("=== %s ===" % t)
        apply(t, dry)
        apply_glob(t, dry)
