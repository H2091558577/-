/* ============================================================
   花语鲜花商城 · 网页版客户端 —— 接口层
   对接后端 litemall-wx-api：/wx/**
   与小程序共用同一套接口，登录态通过 X-Litemall-Token 头传递
   ============================================================ */
(function (global) {
  'use strict';

  var TOKEN_KEY = 'flower_token';
  var USER_KEY = 'flower_user';

  function base() {
    // 与页面同源：后端同时提供 /web/ 静态页面与 /wx 接口
    return location.protocol + '//' + location.host;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function setToken(token, user) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function qs(params) {
    if (!params) return '';
    var parts = [];
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null || v === '') return;
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    });
    return parts.length ? '?' + parts.join('&') : '';
  }

  function request(method, url, data) {
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) headers['X-Litemall-Token'] = token;

    var opt = { method: method, headers: headers };
    if (data !== undefined && method !== 'GET') opt.body = JSON.stringify(data);

    return fetch(base() + url, opt).then(function (res) {
      if (res.status === 200) return res.json();
      if (res.status === 404) throw new Error('接口不存在：' + url);
      throw new Error('网络请求失败（HTTP ' + res.status + '）');
    }).then(function (body) {
      if (!body || body.errno === undefined) throw new Error('返回数据格式错误');
      if (body.errno === 0) return body.data;
      if (body.errno === 501) {
        setToken('', null);
        var err = new Error('请先登录');
        err.unlogin = true;
        throw err;
      }
      var e = new Error(body.errmsg || '操作失败');
      e.errno = body.errno;
      throw e;
    });
  }

  function get(url, params) { return request('GET', url + qs(params)); }
  function post(url, data) { return request('POST', url, data || {}); }

  var API = {
    base: base,
    token: { get: getToken, set: setToken, user: getUser },

    /* 首页 / 类目 */
    home: function () { return get('/wx/home/index'); },
    catalog: function (id) { return get('/wx/catalog/index', { id: id }); },
    catalogAll: function () { return get('/wx/catalog/all'); },
    catalogCurrent: function (id) { return get('/wx/catalog/current', { id: id }); },
    secondCategory: function (id) { return get('/wx/catalog/getsecondcategory', { id: id }); },

    /* 鲜花 */
    goodsList: function (p) { return get('/wx/goods/list', p); },
    goodsDetail: function (id) { return get('/wx/goods/detail', { id: id }); },
    goodsCategory: function (id) { return get('/wx/goods/category', { id: id }); },
    goodsRelated: function (id) { return get('/wx/goods/related', { id: id }); },
    goodsCount: function () { return get('/wx/goods/count'); },

    /* 搜索 */
    searchIndex: function () { return get('/wx/search/index'); },
    searchHelper: function (keyword) { return get('/wx/search/helper', { keyword: keyword }); },

    /* 品牌 / 专题 / 评价 */
    brandList: function (p) { return get('/wx/brand/list', p); },
    brandDetail: function (id) { return get('/wx/brand/detail', { id: id }); },
    topicList: function (p) { return get('/wx/topic/list', p); },
    topicDetail: function (id) { return get('/wx/topic/detail', { id: id }); },
    commentList: function (p) { return get('/wx/comment/list', p); },

    /* 登录 */
    login: function (username, password) { return post('/wx/auth/login', { username: username, password: password }); },
    logout: function () { return post('/wx/auth/logout', {}); },
    userIndex: function () { return get('/wx/user/index'); },
    userInfo: function () { return get('/wx/auth/info'); },

    /* 购物车 */
    cartIndex: function () { return get('/wx/cart/index'); },
    cartCount: function () { return get('/wx/cart/goodscount'); },
    cartAdd: function (b) { return post('/wx/cart/add', b); },
    cartFastAdd: function (b) { return post('/wx/cart/fastadd', b); },
    cartUpdate: function (b) { return post('/wx/cart/update', b); },
    cartChecked: function (b) { return post('/wx/cart/checked', b); },
    cartDelete: function (b) { return post('/wx/cart/delete', b); },
    checkout: function (p) { return get('/wx/cart/checkout', p); },

    /* 收货地址 */
    addressList: function () { return get('/wx/address/list'); },
    addressDetail: function (id) { return get('/wx/address/detail', { id: id }); },
    addressSave: function (b) { return post('/wx/address/save', b); },
    addressDelete: function (b) { return post('/wx/address/delete', b); },

    /* 订单 */
    orderSubmit: function (b) { return post('/wx/order/submit', b); },
    orderList: function (p) { return get('/wx/order/list', p); },
    orderDetail: function (id) { return get('/wx/order/detail', { orderId: id }); },
    orderCancel: function (b) { return post('/wx/order/cancel', b); },
    orderConfirm: function (b) { return post('/wx/order/confirm', b); },
    orderDelete: function (b) { return post('/wx/order/delete', b); },
    orderMockPay: function (b) { return post('/wx/order/mockpay', b); },

    /* 优惠券 */
    couponList: function (p) { return get('/wx/coupon/list', p); },
    couponMylist: function (p) { return get('/wx/coupon/mylist', p); },
    couponSelect: function (p) { return get('/wx/coupon/selectlist', p); },
    couponReceive: function (b) { return post('/wx/coupon/receive', b); },

    /* 收藏 */
    collect: function (b) { return post('/wx/collect/addordelete', b); }
  };

  global.API = API;
})(window);
