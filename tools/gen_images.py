# -*- coding: utf-8 -*-
"""
鲜花订购与管理系统 —— 图片资源生成脚本
生成：首页轮播图、类目图标、鲜花商品图、花坊(品牌)图、专题图、logo
输出目录：backend/litemall-all/src/main/resources/static/flower/
运行：python tools/gen_images.py
"""
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "backend", "litemall-all", "src", "main", "resources", "static", "flower")
os.makedirs(BASE, exist_ok=True)

FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_NORMAL = "C:/Windows/Fonts/msyh.ttc"
SS = 3  # 超采样倍数（抗锯齿）


def font(size, bold=True):
    try:
        return ImageFont.truetype(FONT_BOLD if bold else FONT_NORMAL, size)
    except Exception:
        return ImageFont.load_default()


def gradient(size, top, bottom):
    w, h = size
    img = Image.new("RGB", (w, h), top)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        d.line([(0, y), (w, y)], fill=c)
    return img


def bokeh(img, n, colors, rmin, rmax, alpha=70):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w, h = img.size
    for _ in range(n):
        r = random.randint(rmin, rmax)
        x, y = random.randint(0, w), random.randint(0, h)
        c = random.choice(colors)
        d.ellipse([x - r, y - r, x + r, y + r], fill=c + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(max(6, img.size[0] // 60)))
    return Image.alpha_composite(img.convert("RGBA"), layer)


def ell_points(cx, cy, rx, ry, ang=0.0, n=40):
    pts = []
    ca, sa = math.cos(ang), math.sin(ang)
    for i in range(n):
        t = 2 * math.pi * i / n
        x = rx * math.cos(t)
        y = ry * math.sin(t)
        pts.append((cx + x * ca - y * sa, cy + x * sa + y * ca))
    return pts


def shade(color, k):
    return tuple(max(0, min(255, int(c * k))) for c in color)


def bloom(d, cx, cy, r, base, deep=None, petals=8, rot=0.0, rings=2):
    deep = deep or shade(base, 0.72)
    for ring in range(rings, 0, -1):
        rr = r * (0.45 + 0.55 * ring / rings)
        col = base if ring == rings else tuple(
            int(base[i] + (deep[i] - base[i]) * (1 - ring / rings) * 0.85) for i in range(3))
        n = petals + (rings - ring) * 2
        for i in range(n):
            ang = rot + 2 * math.pi * i / n + (0.0 if ring % 2 == 0 else math.pi / n)
            px = cx + math.cos(ang) * rr * 0.48
            py = cy + math.sin(ang) * rr * 0.48
            d.polygon(ell_points(px, py, rr * 0.52, rr * 0.3, ang), fill=col)
    cr = r * 0.24
    d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=shade(deep, 0.85))
    for i in range(6):
        a = 2 * math.pi * i / 6
        x = cx + math.cos(a) * cr * 0.5
        y = cy + math.sin(a) * cr * 0.5
        d.ellipse([x - cr * 0.16, y - cr * 0.16, x + cr * 0.16, y + cr * 0.16],
                  fill=shade(deep, 1.25))


PALETTES = [
    ((226, 62, 92), (168, 22, 58)),
    ((255, 176, 196), (222, 108, 137)),
    ((255, 209, 179), (231, 148, 116)),
    ((255, 232, 240), (236, 186, 202)),
    ((243, 182, 214), (203, 118, 168)),
    ((255, 190, 120), (226, 132, 58)),
    ((255, 214, 88), (214, 158, 24)),
    ((176, 196, 246), (110, 140, 210)),
]


def stem_and_leaf(d, x0, y0, x1, y1, green=(90, 140, 84)):
    d.line([(x0, y0), (x1, y1)], fill=green, width=6)
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    ang = math.atan2(y1 - y0, x1 - x0)
    for s in (-1, 1):
        d.polygon(ell_points(mx, my, 26, 11, ang + s * 0.9), fill=shade(green, 1.12))


def save_jpg(img, path, quality=90):
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    img.convert("RGB").save(path, quality=quality)


def bouquet(size, seed, bg_top, bg_bottom, n_flower=None):
    rnd = random.Random(seed)
    w, h = size
    img = gradient((w, h), bg_top, bg_bottom)
    img = bokeh(img, 14, [(255, 255, 255), (255, 210, 225), (250, 230, 240)], 20, 90, 60)
    big = img.resize((w * SS, h * SS), Image.LANCZOS)
    d = ImageDraw.Draw(big, "RGBA")
    S = SS

    n = n_flower or rnd.randint(5, 8)
    base_y = h * 0.86 * S
    center_x = w * 0.5 * S
    wrap_top = h * 0.44 * S
    fold = rnd.choice([(255, 250, 244), (252, 240, 235), (250, 236, 240)])
    d.polygon([(center_x - w * 0.30 * S, wrap_top),
               (center_x + w * 0.30 * S, wrap_top),
               (center_x + w * 0.19 * S, base_y),
               (center_x - w * 0.19 * S, base_y)], fill=fold + (255,))
    d.polygon([(center_x - w * 0.30 * S, wrap_top),
               (center_x - w * 0.10 * S, base_y),
               (center_x - w * 0.19 * S, base_y)], fill=(238, 225, 222, 255))
    d.polygon([(center_x - w * 0.15 * S, base_y - h * 0.10 * S),
               (center_x + w * 0.15 * S, base_y - h * 0.12 * S),
               (center_x + w * 0.13 * S, base_y - h * 0.06 * S),
               (center_x - w * 0.13 * S, base_y - h * 0.04 * S)],
              fill=(216, 154, 160, 255))

    slots = []
    for i in range(n):
        ang = -math.pi * 0.92 + math.pi * 0.84 * (i / max(1, n - 1))
        rad = w * (0.16 + 0.10 * rnd.random()) * S
        cx = center_x + math.cos(ang) * rad * 1.25
        cy = wrap_top - h * (0.02 + 0.16 * rnd.random()) * S + math.sin(ang) * rad * 0.35
        slots.append((cx, cy))
    for cx, cy in slots:
        stem_and_leaf(d, center_x + rnd.uniform(-10, 10) * S, base_y - h * 0.05 * S, cx, cy)
    for _ in range(rnd.randint(6, 12)):
        cx = center_x + rnd.uniform(-0.32, 0.32) * w * S
        cy = wrap_top - h * rnd.uniform(0.02, 0.30) * S
        rr = w * rnd.uniform(0.016, 0.030) * S
        c = rnd.choice([(255, 255, 255), (255, 226, 236), (250, 210, 160)])
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=c + (235,))
    for k, (cx, cy) in enumerate(slots):
        base, deep = PALETTES[(seed + k * 3) % len(PALETTES)]
        r = w * rnd.uniform(0.095, 0.135) * S
        bloom(d, cx, cy, r, base, deep, petals=rnd.choice([6, 7, 8, 9]), rot=rnd.uniform(0, 1))

    return big.resize((w, h), Image.LANCZOS)


def rounded_panel(d, box, radius, fill):
    d.rounded_rectangle(box, radius=radius, fill=fill)


def banner(no, title, sub, tag, top, bottom, seed):
    w, h = 750, 400
    img = gradient((w, h), top, bottom)
    img = bokeh(img, 18, [(255, 255, 255), (255, 220, 232)], 30, 130, 55)
    big = img.resize((w * SS, h * SS), Image.LANCZOS)
    d = ImageDraw.Draw(big, "RGBA")
    S = SS
    for i in range(5):
        cx = w * (0.70 + 0.075 * i) * S
        cy = h * (0.30 + 0.13 * (i % 3)) * S
        base, deep = PALETTES[(seed + i) % len(PALETTES)]
        bloom(d, cx, cy, w * (0.055 + 0.012 * (i % 3)) * S, base, deep, petals=7, rot=i)
    for i in range(4):
        stem_and_leaf(d, w * 0.78 * S, h * 1.02 * S,
                      w * (0.66 + 0.11 * i) * S, h * (0.30 + 0.14 * i) * S, (96, 142, 88))
    d.text((w * 0.07 * S, h * 0.20 * S), title, font=font(64 * S), fill=(78, 40, 52))
    d.text((w * 0.075 * S, h * 0.42 * S), sub, font=font(30 * S, False), fill=(126, 84, 96))
    tw = d.textlength(tag, font=font(28 * S))
    rounded_panel(d, (w * 0.075 * S, h * 0.60 * S, w * 0.075 * S + tw + 44 * S, h * 0.70 * S),
                  20 * S, (255, 255, 255, 220))
    d.text((w * 0.075 * S + 22 * S, h * 0.615 * S), tag, font=font(28 * S), fill=(198, 74, 104))
    save_jpg(big.resize((w, h), Image.LANCZOS), os.path.join(BASE, "banner_%d.jpg" % no))


def icon(no, seed):
    size = 120
    img = Image.new("RGBA", (size * SS, size * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    base, deep = PALETTES[seed % len(PALETTES)]
    d.ellipse([10 * SS, 10 * SS, 110 * SS, 110 * SS], fill=(255, 249, 250, 255))
    bloom(d, 60 * SS, 62 * SS, 38 * SS, base, deep, petals=7, rot=seed)
    d.line([(60 * SS, 92 * SS), (60 * SS, 112 * SS)], fill=(104, 150, 96), width=4 * SS)
    img.resize((size, size), Image.LANCZOS).save(os.path.join(BASE, "icon_%d.png" % no))


def goods(no, seed, top, bottom):
    save_jpg(bouquet((500, 500), seed, top, bottom),
             os.path.join(BASE, "goods_%03d.jpg" % no), 88)


def brand(no, name, seed):
    size = 400
    img = gradient((size, size), (255, 250, 248), (250, 232, 238))
    img = bokeh(img, 10, [(255, 255, 255)], 30, 90, 90)
    big = img.resize((size * SS, size * SS), Image.LANCZOS)
    d = ImageDraw.Draw(big, "RGBA")
    base, deep = PALETTES[seed % len(PALETTES)]
    d.ellipse([70 * SS, 60 * SS, 330 * SS, 320 * SS], fill=(255, 255, 255, 200))
    bloom(d, 200 * SS, 170 * SS, 78 * SS, base, deep, petals=8, rot=seed)
    d.line([(200 * SS, 240 * SS), (200 * SS, 300 * SS)], fill=(104, 150, 96), width=6 * SS)
    tw = d.textlength(name, font=font(42 * SS))
    d.text(((400 * SS - tw) / 2, 316 * SS), name, font=font(42 * SS), fill=(120, 66, 84))
    save_jpg(big.resize((size, size), Image.LANCZOS), os.path.join(BASE, "brand_%d.jpg" % no))


def topic(no, title, sub, seed, top, bottom):
    w, h = 400, 520
    img = bouquet((w, h), seed, top, bottom)
    big = img.resize((w * SS, h * SS), Image.LANCZOS)
    d = ImageDraw.Draw(big, "RGBA")
    d.rectangle([0, h * 0.74 * SS, w * SS, h * SS], fill=(255, 255, 255, 205))
    d.text((24 * SS, h * 0.765 * SS), title, font=font(34 * SS), fill=(120, 66, 84))
    d.text((24 * SS, h * 0.855 * SS), sub, font=font(22 * SS, False), fill=(150, 110, 122))
    save_jpg(big.resize((w, h), Image.LANCZOS), os.path.join(BASE, "topic_%d.jpg" % no))


def logo():
    size = 240
    img = Image.new("RGBA", (size * SS, size * SS), (255, 255, 255, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([6 * SS, 6 * SS, 234 * SS, 234 * SS], fill=(255, 245, 247, 255))
    bloom(d, 120 * SS, 112 * SS, 74 * SS, (232, 82, 112), (170, 30, 62), petals=8, rot=0.3)
    d.line([(120 * SS, 168 * SS), (120 * SS, 216 * SS)], fill=(104, 150, 96), width=10 * SS)
    img.resize((size, size), Image.LANCZOS).save(os.path.join(BASE, "logo.png"))


def main():
    random.seed(2024)
    banners = [
        ("鲜花速递", "同城 2 小时送达 · 新鲜直达", "立即选购 >", (255, 238, 242), (250, 214, 226), 3),
        ("生日花束", "把祝福包进花里", "生日专区 >", (253, 243, 234), (248, 226, 208), 5),
        ("爱情表白", "以花为证 · 一生一诺", "浪漫专场 >", (255, 235, 238), (246, 205, 214), 1),
        ("花艺课程", "插花体验 · 周末开课", "预约报名 >", (243, 247, 240), (222, 236, 220), 7),
    ]
    for i, (t, s, tag, top, bot, seed) in enumerate(banners, 1):
        banner(i, t, s, tag, top, bot, seed)

    for i in range(1, 9):
        icon(i, i - 1)

    tops = [(255, 246, 248), (255, 250, 244), (250, 246, 255), (255, 245, 240),
            (244, 250, 246), (255, 243, 246)]
    bots = [(250, 224, 232), (252, 235, 220), (238, 230, 248), (250, 228, 216),
            (226, 242, 232), (248, 222, 232)]
    for i in range(1, 49):
        goods(i, i, tops[i % len(tops)], bots[i % len(bots)])

    for i, n in enumerate(["花语工坊", "四季花园", "臻爱花艺", "拾光花房"], 1):
        brand(i, n, seed=i)

    topics = [("情人节 · 花礼清单", "12 款表白花束", 1, (255, 236, 240), (246, 206, 218)),
              ("生日花束挑选指南", "按性格送对花", 3, (255, 246, 236), (250, 226, 206)),
              ("鲜花养护小课堂", "让花期延长一倍", 7, (244, 250, 244), (226, 240, 228))]
    for i, (t, s, seed, top, bot) in enumerate(topics, 1):
        topic(i, t, s, seed, top, bot)

    logo()
    n = len([f for f in os.listdir(BASE) if f.endswith((".jpg", ".png"))])
    print("done, %d images -> %s" % (n, BASE))


if __name__ == "__main__":
    main()
