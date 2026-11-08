# -*- coding: utf-8 -*-
"""
鲜花订购与管理系统 —— 演示数据生成脚本
生成 backend/litemall-db/sql/flower_data.sql（UTF-8，MySQL 5.7）
运行：python tools/gen_data.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "backend", "litemall-db", "sql", "flower_data.sql")
IMG = "http://localhost:8081/flower/"

PWD_123456 = "$2a$10$.iKVZqdS6BGf5wzm5eAWOukQRMmwao26inEJi2SkSp.e5upUNlcVS"
NOW = "2025-06-01 10:00:00"


def esc(s):
    return str(s).replace("\\", "\\\\").replace("'", "''")


def q(s):
    return "'%s'" % esc(s)


def jarr(items):
    return q("[\"" + "\", \"".join(items) + "\"]")


# ------------------------------------------------------------ 类目
# (id, name, keywords, desc, pid, icon, level, sort)
CATS = [
    (1, "玫瑰花语", ["玫瑰", "红玫瑰", "香槟玫瑰"], "经典玫瑰，爱的表达", 0, "icon_1.png", "L1", 10),
    (2, "百合芬芳", ["百合", "白百合", "香水百合"], "百年好合，馨香满室", 0, "icon_2.png", "L1", 20),
    (3, "生日花束", ["生日", "生日花束", "祝福"], "把祝福包进花里", 0, "icon_3.png", "L1", 30),
    (4, "爱情表白", ["表白", "求婚", "情人节"], "以花为证，一生一诺", 0, "icon_4.png", "L1", 40),
    (5, "婚礼庆典", ["婚礼", "新娘手捧", "婚礼布置"], "婚礼与庆典花艺", 0, "icon_5.png", "L1", 50),
    (6, "感恩祝福", ["母亲节", "教师节", "康乃馨"], "感恩有你，花香为礼", 0, "icon_6.png", "L1", 60),
    (7, "永生花礼", ["永生花", "永生玫瑰", "玻璃罩"], "不凋谢的花礼", 0, "icon_7.png", "L1", 70),
    (8, "绿植盆栽", ["绿植", "多肉", "盆栽", "花篮"], "把春天搬回家", 0, "icon_8.png", "L1", 80),
]

SUB_CATS = [
    (11, "红玫瑰花束", 1, 100, "goods_001.jpg"),
    (12, "香槟玫瑰花束", 1, 110, "goods_005.jpg"),
    (13, "粉玫瑰花束", 1, 120, "goods_008.jpg"),
    (21, "白百合花束", 2, 130, "goods_012.jpg"),
    (22, "香水百合", 2, 140, "goods_014.jpg"),
    (31, "生日花束", 3, 150, "goods_016.jpg"),
    (32, "创意花盒", 3, 160, "goods_020.jpg"),
    (33, "卡通花束", 3, 170, "goods_023.jpg"),
    (41, "求婚花束", 4, 180, "goods_025.jpg"),
    (42, "情人节花束", 4, 190, "goods_027.jpg"),
    (51, "新娘手捧花", 5, 200, "goods_029.jpg"),
    (52, "婚礼花艺布置", 5, 210, "goods_031.jpg"),
    (61, "母亲节花束", 6, 220, "goods_033.jpg"),
    (62, "教师节花束", 6, 230, "goods_036.jpg"),
    (63, "康乃馨花束", 6, 240, "goods_039.jpg"),
    (71, "永生玫瑰花", 7, 250, "goods_041.jpg"),
    (72, "永生花盒", 7, 260, "goods_043.jpg"),
    (81, "多肉盆栽", 8, 270, "goods_045.jpg"),
    (82, "观叶绿植", 8, 280, "goods_047.jpg"),
    (83, "鲜花花篮", 8, 290, "goods_049.jpg"),
]

# 每个二级类目的花材/包装/场景/花期
META = {
    11: ("红玫瑰", "牛皮纸 + 雾面纱", "表白 / 纪念日 / 求婚", "5-7 天"),
    12: ("香槟玫瑰", "白色雾面纸 + 丝带", "纪念日 / 生日 / 道谢", "5-7 天"),
    13: ("粉玫瑰", "粉色包装纸 + 满天星", "初恋 / 表白 / 生日", "5-7 天"),
    21: ("白百合", "素色牛皮纸", "探望 / 开业 / 长辈", "7-10 天"),
    22: ("香水百合", "香槟色包装纸", "祝福 / 家居 / 长辈", "7-10 天"),
    31: ("向日葵 + 粉玫瑰", "亮色包装纸 + 拉花", "生日 / 庆祝 / 探望", "5-7 天"),
    32: ("玫瑰 + 洋桔梗", "礼盒 + 缎带", "生日 / 表白 / 送礼", "3-5 天"),
    33: ("玫瑰 + 卡通玩偶", "纤维纸 + 彩带", "生日 / 儿童节 / 惊喜", "5-7 天"),
    41: ("红玫瑰", "黑金包装纸 + 灯串", "求婚 / 表白 / 纪念日", "5-7 天"),
    42: ("红玫瑰 + 巧克力", "红色包装纸 + 卡片", "情人节 / 表白", "5-7 天"),
    51: ("白玫瑰 + 桔梗", "白纱 + 缎带", "婚礼 / 婚纱照", "1-2 天"),
    52: ("玫瑰 + 绣球 + 满天星", "花艺布置", "婚礼 / 宴会 / 庆典", "1-2 天"),
    61: ("康乃馨 + 百合", "暖色包装纸", "母亲节 / 感恩 / 探望", "7-10 天"),
    62: ("康乃馨 + 向日葵", "牛皮纸 + 拉花", "教师节 / 谢师 / 敬意", "7-10 天"),
    63: ("康乃馨", "粉色包装纸 + 满天星", "感恩 / 探望 / 慰问", "7-10 天"),
    71: ("厄瓜多尔永生玫瑰", "木质礼盒", "表白 / 周年 / 珍藏", "3 年以上"),
    72: ("永生花", "玻璃罩 + 礼盒", "生日 / 纪念日 / 摆件", "3 年以上"),
    81: ("多肉植物", "陶盆 + 木托", "办公桌 / 家居 / 送礼", "常绿"),
    82: ("龟背竹 / 琴叶榕", "陶盆 + 托盘", "家居 / 办公 / 开业", "常绿"),
    83: ("玫瑰 + 百合 + 扶郎", "花篮 + 红绸", "开业 / 庆典 / 致贺", "3-5 天"),
}

# ------------------------------------------------------------ 商品
# (name, cat_id, price, brief)
GOODS = [
    ("永恒之约 · 11枝红玫瑰", 11, 199, "11 枝 A 级红玫瑰配尤加利叶，一心一意的表白"),
    ("挚爱一生 · 33枝红玫瑰", 11, 339, "33 枝红玫瑰层层叠叠，寓意三生三世"),
    ("烈焰红唇 · 99枝红玫瑰", 11, 899, "99 枝红玫瑰环绕成心形，天长地久的仪式感"),
    ("红玫瑰礼盒 · 19枝", 11, 259, "19 枝红玫瑰入盒，附赠祝福卡片"),
    ("香槟物语 · 11枝香槟玫瑰", 12, 209, "温柔的香槟色，适合纪念日与道谢"),
    ("蜜糖香槟 · 19枝", 12, 289, "19 枝香槟玫瑰配满天星，甜而不腻"),
    ("香槟之恋 · 33枝", 12, 429, "33 枝香槟玫瑰，盛大告白不落俗套"),
    ("初恋粉玫瑰 · 11枝", 13, 179, "11 枝粉玫瑰，青涩又心动的初恋感"),
    ("甜心粉玫瑰 · 19枝", 13, 249, "19 枝粉玫瑰配情人草，甜度刚好"),
    ("少女心事 · 33枝粉玫瑰", 13, 379, "33 枝粉玫瑰，把少女心捧到你面前"),
    ("满天星混搭花束", 13, 159, "粉色满天星混搭玫瑰，轻盈治愈的小确幸"),
    ("纯白百合 · 6枝", 21, 169, "6 枝白百合，纯净馨香，适合探望"),
    ("白百合礼盒 · 10枝", 21, 259, "10 枝白百合配尤加利叶，送长辈很体面"),
    ("香水百合 · 8枝", 22, 189, "8 枝香水百合，香气馥郁满室生香"),
    ("香氛百合 · 12枝", 22, 269, "12 枝香水百合，开业与家居都合适"),
    ("生日快乐花束", 31, 189, "向日葵搭配粉玫瑰，把生日祝福包进花里"),
    ("缤纷生日花束", 31, 229, "多色玫瑰混搭，热闹喜庆的生日礼"),
    ("少女梦生日花束", 31, 259, "粉系花束搭配气球卡，甜美的生日惊喜"),
    ("阳光生日花束", 31, 199, "向日葵主花，把阳光一起送出去"),
    ("玫瑰钻石花盒", 32, 299, "玫瑰入盒，点缀钻石造型，精致有格调"),
    ("甜蜜混搭花盒", 32, 219, "玫瑰与康乃馨混搭花盒，甜蜜又稳重"),
    ("抽屉式鲜花礼盒", 32, 259, "抽屉式礼盒，鲜花与卡片一次送出"),
    ("小熊萌宠花束", 33, 179, "卡通小熊搭配鲜花，萌趣可爱"),
    ("汪汪乐园花束", 33, 169, "卡通小狗花束，小朋友也会喜欢"),
    ("求婚仪式 · 99枝红玫瑰", 41, 999, "99 枝红玫瑰加灯串，仪式感直接拉满"),
    ("一生一世 · 52枝红玫瑰", 41, 599, "52 枝红玫瑰，一句“我爱你”"),
    ("情人节限定花束", 42, 329, "情人节限定配色，含巧克力与卡片"),
    ("情人节红玫瑰礼盒", 42, 359, "19 枝红玫瑰礼盒，附祝福卡与丝带"),
    ("白纱新娘手捧花", 51, 359, "白玫瑰配桔梗，法式新娘手捧花"),
    ("粉色新娘手捧花", 51, 329, "粉玫瑰为主，温柔系新娘手捧"),
    ("婚礼桌花 · 单份", 52, 199, "玫瑰与绣球桌花，含器皿与布置"),
    ("婚礼拱门花艺", 52, 1299, "全鲜花拱门布置，含现场搭建"),
    ("母亲节康乃馨花束", 61, 189, "康乃馨搭配百合，把感恩说出口"),
    ("感恩母亲混搭花束", 61, 229, "康乃馨混搭玫瑰，温馨又体面"),
    ("妈妈我爱你 · 33枝", 61, 289, "33 枝康乃馨，致敬最爱的妈妈"),
    ("教师节感恩花束", 62, 179, "康乃馨搭配向日葵，谢师恩"),
    ("向日葵教师节花束", 62, 169, "向日葵主花，阳光灿灿谢师恩"),
    ("桃李芬芳花束", 62, 199, "百合与康乃馨组合，桃李满园"),
    ("温情康乃馨 · 19枝", 63, 159, "19 枝康乃馨，温情脉脉的感恩"),
    ("康乃馨混搭花束", 63, 169, "康乃馨搭洋桔梗，柔和配色更耐看"),
    ("永生玫瑰 · 红", 71, 299, "厄瓜多尔永生玫瑰礼盒，三年不凋"),
    ("永生玫瑰 · 粉", 71, 289, "粉色永生玫瑰，附玻璃罩摆件"),
    ("永生花音乐盒", 72, 399, "永生花配音乐盒，一打开就响起旋律"),
    ("永生花玻璃罩", 72, 459, "永生花玻璃罩摆件，可长期摆放"),
    ("多肉拼盘盆栽", 81, 89, "6 种多肉拼盘，含陶盆与木托"),
    ("多肉礼盒三件套", 81, 129, "三盆小多肉礼盒装，适合办公桌"),
    ("龟背竹盆栽", 82, 139, "大叶龟背竹，好养又能净化空气"),
    ("琴叶榕盆栽", 82, 199, "1.2 米高琴叶榕，客厅里的绿意"),
    ("开业花篮 · 双层", 83, 399, "双层鲜花花篮，开业庆典显诚意"),
    ("庆典花篮 · 单层", 83, 299, "单层鲜花花篮，含红绸与贺卡"),
]

BRANDS = [
    (1, "花语工坊", "城中花艺师手作，当日现剪现包", "brand_1.jpg", 10, 159),
    (2, "四季花园", "四季鲜花直供，产地直采", "brand_2.jpg", 20, 189),
    (3, "臻爱花艺", "专注求婚与婚礼花艺布置", "brand_3.jpg", 30, 259),
    (4, "拾光花房", "永生花与创意花礼专门店", "brand_4.jpg", 40, 289),
]

SPECS = [("标准版", 1.00, 88), ("豪华版", 1.28, 46), ("尊享版", 1.55, 20)]

AD = [
    ("鲜花速递 · 同城2小时送达", "3", "banner_1.jpg"),
    ("生日花束 · 把祝福包进花里", "16", "banner_2.jpg"),
    ("爱情表白 · 以花为证", "25", "banner_3.jpg"),
    ("花艺课堂 · 周末开课", "", "banner_4.jpg"),
]

TOPICS = [
    (1, "情人节 · 花礼清单", "12 款表白花束", "topic_1.jpg", 199, [25, 26, 27, 28, 1, 2],
     "情人节不知道送什么花？我们按预算与场合整理了 12 款表白花束，从 99 元的小心意到 999 元的仪式感，都能找到合适的那一束。"),
    (2, "生日花束挑选指南", "按性格送对花", "topic_2.jpg", 189, [16, 17, 18, 19, 23],
     "送花不止是送花，更是送心意。开朗的朋友配向日葵，温柔的女生配粉玫瑰，长辈适合百合与康乃馨。"),
    (3, "鲜花养护小课堂", "让花期延长一倍", "topic_3.jpg", 159, [12, 13, 39, 40, 11],
     "剪根、换水、避免阳光直射与空调风口，再给鲜花一点点耐心，花期就能明显延长。"),
]

# (id, name, desc, tag, total, discount, min, limit, type, status, goods_type, goods_value, code, time_type, days)
COUPONS = [
    (1, "新人礼 · 满99减20", "全场鲜花通用，领取后7天内有效", "新人专享", 1000, 20, 99, 1, 0, 0, 0, "[]", "", 0, 7),
    (2, "满199减30", "全场鲜花通用，可与新人礼叠加使用", "限时抢", 500, 30, 199, 2, 0, 0, 0, "[]", "", 0, 15),
    (3, "满299减50", "全场鲜花通用，求婚花束更划算", "大额券", 300, 50, 299, 1, 0, 0, 0, "[]", "", 0, 30),
    (4, "母亲节专享减40", "母亲节花束专用，满259元可用", "节日券", 200, 40, 259, 1, 0, 0, 0, "[]", "", 0, 20),
]

KEYWORDS = [
    (1, "red_rose", "红玫瑰", 1, 1, 10),
    (2, "lily", "白百合", 1, 0, 20),
    (3, "birthday", "生日花束", 1, 0, 30),
    (4, "champagne_rose", "香槟玫瑰", 1, 0, 40),
    (5, "carnation", "康乃馨", 1, 0, 50),
    (6, "preserved", "永生花", 0, 0, 60),
    (7, "sunflower", "向日葵", 0, 0, 70),
    (8, "greenery", "绿植", 0, 0, 80),
]

ISSUES = [
    (1, "鲜花如何配送？多久可以送达？", "同城订单由花艺师专车配送，下单后 2 小时内送达；外地订单使用顺丰冷链，一般次日达。节假日建议提前 1-2 天预订。"),
    (2, "运费怎么计算？", "单笔订单满 99 元免运费，不满 99 元收取 12 元配送费；花篮、拱门等大型花艺按距离另行计算。"),
    (3, "收到的花不新鲜怎么办？", "请在签收后 24 小时内拍照联系客服，经核实可免费重发或全额退款，花材新鲜度是我们的第一承诺。"),
    (4, "鲜花可以指定送达时间吗？", "可以。下单时在备注中填写期望送达时间，花艺师会在配送前电话与您确认。"),
    (5, "如何让花期更长？", "收到鲜花后斜剪根部 2cm，去掉浸水叶片，每日换水并清洗花瓶；避免阳光直射、空调风口与水果同放。"),
]

NOTICES = [
    (1, "鲜花配送与养护说明", "同城鲜花 2 小时送达，满 99 元免运费；收到鲜花后请斜剪根部并每日换水，可有效延长花期。"),
    (2, "节日预订提醒", "情人节、母亲节等节日花材紧张，建议提前 1-2 天下单预订，可指定送达时间与祝福卡片内容。"),
]

GROUPON = [
    (1, 1, 275, 3, "2025-12-31 23:59:59"),
    (2, 5, 299, 3, "2025-12-31 23:59:59"),
    (3, 16, 268, 2, "2025-12-31 23:59:59"),
]

# 演示订单： (user_id, order_status, price位, consignee, mobile, address, ship?)
ORDERS = [
    (1, 101, 199, "花小仙", "13800000001", "广东省广州市天河区花城大道 88 号 3 栋 602", "待付款"),
    (1, 201, 339, "花小仙", "13800000001", "广东省广州市天河区花城大道 88 号 3 栋 602", "待发货"),
    (2, 301, 289, "花小主", "13800000002", "广东省广州市越秀区东风东路 123 号 1801", "已发货"),
    (3, 401, 259, "花满楼", "13800000003", "广东省广州市番禺区大学城中环东路 56 号", "已完成"),
]


def cat_rows():
    rows = []
    for (cid, name, kw, desc, pid, icon, level, sort) in CATS:
        rows.append("(%d,%s,%s,%s,%d,%s,'',%s,%d,%s,%s,0)" % (
            cid, q(name), jarr(kw), q(desc), pid, q(IMG + icon), q(level), sort, q(NOW), q(NOW)))
    for i, (cid, name, pid, sort, pic) in enumerate(SUB_CATS, start=1):
        kw = [name, META[cid][0]]
        rows.append("(%d,%s,%s,%s,%d,'',%s,'L2',%d,%s,%s,0)" % (
            cid, q(name), jarr(kw), q("%s花束，%s，%s" % (META[cid][0], META[cid][1], META[cid][2])),
            pid, q(IMG + pic), 10 + i * 2, q(NOW), q(NOW)))
    return rows


def goods_rows():
    rows, prod_rows, spec_rows, attr_rows, comment_rows = [], [], [], [], []
    pid = sid = aid = cid_ = 0
    for idx, (name, cat, price, brief) in enumerate(GOODS, start=1):
        pic = IMG + "goods_%03d.jpg" % (((idx - 1) % 48) + 1)
        gallery = [pic, IMG + "goods_%03d.jpg" % (((idx + 6) % 48) + 1),
                   IMG + "goods_%03d.jpg" % (((idx + 13) % 48) + 1)]
        flower, wrap, scene, life = META[cat]
        unit = "盆" if cat in (81, 82) else ("篮" if cat == 83 else ("盒" if cat in (32, 71, 72) else "束"))
        is_new = 1 if idx % 7 == 1 else 0
        is_hot = 1 if idx % 4 == 0 else 0
        brand = BRANDS[(idx - 1) % 4][0]
        detail = (
            '<div style="padding:14px;font-size:14px;line-height:2;color:#5a4348;background:#fff;">'
            '<p style="font-size:16px;color:#c2456a;font-weight:bold;">花语 · 花材说明</p>'
            '<p><strong>花语：</strong>%s</p>'
            '<p><strong>主花材：</strong>%s（当日新鲜直采，A 级花材）</p>'
            '<p><strong>包装：</strong>%s</p>'
            '<p><strong>适用场景：</strong>%s</p>'
            '<p><strong>花期参考：</strong>%s</p>'
            '<p><strong>配送说明：</strong>同城 2 小时专车送达，满 99 元免运费；下单后花艺师电话与您确认送达时间与贺卡内容。</p>'
            '<p><strong>养护提示：</strong>收到后斜剪根部 2cm，去掉浸水叶片，每日换水并清洗花瓶，避免阳光直射与空调风口。</p>'
            '</div>'
        ) % (esc(brief), esc(flower), esc(wrap), esc(scene), esc(life))
        rows.append("(%d,%s,%s,%d,%d,%s,%s,%s,1,%d,%s,'',%d,%d,%s,%.2f,%.2f,%s,%s,%s,0)" % (
            idx, q("HX%04d" % idx), q(name), cat, brand, jarr(gallery),
            q("%s,%s,鲜花,花束" % (name, flower)), q(brief), 100 + idx,
            q(pic), is_new, is_hot, q(unit), price * 1.3, price, q(detail), q(NOW), q(NOW)))

        for k, (spec_name, factor, stock) in enumerate(SPECS):
            sid += 1
            spec_rows.append("(%d,%d,'规格',%s,'',%s,%s,0)" % (
                sid, idx, q(spec_name), q(NOW), q(NOW)))
        for k, (spec_name, factor, stock) in enumerate(SPECS):
            pid += 1
            url = IMG + "goods_%03d.jpg" % (((idx + k * 5) % 48) + 1)
            prod_rows.append("(%d,%d,%s,%.2f,%d,%s,%s,%s,0)" % (
                pid, idx, jarr([spec_name]), round(price * factor, 2), stock, q(url), q(NOW), q(NOW)))
        attr_rows.append("(%d,%d,'花材',%s,%s,%s,0)" % (aid + 1, idx, q(flower), q(NOW), q(NOW)))
        attr_rows.append("(%d,%d,'包装',%s,%s,%s,0)" % (aid + 2, idx, q(wrap), q(NOW), q(NOW)))
        attr_rows.append("(%d,%d,'适用场景',%s,%s,%s,0)" % (aid + 3, idx, q(scene), q(NOW), q(NOW)))
        attr_rows.append("(%d,%d,'花期',%s,%s,%s,0)" % (aid + 4, idx, q(life), q(NOW), q(NOW)))
        attr_rows.append("(%d,%d,'产地',%s,%s,%s,0)" % (aid + 5, idx, q("云南昆明斗南花市"), q(NOW), q(NOW)))
        aid += 5

        if idx in (1, 2, 5, 9, 16, 20, 25, 29, 33, 41, 45, 49):
            cid_ += 1
            content = ["花很新鲜，包装也精致，朋友很喜欢！", "配送很快，两个小时就到了，花材状态很好。",
                       "第二次回购了，花艺师很用心，还会附养护小卡片。", "颜色比图片还要好看，赞！",
                       "送妈妈的，她说很香，花期也长。", "包装纸稍微有点褶皱，但花很新鲜，整体满意。"][cid_ % 6]
            comment_rows.append("(%d,%d,0,%s,'',%d,0,'[]',5,%s,%s,0)" % (
                cid_, idx, q(content), (cid_ % 3) + 1, q(NOW), q(NOW)))
    return rows, prod_rows, spec_rows, attr_rows, comment_rows


def main():
    g_rows, p_rows, s_rows, a_rows, cm_rows = goods_rows()
    L = []
    A = L.append
    A("-- =====================================================================")
    A("-- 鲜花订购与管理系统 —— 鲜花业务演示数据（MySQL 5.7 / utf8mb4）")
    A("-- 由 tools/gen_data.py 生成，导入前请先导入 litemall_schema/table")
    A("-- 导入： mysql -h127.0.0.1 -uroot -proot --default-character-set=utf8mb4 litemall < flower_data.sql")
    A("-- =====================================================================")
    A("SET NAMES utf8mb4;")
    A("USE litemall;")
    A("SET FOREIGN_KEY_CHECKS = 0;")
    A("")
    A("-- 1. 清理旧商城数据")
    for t in ["litemall_cart", "litemall_order_goods", "litemall_order", "litemall_comment",
              "litemall_collect", "litemall_footprint", "litemall_coupon_user", "litemall_coupon",
              "litemall_goods_product",
              "litemall_goods_specification", "litemall_goods_attribute", "litemall_goods",
              "litemall_category", "litemall_brand", "litemall_ad", "litemall_topic",
              "litemall_keyword", "litemall_issue", "litemall_notice", "litemall_groupon",
              "litemall_groupon_rules", "litemall_search_history", "litemall_feedback",
              "litemall_address", "litemall_aftersale", "litemall_user"]:
        A("DELETE FROM %s;" % t)
    A("")

    A("-- 2. 鲜花类目（8 个一级类目 + 20 个二级类目）")
    A("INSERT INTO litemall_category (id,name,keywords,`desc`,pid,icon_url,pic_url,level,sort_order,add_time,update_time,deleted) VALUES")
    A(",\n".join(cat_rows()) + ";")
    A("")

    A("-- 3. 花艺品牌（花坊）")
    A("INSERT INTO litemall_brand (id,name,`desc`,pic_url,sort_order,floor_price,add_time,update_time,deleted) VALUES")
    A(",\n".join("(%d,%s,%s,%s,%d,%.2f,%s,%s,0)" % (i, q(n), q(d), q(IMG + p), so, fp, q(NOW), q(NOW))
                 for (i, n, d, p, so, fp) in BRANDS) + ";")
    A("")

    A("-- 4. 鲜花商品（50 款）")
    A("INSERT INTO litemall_goods (id,goods_sn,name,category_id,brand_id,gallery,keywords,brief,is_on_sale,sort_order,pic_url,share_url,is_new,is_hot,unit,counter_price,retail_price,detail,add_time,update_time,deleted) VALUES")
    A(",\n".join(g_rows) + ";")
    A("")

    A("-- 5. 商品规格与货品（库存）")
    A("INSERT INTO litemall_goods_specification (id,goods_id,specification,value,pic_url,add_time,update_time,deleted) VALUES")
    A(",\n".join(s_rows) + ";")
    A("")
    A("INSERT INTO litemall_goods_product (id,goods_id,specifications,price,number,url,add_time,update_time,deleted) VALUES")
    A(",\n".join(p_rows) + ";")
    A("")
    A("INSERT INTO litemall_goods_attribute (id,goods_id,attribute,value,add_time,update_time,deleted) VALUES")
    A(",\n".join(a_rows) + ";")
    A("")

    A("-- 6. 首页轮播广告")
    A("INSERT INTO litemall_ad (id,name,link,url,position,content,start_time,end_time,enabled,add_time,update_time,deleted) VALUES")
    A(",\n".join("(%d,%s,%s,%s,1,%s,'2025-01-01 00:00:00','2030-12-31 23:59:59',1,%s,%s,0)" % (
        i, q(n), q(link), q(IMG + url), q("鲜花订购与管理系统"), q(NOW), q(NOW))
        for i, (n, link, url) in enumerate(AD, start=1)) + ";")
    A("")

    A("-- 7. 专题（花礼清单 / 挑选指南 / 养护课堂）")
    A("INSERT INTO litemall_topic (id,title,subtitle,content,price,read_count,pic_url,sort_order,goods,add_time,update_time,deleted) VALUES")
    A(",\n".join("(%d,%s,%s,%s,%.2f,%s,%s,%d,%s,%s,%s,0)" % (
        i, q(t), q(sub), q(content), price, q("%dk" % (i * 2 + 3)), q(IMG + pic),
        10 + i * 10, jarr([str(g) for g in gs]), q(NOW), q(NOW))
        for (i, t, sub, pic, price, gs, content) in TOPICS) + ";")
    A("")

    A("-- 8. 优惠券")
    A("INSERT INTO litemall_coupon (id,name,`desc`,tag,total,discount,`min`,`limit`,type,status,goods_type,goods_value,code,time_type,days,start_time,end_time,add_time,update_time,deleted) VALUES")
    A(",\n".join("(%d,%s,%s,%s,%d,%.2f,%.2f,%d,%d,%d,%d,%s,%s,%d,%d,NULL,NULL,%s,%s,0)" % (
        i, q(n), q(d), q(tag), total, disc, mini, lim, typ, st, gt, q(gv), q(code), tt, days, q(NOW), q(NOW))
        for (i, n, d, tag, total, disc, mini, lim, typ, st, gt, gv, code, tt, days) in COUPONS) + ";")
    A("")

    A("-- 9. 搜索关键字")
    A("INSERT INTO litemall_keyword (id,keyword,url,is_hot,is_default,sort_order,add_time,update_time,deleted) VALUES")
    A(",\n".join("(%d,%s,'',%d,%d,%d,%s,%s,0)" % (i, q(kw), hot, dft, so, q(NOW), q(NOW))
                 for (i, code, kw, hot, dft, so) in KEYWORDS) + ";")
    A("")

    A("-- 10. 常见问题（养护/配送）")
    A("INSERT INTO litemall_issue (id,question,answer,add_time,update_time,deleted) VALUES")
    A(",\n".join("(%d,%s,%s,%s,%s,0)" % (i, q(qu), q(ans), q(NOW), q(NOW))
                 for (i, qu, ans) in ISSUES) + ";")
    A("")

    A("-- 11. 公告")
    A("INSERT INTO litemall_notice (id,title,content,admin_id,add_time,update_time,deleted) VALUES")
    A(",\n".join("(%d,%s,%s,0,%s,%s,0)" % (i, q(t), q(c), q(NOW), q(NOW))
                 for (i, t, c) in NOTICES) + ";")
    A("")

    A("-- 12. 团购（拼团）规则")
    A("INSERT INTO litemall_groupon_rules (id,goods_id,goods_name,pic_url,discount,discount_member,expire_time,status,add_time,update_time,deleted) VALUES")
    A(",\n".join("(%d,%d,%s,%s,%d,%d,%s,0,%s,%s,0)" % (
        i, gid, q(GOODS[gid - 1][0]), q(IMG + "goods_%03d.jpg" % (((gid - 1) % 48) + 1)),
        disc, member, q(exp), q(NOW), q(NOW)) for (i, gid, disc, member, exp) in GROUPON) + ";")
    A("")

    A("-- 13. 商品评价（示例）")
    A("INSERT INTO litemall_comment (id,value_id,type,content,admin_content,user_id,has_picture,pic_urls,star,add_time,update_time,deleted) VALUES")
    A(",\n".join(cm_rows) + ";")
    A("")

    A("-- 14. 演示会员账号（密码统一为 123456）")
    A("INSERT INTO litemall_user (id,username,password,gender,birthday,last_login_time,last_login_ip,user_level,nickname,mobile,avatar,weixin_openid,session_key,status,add_time,update_time,deleted) VALUES")
    users = []
    for i, nick in enumerate(["花小仙", "花小主", "花满楼"], start=1):
        users.append("(%d,%s,%s,%d,NULL,%s,'127.0.0.1',0,%s,%s,'',%s,'',0,%s,%s,0)" % (
            i, q("flower0%d" % i), q(PWD_123456), i % 2, q(NOW), q(nick),
            q("1380000000%d" % i), q("wx_openid_%d" % i), q(NOW), q(NOW)))
    A(",\n".join(users) + ";")
    A("")

    A("-- 15. 演示订单（待付款/待发货/已发货/已完成）")
    order_rows, og_rows = [], []
    for i, (uid, status, price, consignee, mobile, addr, label) in enumerate(ORDERS, start=1):
        sn = "20250601000%d" % i
        pay = "'2025-06-01 12:00:00'" if status > 101 else "NULL"
        ship = "'2025-06-02 09:30:00'" if status >= 301 else "NULL"
        ship_sn = q("SF1234567890%d" % i) if status >= 301 else "NULL"
        ship_ch = q("顺丰速运") if status >= 301 else "NULL"
        confirm = "'2025-06-03 18:00:00'" if status >= 401 else "NULL"
        endt = "'2025-06-04 18:00:00'" if status >= 401 else "NULL"
        msg = q("请在工作日 18:00 后送达")
        order_rows.append("(%d,%d,%s,%d,0,%s,%s,%s,%s,%.2f,0.00,0.00,0.00,0.00,%.2f,%.2f,'wx_pay_%d',%s,%s,%s,%s,NULL,NULL,NULL,NULL,%s,0,%s,%s,%s,0)" % (
            i, uid, q(sn), status, q(consignee), q(mobile), q(addr), msg,
            price, price, price, i, pay, ship_sn, ship_ch, ship, confirm, endt, q(NOW), q(NOW)))
        gid = [1, 2, 6, 4][i - 1]
        goods_name = GOODS[gid - 1][0]
        og_rows.append("(%d,%d,%d,%s,%s,%d,1,%.2f,%s,%s,0,%s,%s,0)" % (
            i, i, gid, q(goods_name), q("HX%04d" % gid),
            (i - 1) * 3 + 1, price, jarr(["标准版"]),
            q(IMG + "goods_%03d.jpg" % (((gid - 1) % 48) + 1)), q(NOW), q(NOW)))
    A("INSERT INTO litemall_order (id,user_id,order_sn,order_status,aftersale_status,consignee,mobile,address,message,goods_price,freight_price,coupon_price,integral_price,groupon_price,order_price,actual_price,pay_id,pay_time,ship_sn,ship_channel,ship_time,refund_amount,refund_type,refund_content,refund_time,confirm_time,comments,end_time,add_time,update_time,deleted) VALUES")
    A(",\n".join(order_rows) + ";")
    A("")
    A("INSERT INTO litemall_order_goods (id,order_id,goods_id,goods_name,goods_sn,product_id,number,price,specifications,pic_url,`comment`,add_time,update_time,deleted) VALUES")
    A(",\n".join(og_rows) + ";")
    A("")

    A("-- 16. 商城配置（名称、地址、运费、首页数量）")
    system = [
        ("litemall_mall_name", "花语鲜花商城"),
        ("litemall_mall_address", "广州市天河区花城大道 88 号花语花艺中心"),
        ("litemall_mall_phone", "400-888-6688"),
        ("litemall_mall_qq", "8008886688"),
        ("litemall_mall_latitude", "23.129100"),
        ("litemall_mall_longitude", "113.324500"),
        ("litemall_express_freight_min", "99"),
        ("litemall_express_freight_value", "12"),
        ("litemall_wx_index_new", "8"),
        ("litemall_wx_index_hot", "8"),
        ("litemall_wx_index_brand", "4"),
        ("litemall_wx_index_topic", "3"),
        ("litemall_wx_catlog_list", "4"),
        ("litemall_wx_catlog_goods", "4"),
        ("litemall_order_unpaid", "30"),
        ("litemall_order_unconfirm", "7"),
        ("litemall_order_comment", "7"),
        ("litemall_wx_share", "false"),
    ]
    for k, v in system:
        A("INSERT INTO litemall_system (key_name,key_value,add_time,update_time,deleted) "
          "SELECT %s,%s,%s,%s,0 FROM DUAL WHERE NOT EXISTS "
          "(SELECT 1 FROM litemall_system WHERE key_name=%s);" % (q(k), q(v), q(NOW), q(NOW), q(k)))
        A("UPDATE litemall_system SET key_value=%s, update_time=%s WHERE key_name=%s;" % (q(v), q(NOW), q(k)))
    A("")
    A("SET FOREIGN_KEY_CHECKS = 1;")
    A("-- 数据导入完成：8 个一级类目、20 个二级类目、50 款鲜花商品、3 个花艺品牌、4 张优惠券、4 条轮播、3 个专题")
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(L) + "\n")
    print("generated:", OUT, len(L), "lines")


if __name__ == "__main__":
    main()
