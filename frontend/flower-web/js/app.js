/* ============================================================
   花语鲜花商城 · 网页版客户端（原生 JS 单页应用，无需构建）
   鲜花订购与管理系统 —— 用户端网页版
   功能：首页 / 鲜花分类 / 搜索 / 详情 / 购物车 / 结算下单 /
        订单管理 / 收货地址 / 优惠券 / 会员中心
   ============================================================ */
(function () {
  'use strict';

  var API = window.API;

  /* ---------------------------------------------------------- 基础工具 */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(v) {
    return String(v === undefined || v === null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(v) { return Number(v || 0).toFixed(2); }
  function img(url, fallback) {
    return esc(url || fallback || '/flower/goods_001.jpg');
  }

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2000);
  }

  function go(hash) {
    if (location.hash === hash) {
      route();
    } else {
      location.hash = hash;
    }
  }

  function needLogin() {
    if (API.token.get()) return false;
    toast('请先登录');
    go('#/login?redirect=' + encodeURIComponent(location.hash || '#/'));
    return true;
  }

  function parseHash() {
    var raw = (location.hash || '#/').replace(/^#/, '');
    var idx = raw.indexOf('?');
    var path = idx >= 0 ? raw.slice(0, idx) : raw;
    var query = {};
    if (idx >= 0) {
      raw.slice(idx + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
      });
    }
    if (!path) path = '/';
    return { path: path, query: query };
  }

  function loading() { $('#main').innerHTML = '<div class="loading">花艺师正在准备…</div>'; }
  function empty(text, extra) {
    return '<div class="empty">' + esc(text) + (extra || '') + '</div>';
  }

  var state = {
    cartCount: 0,
    catalogAll: null,
    checkout: null,
    detail: null
  };

  /* ---------------------------------------------------------- 顶栏 / 底部导航 */
  function renderShell() {
    var user = API.token.user();
    var keyword = (state.keyword || '');
    $('#header').innerHTML = ''
      + '<div class="header-inner">'
      + '  <a class="logo" href="#/">'
      + '    <img src="/flower/logo.png" alt="花语鲜花商城">'
      + '    <div><div class="name">花语鲜花商城</div><div class="slogan">鲜花订购与管理系统</div></div>'
      + '  </a>'
      + '  <nav class="header-nav">'
      + '    <a href="#/" data-nav="/">首页</a>'
      + '    <a href="#/goods" data-nav="/goods">全部鲜花</a>'
      + '    <a href="#/coupon" data-nav="/coupon">优惠券</a>'
      + '    <a href="#/about" data-nav="/about">花店介绍</a>'
      + '  </nav>'
      + '  <form class="header-search" data-act="search-form">'
      + '    <input name="keyword" type="search" placeholder="搜索玫瑰 / 百合 / 生日花束…" value="' + esc(keyword) + '">'
      + '    <button type="submit">搜索</button>'
      + '  </form>'
      + '  <div class="header-actions">'
      + '    <a href="#/cart"><span>🛒</span><span class="text">购物车</span><span class="badge" id="cart-badge" hidden>0</span></a>'
      + (user
        ? '<a href="#/me"><span>👤</span><span class="text">' + esc(user.nickName || '我的') + '</span></a>'
        : '<a href="#/login"><span>👤</span><span class="text">登录</span></a>')
      + '  </div>'
      + '</div>';

    $('#mobile-nav').innerHTML = ''
      + '<a href="#/" data-nav="/"><span class="ico">🏠</span>首页</a>'
      + '<a href="#/goods" data-nav="/goods"><span class="ico">💐</span>分类</a>'
      + '<a href="#/cart" data-nav="/cart"><span class="ico">🛒</span>购物车</a>'
      + '<a href="#/orders" data-nav="/orders"><span class="ico">📦</span>订单</a>'
      + '<a href="#/me" data-nav="/me"><span class="ico">👤</span>我的</a>';

    updateBadge();
  }

  function updateBadge() {
    var b = $('#cart-badge');
    if (!b) return;
    if (state.cartCount > 0) {
      b.hidden = false;
      b.textContent = state.cartCount > 99 ? '99+' : state.cartCount;
    } else {
      b.hidden = true;
    }
  }

  function syncCart() {
    if (!API.token.get()) { state.cartCount = 0; updateBadge(); return Promise.resolve(); }
    return API.cartCount().then(function (n) {
      state.cartCount = Number(n || 0);
      updateBadge();
    }).catch(function () { /* 未登录或接口异常时忽略 */ });
  }

  function markNav(path) {
    $$('[data-nav]').forEach(function (a) {
      var target = a.getAttribute('data-nav');
      var on = (target === '/')
        ? (path === '/')
        : (path === target || path.indexOf(target + '/') === 0);
      a.classList.toggle('on', on);
      a.classList.toggle('active', on && !!a.parentNode.classList.contains('header-nav'));
    });
  }

  /* ---------------------------------------------------------- 通用片段 */
  function goodsCard(g) {
    return ''
      + '<a class="goods-card" href="#/detail/' + g.id + '">'
      + '  <div class="thumb">'
      + '    <img src="' + img(g.picUrl) + '" alt="' + esc(g.name) + '" loading="lazy" onerror="this.src=\'/flower/goods_001.jpg\'">'
      + (g.isNew ? '<span class="tag">新花</span>' : (g.isHot ? '<span class="tag">热销</span>' : ''))
      + '  </div>'
      + '  <div class="body">'
      + '    <div class="title">' + esc(g.name) + '</div>'
      + '    <div class="brief">' + esc(g.brief || '') + '</div>'
      + '    <div class="price-row">'
      + '      <span class="price"><small>¥</small>' + money(g.retailPrice) + '</span>'
      + (Number(g.counterPrice) > Number(g.retailPrice)
        ? '<span class="origin">¥' + money(g.counterPrice) + '</span>' : '')
      + '    </div>'
      + '  </div>'
      + '</a>';
  }

  function goodsGrid(list) {
    if (!list || !list.length) return empty('暂无鲜花，换个类目看看吧～');
    return '<div class="goods-grid">' + list.map(goodsCard).join('') + '</div>';
  }

  function sectionHead(title, sub, moreText, moreHref) {
    return '<div class="section-head"><h2>' + esc(title) + '</h2>'
      + (sub ? '<span class="sub">' + esc(sub) + '</span>' : '')
      + (moreHref ? '<a class="more" href="' + moreHref + '">' + esc(moreText || '查看更多') + ' →</a>' : '')
      + '</div>';
  }

  /* ---------------------------------------------------------- 首页 */
  var heroTimer = null;

  function viewHome() {
    loading();
    return API.home().then(function (d) {
      var banners = d.banner || [];
      var channels = d.channel || [];
      var coupons = d.couponList || [];
      var hot = d.hotGoodsList || [];
      var news = d.newGoodsList || [];
      var brands = d.brandList || [];
      var topics = d.topicList || [];
      var floors = d.floorGoodsList || [];

      var html = '';
      /* 轮播 */
      html += '<div class="hero" id="hero">';
      banners.forEach(function (b, i) {
        html += '<a class="hero-slide' + (i === 0 ? ' active' : '') + '" href="' + (b.link ? '#/detail/' + b.link : '#/goods') + '">'
          + '<img src="' + img(b.url) + '" alt="' + esc(b.name) + '"></a>';
      });
      html += '<div class="hero-dots">' + banners.map(function (b, i) {
        return '<span class="' + (i === 0 ? 'on' : '') + '" data-act="hero-dot" data-i="' + i + '"></span>';
      }).join('') + '</div></div>';

      /* 配送承诺 */
      html += '<div class="channels" style="margin-top:16px">';
      html += '<div class="channel"><img src="/flower/icon_1.png" alt=""><span>同城2小时达</span></div>';
      html += '<div class="channel"><img src="/flower/icon_2.png" alt=""><span>花材当日直采</span></div>';
      html += '<div class="channel"><img src="/flower/icon_3.png" alt=""><span>花艺师手作</span></div>';
      html += '<div class="channel"><img src="/flower/icon_4.png" alt=""><span>免费贺卡</span></div>';
      html += '</div>';

      /* 类目入口 */
      html += '<div class="section">' + sectionHead('鲜花分类', '按花材与场景挑选') ;
      html += '<div class="channels">' + channels.map(function (c) {
        return '<a class="channel" href="#/goods?categoryId=' + c.id + '">'
          + '<img src="' + img(c.iconUrl, '/flower/icon_1.png') + '" alt="' + esc(c.name) + '">'
          + '<span>' + esc(c.name) + '</span></a>';
      }).join('') + '</div></div>';

      /* 优惠券 */
      if (coupons.length) {
        html += '<div class="section">' + sectionHead('领券中心', '领取后下单立减', '全部优惠券', '#/coupon');
        html += '<div class="coupon-strip">' + coupons.map(function (c) {
          return '<div class="coupon-card">'
            + '<div class="amount">' + money(c.discount) + '<small>元</small></div>'
            + '<div class="info"><b>' + esc(c.name) + '</b><span>满 ' + money(c.min) + ' 元可用 · ' + esc(c.tag || '') + '</span></div>'
            + '<button data-act="receive-coupon" data-id="' + c.id + '">领取</button>'
            + '</div>';
        }).join('') + '</div></div>';
      }

      /* 人气推荐 */
      if (hot.length) {
        html += '<div class="section">' + sectionHead('人气鲜花', '花友回购榜', '更多热销', '#/goods?isHot=1');
        html += goodsGrid(hot.slice(0, 8)) + '</div>';
      }

      /* 新品 */
      if (news.length) {
        html += '<div class="section">' + sectionHead('本周新花', '每周一上新', '更多新品', '#/goods?isNew=1');
        html += goodsGrid(news.slice(0, 8)) + '</div>';
      }

      /* 花艺品牌 */
      if (brands.length) {
        html += '<div class="section">' + sectionHead('花艺品牌', '城中花坊联合出品');
        html += '<div class="brand-grid">' + brands.map(function (b) {
          return '<a class="brand-card" href="#/goods?brandId=' + b.id + '">'
            + '<img src="' + img(b.picUrl, '/flower/brand_1.jpg') + '" alt="' + esc(b.name) + '">'
            + '<b>' + esc(b.name) + '</b><span>' + esc(b.desc || '') + '</span>'
            + '<span class="floor">¥' + money(b.floorPrice) + ' 起</span></a>';
        }).join('') + '</div></div>';
      }

      /* 专题 */
      if (topics.length) {
        html += '<div class="section">' + sectionHead('花艺专题', '送给对的人');
        html += '<div class="topic-grid">' + topics.map(function (t) {
          return '<a class="topic-card" href="#/topic/' + t.id + '">'
            + '<img src="' + img(t.picUrl, '/flower/topic_1.jpg') + '" alt="' + esc(t.title) + '">'
            + '<div class="cap"><b>' + esc(t.title) + '</b><span>' + esc(t.subtitle || '') + '</span></div></a>';
        }).join('') + '</div></div>';
      }

      /* 分类楼层 */
      floors.forEach(function (f) {
        if (!f.goodsList || !f.goodsList.length) return;
        html += '<div class="section">' + sectionHead(f.name, '', '查看全部', '#/goods?categoryId=' + f.id);
        html += goodsGrid(f.goodsList.slice(0, 4)) + '</div>';
      });

      $('#main').innerHTML = html;
      startHero(banners.length);
    }).catch(function (e) {
      $('#main').innerHTML = empty('首页加载失败：' + e.message);
    });
  }

  function startHero(total) {
    clearInterval(heroTimer);
    if (total <= 1) return;
    var i = 0;
    heroTimer = setInterval(function () { heroDot((i + 1) % total); i = (i + 1) % total; }, 4000);
  }

  function heroDot(i) {
    $$('.hero-slide').forEach(function (el, k) { el.classList.toggle('active', k === i); });
    $$('.hero-dots span').forEach(function (el, k) { el.classList.toggle('on', k === i); });
  }

  /* ---------------------------------------------------------- 鲜花列表 / 分类 */
  function loadCatalogAll() {
    if (state.catalogAll) return Promise.resolve(state.catalogAll);
    return API.catalogAll().then(function (d) {
      state.catalogAll = d;
      return d;
    }).catch(function () { return {}; });
  }

  function viewGoodsList(q) {
    loading();
    var page = Number(q.page || 1);
    var params = {
      categoryId: q.categoryId || '',
      brandId: q.brandId || '',
      keyword: q.keyword || '',
      isNew: q.isNew || '',
      isHot: q.isHot || '',
      page: page,
      limit: 12,
      sort: q.sort || 'default',
      order: q.order || 'desc'
    };
    /* 后端排序只接受数据库字段（add_time / retail_price），综合排序时不传参 */
    if (!params.sort || params.sort === 'default') {
      delete params.sort;
      delete params.order;
    }

    return Promise.all([loadCatalogAll(), API.goodsList(params)]).then(function (res) {
      var all = res[0] || {};
      var data = res[1] || {};
      var list = data.list || [];
      var total = data.total || 0;
      var pages = data.pages || 1;
      var l1List = (all.categoryList || []);
      var allList = (all.allList || {});
      var currentIds = {}; /* L1/L2 选中态 */
      if (params.categoryId) currentIds[String(params.categoryId)] = true;
      /* 若选中的是二级类目，其父类目也高亮 */
      l1List.forEach(function (c1) {
        var children = allList[String(c1.id)] || [];
        children.forEach(function (c2) { if (String(c2.id) === String(params.categoryId)) currentIds[String(c1.id)] = true; });
      });

      var html = '';
      html += '<div class="crumb"><a href="#/">首页</a> / ' + (params.keyword ? '搜索：' + esc(params.keyword) : (params.isNew ? '新品首发' : (params.isHot ? '人气鲜花' : '全部鲜花'))) + '</div>';
      html += '<div class="list-layout">';

      /* 左侧分类 */
      html += '<aside class="side-card"><h3>鲜花类目</h3>';
      html += '<div class="side-group"><a href="#/goods" class="' + (!params.categoryId && !params.isNew && !params.isHot && !params.keyword ? 'on' : '') + '">全部鲜花</a></div>';
      l1List.forEach(function (c1) {
        var children = allList[String(c1.id)] || [];
        var on = !!currentIds[String(c1.id)];
        html += '<div class="side-group">'
          + '<a class="' + (on ? 'on' : '') + '" href="#/goods?categoryId=' + c1.id + '">' + esc(c1.name) + '</a>'
          + (children.length ? '<div class="children">' + children.map(function (c2) {
            return '<a class="' + (String(c2.id) === String(params.categoryId) ? 'on' : '') + '" href="#/goods?categoryId=' + c2.id + '">' + esc(c2.name) + '</a>';
          }).join('') + '</div>' : '')
          + '</div>';
      });
      html += '<div class="side-group"><a class="' + (params.isNew ? 'on' : '') + '" href="#/goods?isNew=1">新品首发</a>'
        + '<a class="' + (params.isHot ? 'on' : '') + '" href="#/goods?isHot=1">人气热销</a></div>';
      html += '</aside>';

      /* 右侧列表 */
      html += '<section>';
      html += '<div class="list-toolbar">';
      var sorts = [
        { k: 'default', t: '综合排序' },
        { k: 'retail_price', o: 'asc', t: '价格从低到高' },
        { k: 'retail_price', o: 'desc', t: '价格从高到低' },
        { k: 'add_time', o: 'desc', t: '最新上架' }
      ];
      sorts.forEach(function (s) {
        var on = (params.sort === s.k) && ((s.o || '') === (params.sort === 'default' ? '' : (params.order || 'desc')));
        if (s.k === 'default' && params.sort === 'default') on = true;
        html += '<button class="chip' + (on ? ' on' : '') + '" data-act="sort" data-sort="' + s.k + '" data-order="' + (s.o || 'desc') + '">' + s.t + '</button>';
      });
      html += '<span class="count">共 ' + total + ' 款鲜花</span></div>';

      html += goodsGrid(list);

      if (pages > 1) {
        html += '<div class="pager">';
        for (var i = 1; i <= pages && i <= 12; i++) {
          var href = '#/goods?' + Object.keys(params).filter(function (k) {
            return params[k] !== '' && k !== 'page' && k !== 'limit';
          }).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
          href += (href.indexOf('?') >= 0 ? '&' : '?') + 'page=' + i;
          html += '<button class="' + (i === page ? 'on' : '') + '" data-act="goto" data-url="' + href + '">' + i + '</button>';
        }
        html += '</div>';
      }
      html += '</section></div>';

      $('#main').innerHTML = html;
    }).catch(function (e) {
      $('#main').innerHTML = empty('加载失败：' + e.message);
    });
  }

  /* ---------------------------------------------------------- 鲜花详情 */
  function viewDetail(id) {
    loading();
    state.detail = { spec: {}, number: 1, product: null };
    return API.goodsDetail(id).then(function (d) {
      var g = d.info;
      var gallery = [];
      try { gallery = JSON.parse(g.gallery || '[]'); } catch (e) { gallery = []; }
      if (!gallery.length) gallery = [g.picUrl];
      var specs = d.specificationList || [];
      var products = d.productList || [];
      var attrs = d.attribute || [];
      var issues = d.issue || [];
      var comment = d.comment || { count: 0, data: [] };
      state.detail.goods = g;
      state.detail.products = products;
      state.detail.specs = specs;

      /* 默认选中第一个可用规格 */
      var firstVals = specs.map(function (s) { return s.valueList[0].value; });
      state.detail.spec = {};
      specs.forEach(function (s, i) { state.detail.spec[s.name] = firstVals[i]; });
      state.detail.product = pickProduct();

      var html = '';
      html += '<div class="crumb"><a href="#/">首页</a> / <a href="#/goods?categoryId=' + g.categoryId + '">鲜花</a> / ' + esc(g.name) + '</div>';
      html += '<div class="detail-layout">';

      /* 图 */
      html += '<div><div class="gallery-main"><img id="main-img" src="' + img(gallery[0]) + '" alt="' + esc(g.name) + '"></div>';
      if (gallery.length > 1) {
        html += '<div class="gallery-thumbs">' + gallery.slice(0, 5).map(function (u, i) {
          return '<img class="' + (i === 0 ? 'on' : '') + '" src="' + img(u) + '" data-act="thumb" data-src="' + esc(u) + '">';
        }).join('') + '</div>';
      }
      html += '</div>';

      /* 信息 */
      html += '<div>';
      html += '<h1 class="detail-title">' + esc(g.name) + '</h1>';
      html += '<div class="detail-brief">' + esc(g.brief || '') + ' · 单位：' + esc(g.unit || '束') + '</div>';
      html += '<div class="price-box">'
        + '<span class="now"><small>¥</small>' + money(g.retailPrice) + '</span>'
        + (Number(g.counterPrice) > Number(g.retailPrice) ? '<span class="old">¥' + money(g.counterPrice) + '</span>' : '')
        + '<span class="sold">已售 ' + (comment.count ? comment.count * 3 + 12 : 12) + ' 束</span>'
        + '</div>';

      specs.forEach(function (s) {
        html += '<div class="opt-row"><div class="label">' + esc(s.name) + '</div><div class="opts">';
        s.valueList.forEach(function (v, i) {
          html += '<button class="opt' + (i === 0 ? ' on' : '') + '" data-act="spec" data-name="' + esc(s.name) + '" data-value="' + esc(v.value) + '">'
            + esc(v.value) + '</button>';
        });
        html += '</div></div>';
      });

      html += '<div class="opt-row"><div class="label">数量</div><div class="opts">'
        + '<div class="qty"><button data-act="num" data-v="-1">−</button>'
        + '<input id="num-input" type="number" min="1" value="1" readonly>'
        + '<button data-act="num" data-v="1">+</button></div>'
        + '<span class="stock" id="stock-tip" style="font-size:12px;color:#7c6b72;line-height:32px"></span>'
        + '</div></div>';

      html += '<div class="detail-actions">'
        + '<button class="btn ghost" data-act="add-cart">加入购物车</button>'
        + '<button class="btn" data-act="buy-now">立即购买</button>'
        + '</div>';

      html += '</div></div>';

      /* 详情 / 参数 / 评价 */
      html += '<div class="tabs">'
        + '<button class="on" data-act="tab" data-tab="0">花语详情</button>'
        + '<button data-act="tab" data-tab="1">商品参数</button>'
        + '<button data-act="tab" data-tab="2">用户评价（' + (comment.count || 0) + '）</button>'
        + '</div>';

      html += '<div class="tab-panel" id="tab-0">' + (g.detail || '<p>暂无详情</p>') + '</div>';

      var attrHtml = '<table class="attr-table">';
      attrs.forEach(function (a) {
        attrHtml += '<tr><td>' + esc(a.attribute) + '</td><td>' + esc(a.value) + '</td></tr>';
      });
      attrHtml += '</table>';
      if (issues.length) {
        attrHtml += '<h4 style="margin:20px 0 10px;font-size:14px">常见问题</h4>';
        issues.forEach(function (it) {
          attrHtml += '<p style="font-size:13px;color:#7c6b72;line-height:1.8"><b style="color:#43333a">Q：</b>'
            + esc(it.question) + '<br><b style="color:#43333a">A：</b>' + esc(it.answer) + '</p>';
        });
      }
      html += '<div class="tab-panel" id="tab-1" hidden>' + attrHtml + '</div>';

      var cm = comment.data || [];
      var cmHtml = cm.length ? cm.map(function (c) {
        var who = c.nickname ? c.nickname : '花友';
        return '<div class="comment-item">'
          + '<div class="who"><span class="avatar">' + esc(who.slice(0, 1)) + '</span>'
          + esc(who) + '<span class="star">' + '★'.repeat(c.star || 5) + '</span>'
          + '<span style="margin-left:auto">' + esc((c.addTime || '').slice(0, 10)) + '</span></div>'
          + '<p>' + esc(c.content) + '</p>'
          + (c.adminContent ? '<div class="admin">花艺师回复：' + esc(c.adminContent) + '</div>' : '')
          + '</div>';
      }).join('') : '<div class="empty">还没有评价，快来做第一个花友～</div>';
      html += '<div class="tab-panel" id="tab-2" hidden>' + cmHtml + '</div>';

      /* 相关推荐 */
      $('#main').innerHTML = html;
      updateStockTip();

      return API.goodsRelated(id).then(function (r) {
        var rel = (r.list || []).filter(function (x) { return String(x.id) !== String(id); });
        if (rel.length) {
          var box = document.createElement('div');
          box.className = 'section';
          box.innerHTML = sectionHead('看了又看', '同款花材推荐') + goodsGrid(rel.slice(0, 4));
          $('#main').appendChild(box);
        }
      }).catch(function () { });
    }).catch(function (e) {
      $('#main').innerHTML = empty('鲜花详情加载失败：' + e.message);
    });
  }

  function pickProduct() {
    var d = state.detail;
    var chosen = Object.keys(d.spec).map(function (k) { return d.spec[k]; }).sort();
    var hit = null;
    (d.productList || []).forEach(function (p) {
      var vals = (p.specifications || []).slice().sort();
      if (vals.length === chosen.length && vals.every(function (v, i) { return v === chosen[i]; })) hit = p;
    });
    return hit || (d.productList || [])[0] || null;
  }

  function updateStockTip() {
    var p = state.detail && state.detail.product;
    var tip = $('#stock-tip');
    if (tip && p) tip.textContent = '库存 ' + p.number + ' 件 · ¥' + money(p.price);
  }

  /* ---------------------------------------------------------- 购物车 */
  function viewCart() {
    if (needLogin()) return;
    loading();
    API.cartIndex().then(function (d) {
      var list = d.cartList || [];
      var total = d.cartTotal || {};
      if (!list.length) {
        $('#main').innerHTML = empty('购物车还是空的，去挑一束鲜花吧～',
          '<div style="margin-top:18px"><a class="btn" href="#/goods">去逛逛</a></div>');
        return;
      }
      var html = '<div class="section-head"><h2>我的购物车</h2><span class="sub">共 ' + (total.goodsCount || 0) + ' 件</span></div>';
      html += '<div class="cart-layout"><div class="cart-table">';
      list.forEach(function (c) {
        var spec = '';
        try {
          var arr = JSON.parse(c.specifications || '[]');
          if (Array.isArray(arr)) spec = arr.join(' / ');
        } catch (e) { spec = c.specifications || ''; }
        html += '<div class="cart-row">'
          + '<input class="checkbox" type="checkbox" data-act="cart-check" data-id="' + c.id + '" data-product="' + c.productId + '" ' + (c.checked ? 'checked' : '') + '>'
          + '<a href="#/detail/' + c.goodsId + '"><img class="thumb" src="' + img(c.picUrl) + '" alt=""></a>'
          + '<div class="info"><a class="name" href="#/detail/' + c.goodsId + '">' + esc(c.goodsName) + '</a>'
          + '<div class="spec">' + esc(spec) + '</div></div>'
          + '<div class="price">¥' + money(c.price) + '</div>'
          + '<div class="qty"><button data-act="cart-num" data-v="-1" data-id="' + c.id + '" data-goods="' + c.goodsId + '" data-product="' + c.productId + '" data-number="' + c.number + '">−</button>'
          + '<input value="' + c.number + '" readonly>'
          + '<button data-act="cart-num" data-v="1" data-id="' + c.id + '" data-goods="' + c.goodsId + '" data-product="' + c.productId + '" data-number="' + c.number + '">+</button></div>'
          + '<button class="del" data-act="cart-del" data-id="' + c.id + '" data-product="' + c.productId + '">删除</button>'
          + '</div>';
      });
      html += '</div>';

      html += '<div class="summary"><h3>结算信息</h3>'
        + '<div class="line"><span>已选商品</span><span>' + (total.checkedGoodsCount || 0) + ' 件</span></div>'
        + '<div class="line"><span>商品合计</span><span>¥' + money(total.checkedGoodsAmount) + '</span></div>'
        + '<div class="line"><span>配送费</span><span>' + (Number(total.checkedGoodsAmount) >= 99 ? '免运费' : '¥12.00') + '</span></div>'
        + '<div class="line total"><span>应付总额</span><b>¥' + money(Number(total.checkedGoodsAmount) + (Number(total.checkedGoodsAmount) >= 99 || Number(total.checkedGoodsAmount) === 0 ? 0 : 12)) + '</b></div>'
        + '<button class="btn" data-act="checkout-cart" ' + (total.checkedGoodsCount > 0 ? '' : 'disabled') + '>去结算</button>'
        + '</div></div>';
      $('#main').innerHTML = html;
    }).catch(function (e) {
      if (e.unlogin) return;
      $('#main').innerHTML = empty('购物车加载失败：' + e.message);
    });
  }

  /* ---------------------------------------------------------- 结算 */
  function viewCheckout(q) {
    if (needLogin()) return;
    loading();
    var prev = state.checkout || {};
    var cartId = Number(q.cartId || prev.cartId || 0);
    var same = Number(prev.cartId || 0) === cartId;
    var st = {
      cartId: cartId,
      addressId: Number(q.addressId || (same ? prev.addressId : 0) || 0),
      couponId: same && prev.couponId !== undefined ? prev.couponId : -1,
      userCouponId: same && prev.userCouponId !== undefined ? prev.userCouponId : -1
    };
    state.checkout = st;

    function fetchSummary() {
      return API.checkout({
        cartId: st.cartId,
        addressId: st.addressId,
        couponId: st.couponId,
        userCouponId: st.userCouponId,
        grouponRulesId: 0
      }).then(function (d) {
        state.checkout.data = d;
        return d;
      });
    }

    fetchSummary().then(function (d) {
      var goods = d.checkedGoodsList || [];
      if (!goods.length) {
        $('#main').innerHTML = empty('没有待结算的鲜花，请先选择商品～');
        return;
      }
      var addr = d.checkedAddress || {};
      var hasAddr = addr.id && addr.id !== 0;

      var html = '<div class="crumb"><a href="#/cart">购物车</a> / 确认订单</div>';
      html += '<h2 style="font-size:20px;margin:0 0 16px">确认订单</h2>';
      html += '<div class="cart-layout"><div>';

      /* 地址 */
      html += '<div class="checkout-block"><h3>收货信息</h3>';
      if (hasAddr) {
        html += '<div class="addr-card"><div>'
          + '<div class="who">' + esc(addr.name) + ' &nbsp; ' + esc(addr.tel) + '</div>'
          + '<div class="where">' + esc(addr.province || '') + esc(addr.city || '') + esc(addr.county || '') + ' ' + esc(addr.addressDetail || '') + '</div>'
          + '</div><div class="op"><button class="btn gray sm" data-act="pick-address">更换地址</button></div></div>';
      } else {
        html += '<div class="addr-card"><div class="addr-empty">还没有收货地址，鲜花需要送达到您手上～</div>'
          + '<div class="op"><button class="btn sm" data-act="new-address">新增地址</button></div></div>';
      }
      html += '</div>';

      /* 商品 */
      html += '<div class="checkout-block"><h3>鲜花清单</h3>';
      goods.forEach(function (c) {
        var spec = '';
        try { spec = JSON.parse(c.specifications || '[]').join(' / '); } catch (e) { spec = c.specifications || ''; }
        html += '<div class="goods-mini"><img src="' + img(c.picUrl) + '" alt="">'
          + '<div class="info"><b>' + esc(c.goodsName) + '</b><span>' + esc(spec) + ' × ' + c.number + '</span></div>'
          + '<div class="right"><b>¥' + money(Number(c.price) * Number(c.number)) + '</b></div></div>';
      });
      html += '</div>';

      /* 备注 */
      html += '<div class="checkout-block"><h3>订单备注</h3>'
        + '<div class="field"><textarea id="order-message" placeholder="期望送达时间、贺卡内容等（选填）"></textarea></div>'
        + '<div class="check-line" style="align-items:flex-start;gap:10px">'
        + '<label style="width:80px;flex:none">优惠券</label>'
        + '<div id="coupon-line" style="flex:1;font-size:13px;color:#7c6b72">可用 ' + (d.availableCouponLength || 0) + ' 张</div>'
        + '<button class="btn gray sm" data-act="pick-coupon">选择</button>'
        + '</div></div>';

      html += '</div>';

      /* 汇总 */
      html += '<div class="summary"><h3>应付金额</h3>'
        + '<div class="line"><span>商品合计</span><span>¥' + money(d.goodsTotalPrice) + '</span></div>'
        + '<div class="line"><span>配送费</span><span>¥' + money(d.freightPrice) + '</span></div>'
        + '<div class="line"><span>优惠券</span><span id="coupon-amount">- ¥' + money(d.couponPrice) + '</span></div>'
        + '<div class="line total"><span>实付金额</span><b id="actual-price">¥' + money(d.actualPrice) + '</b></div>'
        + '<button class="btn" data-act="submit-order">提交订单</button>'
        + '<div style="margin-top:10px;font-size:12px;color:#a99b9f;line-height:1.7">同城 2 小时专车送达，满 99 元免配送费。提交后可在"我的订单"中完成支付。</div>'
        + '</div></div>';

      $('#main').innerHTML = html;
    }).catch(function (e) {
      if (e.unlogin) return;
      $('#main').innerHTML = empty('结算信息加载失败：' + e.message);
    });
  }

  /* ---------------------------------------------------------- 我的订单 */
  var ORDER_TABS = [
    { v: 0, t: '全部订单' },
    { v: 1, t: '待付款' },
    { v: 2, t: '待发货' },
    { v: 3, t: '待收货' },
    { v: 4, t: '待评价' }
  ];

  function viewOrders(q) {
    if (needLogin()) return;
    loading();
    var showType = Number(q.showType || 0);
    API.orderList({ showType: showType, page: 1, limit: 20 }).then(function (d) {
      var list = d.list || [];
      var html = '<div class="section-head"><h2>我的订单</h2></div>';
      html += '<div class="tabbar">' + ORDER_TABS.map(function (t) {
        return '<button class="' + (t.v === showType ? 'on' : '') + '" data-act="goto" data-url="#/orders?showType=' + t.v + '">' + t.t + '</button>';
      }).join('') + '</div>';

      if (!list.length) {
        html += empty('暂无订单，去挑一束鲜花吧～');
      } else {
        list.forEach(function (o) {
          var gs = o.goodsList || [];
          html += '<div class="order-card">'
            + '<div class="order-head"><span>订单号：' + esc(o.orderSn) + '</span>'
            + '<span>' + esc((o.addTime || '').slice(0, 16)) + '</span>'
            + '<span class="status">' + esc(o.orderStatusText) + '</span></div>';
          gs.forEach(function (g) {
            html += '<div class="order-goods"><img src="' + img(g.picUrl) + '" alt="">'
              + '<div class="t"><b>' + esc(g.goodsName) + '</b><span>规格：' + esc(g.specifications || '') + ' × ' + g.number + '</span></div>'
              + '<div style="font-size:15px;color:#c2456a;font-weight:700">¥' + money(g.price) + '</div></div>';
          });
          var ho = o.handleOption || {};
          html += '<div class="order-foot"><span class="sum">实付金额 <b>¥' + money(o.actualPrice) + '</b></span>';
          if (ho.pay) html += '<button class="btn sm" data-act="order-pay" data-id="' + o.id + '">立即支付</button>';
          if (ho.cancel) html += '<button class="btn gray sm" data-act="order-cancel" data-id="' + o.id + '">取消订单</button>';
          if (ho.confirm) html += '<button class="btn sm" data-act="order-confirm" data-id="' + o.id + '">确认收货</button>';
          if (ho.delete) html += '<button class="btn gray sm" data-act="order-delete" data-id="' + o.id + '">删除订单</button>';
          html += '<button class="btn ghost sm" data-act="goto" data-url="#/order/' + o.id + '">订单详情</button>';
          html += '</div></div>';
        });
      }
      $('#main').innerHTML = html;
    }).catch(function (e) {
      if (e.unlogin) return;
      $('#main').innerHTML = empty('订单加载失败：' + e.message);
    });
  }

  function viewOrderDetail(id) {
    if (needLogin()) return;
    loading();
    API.orderDetail(id).then(function (d) {
      var o = d.orderInfo || {};
      var goods = d.orderGoods || [];
      var ho = o.handleOption || {};
      var html = '<div class="crumb"><a href="#/orders">我的订单</a> / 订单详情</div>';
      html += '<div class="checkout-block"><h3>' + esc(o.orderStatusText) + '</h3>'
        + '<div class="line" style="font-size:13px;color:#7c6b72;line-height:2">'
        + '订单号：' + esc(o.orderSn) + '<br>下单时间：' + esc(o.addTime || '')
        + (o.payTime ? '<br>支付时间：' + esc(o.payTime) : '')
        + (o.shipTime ? '<br>发货时间：' + esc(o.shipTime) : '')
        + '</div></div>';

      html += '<div class="checkout-block"><h3>收货信息</h3>'
        + '<div class="who" style="font-size:15px;font-weight:600">' + esc(o.consignee) + ' &nbsp; ' + esc(o.mobile) + '</div>'
        + '<div class="where" style="margin-top:6px;font-size:13px;color:#7c6b72">' + esc(o.address) + '</div>'
        + (o.message ? '<div style="margin-top:8px;font-size:13px;color:#7c6b72">备注：' + esc(o.message) + '</div>' : '')
        + '</div>';

      html += '<div class="checkout-block"><h3>鲜花清单</h3>';
      goods.forEach(function (g) {
        html += '<div class="goods-mini"><img src="' + img(g.picUrl) + '" alt="">'
          + '<div class="info"><b>' + esc(g.goodsName) + '</b><span>规格：' + esc(g.specifications || '') + ' × ' + g.number + '</span></div>'
          + '<div class="right"><b>¥' + money(g.price) + '</b></div></div>';
      });
      html += '<div class="line" style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#7c6b72"><span>商品合计</span><span>¥' + money(o.goodsPrice) + '</span></div>'
        + '<div class="line" style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#7c6b72"><span>配送费</span><span>¥' + money(o.freightPrice) + '</span></div>'
        + '<div class="line" style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;color:#7c6b72"><span>优惠券</span><span>- ¥' + money(o.couponPrice) + '</span></div>'
        + '<div class="line" style="display:flex;justify-content:space-between;padding:10px 0;font-size:15px"><span>实付金额</span><b style="color:#c2456a;font-size:20px">¥' + money(o.actualPrice) + '</b></div>'
        + '</div>';

      html += '<div style="display:flex;gap:10px;justify-content:flex-end">';
      if (ho.pay) html += '<button class="btn" data-act="order-pay" data-id="' + o.id + '">立即支付</button>';
      if (ho.cancel) html += '<button class="btn gray" data-act="order-cancel" data-id="' + o.id + '">取消订单</button>';
      if (ho.confirm) html += '<button class="btn" data-act="order-confirm" data-id="' + o.id + '">确认收货</button>';
      if (ho.delete) html += '<button class="btn gray" data-act="order-delete" data-id="' + o.id + '">删除订单</button>';
      html += '</div>';

      $('#main').innerHTML = html;
    }).catch(function (e) {
      if (e.unlogin) return;
      $('#main').innerHTML = empty('订单详情加载失败：' + e.message);
    });
  }

  /* ---------------------------------------------------------- 登录 */
  function viewLogin(q) {
    $('#main').innerHTML = ''
      + '<div class="auth-wrap">'
      + '  <h1>登录花语</h1>'
      + '  <div class="tip">登录后可加购、下单、查看订单与地址</div>'
      + '  <form data-act="login-form">'
      + '    <div class="field"><label>账号</label><input name="username" placeholder="请输入账号" autocomplete="username"></div>'
      + '    <div class="field"><label>密码</label><input name="password" type="password" placeholder="请输入密码" autocomplete="current-password"></div>'
      + '    <button class="btn" type="submit">登录</button>'
      + '  </form>'
      + '  <div class="demo-accounts">'
      + '    <b>演示账号（密码均为 123456）</b><br>'
      + '    flower01（花小仙） · flower02（花小主） · flower03（花满楼）'
      + '  </div>'
      + '</div>';
    state.loginRedirect = q.redirect || '#/';
  }

  /* ---------------------------------------------------------- 会员中心 */
  function viewMe() {
    if (needLogin()) return;
    loading();
    var user = API.token.user() || {};
    API.userIndex().then(function (d) {
      var o = d.order || {};
      var html = '';
      html += '<div class="me-head"><div class="avatar">' + esc((user.nickName || '花').slice(0, 1)) + '</div>'
        + '<div><div class="nick">' + esc(user.nickName || '花友') + '</div>'
        + '<div class="mobile">欢迎回到花语鲜花商城</div></div></div>';

      html += '<div class="me-orders">'
        + '<a href="#/orders?showType=1"><b>' + (o.unpaid || 0) + '</b><span>待付款</span></a>'
        + '<a href="#/orders?showType=2"><b>' + (o.unship || 0) + '</b><span>待发货</span></a>'
        + '<a href="#/orders?showType=3"><b>' + (o.unrecv || 0) + '</b><span>待收货</span></a>'
        + '<a href="#/orders?showType=4"><b>' + (o.uncomment || 0) + '</b><span>待评价</span></a>'
        + '</div>';

      html += '<div class="me-links">'
        + '<a href="#/orders">全部订单</a>'
        + '<a href="#/address">收货地址</a>'
        + '<a href="#/coupon">我的优惠券</a>'
        + '<a href="#/about">配送与养护</a>'
        + '</div>';

      html += '<div class="checkout-block" style="margin-top:16px"><h3>账号信息</h3>'
        + '<div style="font-size:13px;color:#7c6b72;line-height:2">'
        + '账号：' + esc(user.nickName || '-') + '<br>'
        + '花语商城会员 · 登录态有效期 7 天</div>'
        + '<button class="btn gray sm" style="margin-top:12px" data-act="logout">退出登录</button>'
        + '</div>';

      $('#main').innerHTML = html;
    }).catch(function (e) {
      if (e.unlogin) return;
      $('#main').innerHTML = empty('会员信息加载失败：' + e.message);
    });
  }

  /* ---------------------------------------------------------- 收货地址 */
  function viewAddress(q) {
    if (needLogin()) return;
    loading();
    var from = q.from || '';
    API.addressList().then(function (d) {
      var list = d.list || [];
      var html = '<div class="section-head"><h2>收货地址</h2>'
        + '<a class="more" href="#/address-edit' + (from ? '?from=' + from : '') + '">+ 新增地址</a></div>';
      if (!list.length) {
        html += empty('还没有收货地址，添加一个吧～');
      } else {
        list.forEach(function (a) {
          html += '<div class="checkout-block"><div class="addr-card"><div>'
            + '<div class="who">' + esc(a.name) + ' &nbsp; ' + esc(a.tel)
            + (a.isDefault ? ' <span style="font-size:11px;color:#c2456a">默认</span>' : '') + '</div>'
            + '<div class="where">' + esc(a.province || '') + esc(a.city || '') + esc(a.county || '') + ' ' + esc(a.addressDetail || '') + '</div>'
            + '</div><div class="op" style="display:flex;gap:8px">'
            + (from === 'checkout' ? '<button class="btn sm" data-act="use-address" data-id="' + a.id + '">选择</button>' : '')
            + '<button class="btn ghost sm" data-act="goto" data-url="#/address-edit?id=' + a.id + (from ? '&from=' + from : '') + '">编辑</button>'
            + '<button class="btn gray sm" data-act="addr-del" data-id="' + a.id + '">删除</button>'
            + '</div></div></div>';
        });
      }
      $('#main').innerHTML = html;
    }).catch(function (e) {
      if (e.unlogin) return;
      $('#main').innerHTML = empty('地址加载失败：' + e.message);
    });
  }

  function viewAddressEdit(q) {
    if (needLogin()) return;
    loading();
    var id = Number(q.id || 0);
    var from = q.from || '';
    var fill = function (a) {
      a = a || {};
      $('#main').innerHTML = ''
        + '<div class="section-head"><h2>' + (id ? '编辑地址' : '新增地址') + '</h2></div>'
        + '<div class="auth-wrap" style="max-width:560px;margin:0">'
        + ' <form data-act="address-form" data-id="' + id + '" data-from="' + esc(from) + '">'
        + '  <div class="form-row">'
        + '    <div class="field"><label>收货人</label><input name="name" value="' + esc(a.name || '') + '" placeholder="收货人姓名"></div>'
        + '    <div class="field"><label>手机号</label><input name="mobile" value="' + esc(a.tel || '') + '" placeholder="11 位手机号"></div>'
        + '  </div>'
        + '  <div class="form-row">'
        + '    <div class="field"><label>省</label><input name="province" value="' + esc(a.province || '') + '" placeholder="如：广东省"></div>'
        + '    <div class="field"><label>市</label><input name="city" value="' + esc(a.city || '') + '" placeholder="如：广州市"></div>'
        + '  </div>'
        + '  <div class="form-row">'
        + '    <div class="field"><label>区 / 县</label><input name="county" value="' + esc(a.county || '') + '" placeholder="如：天河区"></div>'
        + '    <div class="field"><label>区域编码</label><input name="areaCode" value="' + esc(a.areaCode || '440106') + '" placeholder="选填"></div>'
        + '  </div>'
        + '  <div class="field"><label>详细地址</label><textarea name="addressDetail" placeholder="街道、门牌号、楼层等">' + esc(a.addressDetail || '') + '</textarea></div>'
        + '  <div class="check-line"><input type="checkbox" name="isDefault" ' + (a.isDefault ? 'checked' : '') + '> 设为默认收货地址</div>'
        + '  <button class="btn" type="submit" style="margin-top:16px">保存地址</button>'
        + ' </form></div>';
    };
    if (id) {
      API.addressDetail(id).then(fill).catch(function (e) {
        if (e.unlogin) return;
        $('#main').innerHTML = empty('地址加载失败：' + e.message);
      });
    } else {
      fill({});
    }
  }

  /* ---------------------------------------------------------- 优惠券 */
  function viewCoupon() {
    loading();
    var logged = !!API.token.get();
    Promise.all([
      API.couponList({ page: 1, limit: 20 }),
      logged ? API.couponMylist({ page: 1, limit: 20 }).catch(function () { return { list: [] }; }) : Promise.resolve({ list: [] })
    ]).then(function (res) {
      var all = res[0].list || [];
      var mine = res[1].list || [];
      var html = '<div class="section-head"><h2>领券中心</h2><span class="sub">下单自动抵扣</span></div>';
      html += '<div class="coupon-strip" style="grid-template-columns:repeat(2,1fr)">';
      all.forEach(function (c) {
        html += '<div class="coupon-card">'
          + '<div class="amount">' + money(c.discount) + '<small>元</small></div>'
          + '<div class="info"><b>' + esc(c.name) + '</b><span>满 ' + money(c.min) + ' 元可用 · ' + esc(c.desc || '') + '</span></div>'
          + '<button data-act="receive-coupon" data-id="' + c.id + '">领取</button></div>';
      });
      html += '</div>';

      if (logged) {
        html += '<div class="section-head" style="margin-top:28px"><h2>我的优惠券</h2><span class="sub">共 ' + mine.length + ' 张</span></div>';
        if (!mine.length) {
          html += empty('还没有领取优惠券');
        } else {
          html += '<div class="coupon-strip" style="grid-template-columns:repeat(2,1fr)">';
          mine.forEach(function (c) {
            html += '<div class="coupon-card">'
              + '<div class="amount">' + money(c.discount) + '<small>元</small></div>'
              + '<div class="info"><b>' + esc(c.name) + '</b><span>满 ' + money(c.min) + ' 元可用 · 有效期至 '
              + esc((c.endTime || '').slice(0, 10)) + '</span></div></div>';
          });
          html += '</div>';
        }
      }
      $('#main').innerHTML = html;
    }).catch(function (e) {
      $('#main').innerHTML = empty('优惠券加载失败：' + e.message);
    });
  }

  /* ---------------------------------------------------------- 专题 */
  function viewTopic(id) {
    loading();
    API.topicDetail(id).then(function (d) {
      var t = d.topic || {};
      var goods = d.goods || [];
      $('#main').innerHTML = ''
        + '<div class="crumb"><a href="#/">首页</a> / 花艺专题</div>'
        + '<div class="detail-layout" style="grid-template-columns:320px 1fr">'
        + '  <img src="' + img(t.picUrl) + '" alt="" style="width:100%;border-radius:12px;object-fit:cover">'
        + '  <div><h1 class="detail-title">' + esc(t.title) + '</h1>'
        + '  <div class="detail-brief">' + esc(t.subtitle || '') + ' · 阅读 ' + esc(t.readCount || '') + '</div>'
        + '  <p style="line-height:2;font-size:14px;color:#57454d">' + esc(t.content || '') + '</p></div>'
        + '</div>'
        + '<div class="section">' + sectionHead('专题花礼', '一起打包送出去') + goodsGrid(goods) + '</div>';
    }).catch(function (e) {
      $('#main').innerHTML = empty('专题加载失败：' + e.message);
    });
  }

  /* ---------------------------------------------------------- 关于 */
  function viewAbout() {
    $('#main').innerHTML = ''
      + '<div class="crumb"><a href="#/">首页</a> / 花店介绍</div>'
      + '<div class="detail-layout" style="grid-template-columns:1fr 1fr">'
      + '  <img src="/flower/banner_1.jpg" alt="花语鲜花商城" style="width:100%;border-radius:12px">'
      + '  <div>'
      + '    <h1 class="detail-title">花语鲜花商城</h1>'
      + '    <p style="line-height:2;font-size:14px;color:#57454d">'
      + '      花语鲜花商城是「鲜花订购与管理系统」的用户端网页版，支持鲜花浏览、鲜花预订、'
      + '      在线购买、购物车、地址管理、优惠券与订单跟踪等功能，与微信小程序端共用同一套后端服务。'
      + '    </p>'
      + '    <h3 style="margin:18px 0 8px;font-size:15px">配送说明</h3>'
      + '    <p style="line-height:2;font-size:13px;color:#7c6b72">同城订单由花艺师专车配送，2 小时内送达；'
      + '外地订单使用顺丰冷链，一般次日达。满 99 元免配送费，不满 99 元收取 12 元配送费。</p>'
      + '    <h3 style="margin:18px 0 8px;font-size:15px">鲜花养护</h3>'
      + '    <p style="line-height:2;font-size:13px;color:#7c6b72">收到鲜花后斜剪根部 2cm，去掉浸水叶片，每日换水并清洗花瓶；'
      + '避免阳光直射、空调风口，也不要与水果放在一起，花期可延长至 5-7 天。</p>'
      + '  </div>'
      + '</div>';
  }

  /* ---------------------------------------------------------- 路由 */
  var ROUTES = [
    { re: /^\/$/, view: function () { return viewHome(); } },
    { re: /^\/goods$/, view: function (m, q) { return viewGoodsList(q); } },
    { re: /^\/detail\/(\d+)$/, view: function (m) { return viewDetail(m[1]); } },
    { re: /^\/cart$/, view: function () { return viewCart(); } },
    { re: /^\/checkout$/, view: function (m, q) { return viewCheckout(q); } },
    { re: /^\/orders$/, view: function (m, q) { return viewOrders(q); } },
    { re: /^\/order\/(\d+)$/, view: function (m) { return viewOrderDetail(m[1]); } },
    { re: /^\/login$/, view: function (m, q) { return viewLogin(q); } },
    { re: /^\/me$/, view: function () { return viewMe(); } },
    { re: /^\/address$/, view: function (m, q) { return viewAddress(q); } },
    { re: /^\/address-edit$/, view: function (m, q) { return viewAddressEdit(q); } },
    { re: /^\/coupon$/, view: function () { return viewCoupon(); } },
    { re: /^\/topic\/(\d+)$/, view: function (m) { return viewTopic(m[1]); } },
    { re: /^\/about$/, view: function () { return viewAbout(); } }
  ];

  function route() {
    clearInterval(heroTimer);
    var h = parseHash();
    renderShell();
    markNav(h.path);
    for (var i = 0; i < ROUTES.length; i++) {
      var m = h.path.match(ROUTES[i].re);
      if (m) {
        ROUTES[i].view(m, h.query);
        return;
      }
    }
    $('#main').innerHTML = empty('页面走丢了，回<a href="#/">首页</a>看看～');
  }

  /* ---------------------------------------------------------- 交互事件 */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.getAttribute('data-act');

    /* 轮播 */
    if (act === 'hero-dot') {
      var i = Number(el.getAttribute('data-i'));
      heroDot(i);
      startHero($$('.hero-slide').length);
      return;
    }

    /* 排序 / 跳转 */
    if (act === 'goto') {
      go(el.getAttribute('data-url'));
      return;
    }
    if (act === 'sort') {
      var h = parseHash();
      var q = h.query;
      q.sort = el.getAttribute('data-sort');
      q.order = el.getAttribute('data-order');
      q.page = 1;
      go('#/goods?' + Object.keys(q).map(function (k) { return k + '=' + encodeURIComponent(q[k]); }).join('&'));
      return;
    }

    /* 详情：切换主图 / 规格 / 数量 */
    if (act === 'thumb') {
      $('#main-img').src = el.getAttribute('data-src');
      $$('.gallery-thumbs img').forEach(function (x) { x.classList.toggle('on', x === el); });
      return;
    }
    if (act === 'spec') {
      var name = el.getAttribute('data-name');
      state.detail.spec[name] = el.getAttribute('data-value');
      var row = el.closest('.opts');
      $$('.opt', row).forEach(function (x) { x.classList.toggle('on', x === el); });
      state.detail.product = pickProduct();
      updateStockTip();
      return;
    }
    if (act === 'num') {
      var input = $('#num-input');
      var v = Number(input.value) + Number(el.getAttribute('data-v'));
      var max = state.detail.product ? state.detail.product.number : 99;
      if (v < 1) v = 1;
      if (v > max) { v = max; toast('库存仅剩 ' + max + ' 件'); }
      input.value = v;
      return;
    }
    if (act === 'tab') {
      var idx = el.getAttribute('data-tab');
      $$('.tabs button').forEach(function (x) { x.classList.toggle('on', x === el); });
      [0, 1, 2].forEach(function (k) { var p = $('#tab-' + k); if (p) p.hidden = String(k) !== idx; });
      return;
    }

    /* 加入购物车 / 立即购买 */
    if (act === 'add-cart' || act === 'buy-now') {
      if (needLogin()) return;
      var d = state.detail;
      var p = d.product;
      if (!p) { toast('请选择鲜花规格'); return; }
      var num = Number(($('#num-input') || {}).value || 1);
      var body = { goodsId: d.goods.id, productId: p.id, number: num };
      var done = function () {
        syncCart();
        if (act === 'buy-now') return null;
        toast('已加入购物车');
        return null;
      };
      if (act === 'add-cart') {
        API.cartAdd(body).then(done).catch(function (err) { toast(err.message); });
      } else {
        API.cartFastAdd(body).then(function (cartId) {
          go('#/checkout?cartId=' + cartId);
        }).catch(function (err) { toast(err.message); });
      }
      return;
    }

    /* 购物车操作 */
    if (act === 'cart-num') {
      var id = el.getAttribute('data-id');
      var goodsId = el.getAttribute('data-goods');
      var productId = el.getAttribute('data-product');
      var number = Number(el.getAttribute('data-number')) + Number(el.getAttribute('data-v'));
      if (number < 1) return;
      API.cartUpdate({ id: Number(id), goodsId: Number(goodsId), productId: Number(productId), number: number })
        .then(function () { viewCart(); syncCart(); })
        .catch(function (err) { toast(err.message); });
      return;
    }
    if (act === 'cart-del') {
      if (!confirm('确定删除这束鲜花吗？')) return;
      API.cartDelete({ productIds: [Number(el.getAttribute('data-product'))] })
        .then(function () { viewCart(); syncCart(); toast('已删除'); })
        .catch(function (err) { toast(err.message); });
      return;
    }
    if (act === 'cart-check') {
      API.cartChecked({ productIds: [Number(el.getAttribute('data-product'))], isChecked: el.checked ? 1 : 0 })
        .then(function () { viewCart(); syncCart(); })
        .catch(function (err) { toast(err.message); });
      return;
    }
    if (act === 'checkout-cart') {
      go('#/checkout');
      return;
    }

    /* 结算页 */
    if (act === 'new-address') { go('#/address-edit?from=checkout'); return; }
    if (act === 'pick-address') { go('#/address?from=checkout'); return; }
    if (act === 'use-address') {
      var ck = state.checkout;
      if (ck) ck.addressId = Number(el.getAttribute('data-id'));
      go('#/checkout');
      return;
    }
    if (act === 'pick-coupon') { openCouponPicker(); return; }
    if (act === 'choose-coupon') {
      var ck2 = state.checkout;
      ck2.couponId = Number(el.getAttribute('data-cid') || -1);
      ck2.userCouponId = Number(el.getAttribute('data-id') || -1);
      closeModal();
      go('#/checkout');
      return;
    }
    if (act === 'close-modal') { closeModal(); return; }
    if (act === 'submit-order') { submitOrder(); return; }

    /* 订单操作 */
    if (act === 'order-pay') {
      API.orderMockPay({ orderId: Number(el.getAttribute('data-id')) })
        .then(function () { toast('支付成功（演示环境模拟支付）'); route(); })
        .catch(function (err) { toast(err.message); });
      return;
    }
    if (act === 'order-cancel') {
      if (!confirm('确定取消这个订单吗？')) return;
      API.orderCancel({ orderId: Number(el.getAttribute('data-id')) })
        .then(function () { toast('订单已取消'); route(); })
        .catch(function (err) { toast(err.message); });
      return;
    }
    if (act === 'order-confirm') {
      API.orderConfirm({ orderId: Number(el.getAttribute('data-id')) })
        .then(function () { toast('已确认收货'); route(); })
        .catch(function (err) { toast(err.message); });
      return;
    }
    if (act === 'order-delete') {
      if (!confirm('确定删除这个订单吗？')) return;
      API.orderDelete({ orderId: Number(el.getAttribute('data-id')) })
        .then(function () { toast('订单已删除'); route(); })
        .catch(function (err) { toast(err.message); });
      return;
    }

    /* 地址 */
    if (act === 'addr-del') {
      if (!confirm('确定删除这个地址吗？')) return;
      API.addressDelete({ id: Number(el.getAttribute('data-id')) })
        .then(function () { toast('地址已删除'); route(); })
        .catch(function (err) { toast(err.message); });
      return;
    }

    /* 优惠券领取 */
    if (act === 'receive-coupon') {
      if (needLogin()) return;
      API.couponReceive({ couponId: Number(el.getAttribute('data-id')) })
        .then(function () { toast('领取成功，去下单吧～'); })
        .catch(function (err) { toast(err.message); });
      return;
    }

    /* 退出 */
    if (act === 'logout') {
      API.logout().catch(function () { });
      API.token.set('', null);
      state.cartCount = 0;
      toast('已退出登录');
      go('#/');
      return;
    }
  });

  /* 表单提交 */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    var act = form.getAttribute('data-act');
    if (!act) return;
    e.preventDefault();

    if (act === 'search-form') {
      var kw = form.keyword.value.trim();
      if (!kw) return;
      go('#/goods?keyword=' + encodeURIComponent(kw));
      return;
    }

    if (act === 'login-form') {
      var username = form.username.value.trim();
      var password = form.password.value;
      if (!username || !password) { toast('请输入账号和密码'); return; }
      API.login(username, password).then(function (d) {
        API.token.set(d.token, d.userInfo);
        toast('登录成功，欢迎回来');
        syncCart();
        go(state.loginRedirect || '#/');
      }).catch(function (err) {
        toast(err.message || '登录失败');
      });
      return;
    }

    if (act === 'address-form') {
      var id = Number(form.getAttribute('data-id') || 0);
      var from = form.getAttribute('data-from') || '';
      var body = {
        id: id || undefined,
        name: form.name.value.trim(),
        tel: form.mobile.value.trim(),
        province: form.province.value.trim(),
        city: form.city.value.trim(),
        county: form.county.value.trim(),
        areaCode: form.areaCode.value.trim() || '440106',
        addressDetail: form.addressDetail.value.trim(),
        isDefault: form.isDefault.checked ? 1 : 0
      };
      if (!body.name || !body.tel || !body.addressDetail) { toast('请填写收货人、手机号和详细地址'); return; }
      API.addressSave(body).then(function () {
        toast('地址已保存');
        go(from === 'checkout' ? '#/address?from=checkout' : '#/address');
      }).catch(function (err) { toast(err.message); });
      return;
    }
  });

  /* ---------------------------------------------------------- 结算相关辅助 */
  function openCouponPicker() {
    var ck = state.checkout;
    if (!ck) return;
    API.couponSelect({ cartId: ck.cartId, grouponRulesId: 0 }).then(function (d) {
      var list = d.list || [];
      var html = '<div class="modal-box"><h3>选择优惠券</h3>';
      html += '<div class="coupon-pick" data-act="choose-coupon" data-id="-1" data-cid="-1">'
        + '<div class="i"><b>不使用优惠券</b><span>按订单原价支付</span></div></div>';
      if (!list.length) {
        html += '<div class="empty" style="padding:20px 0">暂无可用优惠券，先去领券中心看看～</div>';
      }
      list.forEach(function (c) {
        html += '<div class="coupon-pick ' + (c.available ? '' : 'disabled') + '"'
          + (c.available ? ' data-act="choose-coupon" data-id="' + c.id + '" data-cid="' + c.cid + '"' : '')
          + '><div class="a">' + money(c.discount) + '</div>'
          + '<div class="i"><b>' + esc(c.name) + '</b><span>满 ' + money(c.min) + ' 元可用 · '
          + (c.available ? '可用' : '不可用') + '</span></div></div>';
      });
      html += '<button class="btn gray" style="width:100%;margin-top:8px" data-act="close-modal">关闭</button></div>';
      var modal = $('#modal');
      modal.innerHTML = html;
      modal.hidden = false;
    }).catch(function (err) {
      toast(err.message);
    });
  }

  function closeModal() {
    var modal = $('#modal');
    modal.hidden = true;
    modal.innerHTML = '';
  }

  function submitOrder() {
    var ck = state.checkout;
    if (!ck || !ck.data) return;
    var addr = ck.data.checkedAddress || {};
    if (!addr.id) { toast('请先选择或新增收货地址'); return; }
    var msgEl = $('#order-message');
    var body = {
      cartId: ck.cartId,
      addressId: addr.id,
      couponId: ck.couponId,
      userCouponId: ck.userCouponId,
      message: msgEl ? msgEl.value.trim() : '',
      grouponRulesId: 0,
      grouponLinkId: 0
    };
    API.orderSubmit(body).then(function (d) {
      state.checkout = null;
      syncCart();
      toast('订单提交成功，请完成支付');
      var orderId = (typeof d === 'object' && d !== null) ? (d.orderId || d.id) : d;
      if (orderId) {
        go('#/order/' + orderId);
      } else {
        go('#/orders?showType=1');
      }
    }).catch(function (err) {
      toast(err.message || '下单失败');
    });
  }

  /* ---------------------------------------------------------- 启动 */
  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', function () {
    route();
    syncCart();
  });
  if (document.readyState !== 'loading') {
    route();
    syncCart();
  }
})();
