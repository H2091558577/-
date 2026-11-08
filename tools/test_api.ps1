# 鲜花订购与管理系统 —— 接口联调自测脚本
# 用法：powershell -ExecutionPolicy Bypass -File tools\test_api.ps1
# 覆盖：会员登录、加购、下单、模拟支付、订单查询、后台登录、鲜花/订单管理、发货

$ErrorActionPreference = 'Continue'
$base = 'http://127.0.0.1:8081'
$pass = 0
$fail = 0

function Check($name, $ok, $detail) {
  if ($ok) {
    $script:pass++
    Write-Output ("[PASS] {0}  {1}" -f $name, $detail)
  } else {
    $script:fail++
    Write-Output ("[FAIL] {0}  {1}" -f $name, $detail)
  }
}

Write-Output "===== 1. 商城首页接口 ====="
$homeData = Invoke-RestMethod -Uri "$base/wx/home/index" -TimeoutSec 10
Check '首页数据' ($homeData.errno -eq 0 -and $homeData.data.banner.Count -gt 0) `
  ("banner={0} 类目={1} 热销={2} 品牌={3} 专题={4} 优惠券={5}" -f `
    $homeData.data.banner.Count, $homeData.data.channel.Count, $homeData.data.hotGoodsList.Count, `
    $homeData.data.brandList.Count, $homeData.data.topicList.Count, $homeData.data.couponList.Count)

Write-Output ""
Write-Output "===== 2. 会员端：登录 / 加购 / 下单 / 支付 ====="
$login = Invoke-RestMethod -Uri "$base/wx/auth/login" -Method Post -ContentType 'application/json' `
  -Body (@{ username = 'flower01'; password = '123456' } | ConvertTo-Json) -TimeoutSec 10
Check '会员登录' ($login.errno -eq 0) ("账号=flower01 token长度={0}" -f $login.data.token.Length)
$h = @{ 'X-Litemall-Token' = $login.data.token }

$detail = Invoke-RestMethod -Uri "$base/wx/goods/detail?id=1" -TimeoutSec 10
$product = $detail.data.productList[0]
Check '鲜花详情' ($detail.errno -eq 0) ("鲜花={0} 规格数={1} 货品数={2}" -f `
  $detail.data.info.name, $detail.data.specificationList[0].valueList.Count, $detail.data.productList.Count)

$add = Invoke-RestMethod -Uri "$base/wx/cart/add" -Method Post -Headers $h -ContentType 'application/json' `
  -Body (@{ goodsId = 1; productId = $product.id; number = 2 } | ConvertTo-Json) -TimeoutSec 10
Check '加入购物车' ($add.errno -eq 0) ("购物车件数={0}" -f $add.data)

$cart = Invoke-RestMethod -Uri "$base/wx/cart/index" -Headers $h -TimeoutSec 10
Check '购物车列表' ($cart.errno -eq 0 -and $cart.data.cartList.Count -gt 0) `
  ("条目={0} 合计=¥{1}" -f $cart.data.cartList.Count, $cart.data.cartTotal.goodsAmount)

$addr = Invoke-RestMethod -Uri "$base/wx/address/list" -Headers $h -TimeoutSec 10
if ($addr.data.total -eq 0) {
  $saved = Invoke-RestMethod -Uri "$base/wx/address/save" -Method Post -Headers $h -ContentType 'application/json' `
    -Body (@{ name = '花小仙'; tel = '13800000001'; province = '广东省'; city = '广州市';
              county = '天河区'; areaCode = '440106'; addressDetail = '花城大道 88 号 3 栋 602'; isDefault = 1 } | ConvertTo-Json) -TimeoutSec 10
  Check '新增收货地址' ($saved.errno -eq 0) '首次下单自动创建演示地址'
  $addr = Invoke-RestMethod -Uri "$base/wx/address/list" -Headers $h -TimeoutSec 10
} else {
  Check '收货地址列表' ($addr.errno -eq 0) ("地址数={0}" -f $addr.data.total)
}

$checkout = Invoke-RestMethod -Uri "$base/wx/cart/checkout?cartId=0&grouponRulesId=0" -Headers $h -TimeoutSec 10
Check '结算页计算' ($checkout.errno -eq 0) ("商品=¥{0} 运费=¥{1} 应付=¥{2}" -f `
  $checkout.data.goodsTotalPrice, $checkout.data.freightPrice, $checkout.data.actualPrice)

$submit = Invoke-RestMethod -Uri "$base/wx/order/submit" -Method Post -Headers $h -ContentType 'application/json' `
  -Body (@{ cartId = 0; addressId = $addr.data.list[0].id; couponId = -1; userCouponId = -1;
            message = '请 18:00 后送达，附一张生日贺卡'; grouponRulesId = 0; grouponLinkId = 0 } | ConvertTo-Json) -TimeoutSec 10
$orderId = $submit.data.orderId
Check '提交订单' ($submit.errno -eq 0) ("订单ID={0}" -f $orderId)

$od = Invoke-RestMethod -Uri "$base/wx/order/detail?orderId=$orderId" -Headers $h -TimeoutSec 10
Check '订单详情(待付款)' ($od.errno -eq 0 -and $od.data.orderInfo.orderStatusText -eq '未付款') `
  ("状态={0} 实付=¥{1}" -f $od.data.orderInfo.orderStatusText, $od.data.orderInfo.actualPrice)

$pay = Invoke-RestMethod -Uri "$base/wx/order/mockpay" -Method Post -Headers $h -ContentType 'application/json' `
  -Body (@{ orderId = $orderId } | ConvertTo-Json) -TimeoutSec 10
Check '模拟支付' ($pay.errno -eq 0) '演示环境模拟微信支付回调'

$od2 = Invoke-RestMethod -Uri "$base/wx/order/detail?orderId=$orderId" -Headers $h -TimeoutSec 10
Check '订单详情(已付款)' ($od2.errno -eq 0 -and $od2.data.orderInfo.orderStatusText -eq '已付款') `
  ("状态={0}" -f $od2.data.orderInfo.orderStatusText)

Write-Output ""
Write-Output "===== 3. 管理后台：登录 / 鲜花管理 / 订单发货 ====="
$alogin = Invoke-RestMethod -Uri "$base/admin/auth/login" -Method Post -ContentType 'application/json' `
  -Body (@{ username = 'admin123'; password = 'admin123' } | ConvertTo-Json) -TimeoutSec 10
Check '管理员登录' ($alogin.errno -eq 0) ("账号=admin123 token长度={0}" -f $alogin.data.token.Length)
$ah = @{ 'X-Litemall-Admin-Token' = $alogin.data.token }

$goods = Invoke-RestMethod -Uri "$base/admin/goods/list?page=1&limit=5" -Headers $ah -TimeoutSec 10
Check '后台鲜花列表' ($goods.errno -eq 0 -and $goods.data.list.Count -gt 0) `
  ("鲜花总数={0}" -f $goods.data.total)

$cat = Invoke-RestMethod -Uri "$base/admin/category/list" -Headers $ah -TimeoutSec 10
Check '后台类目列表' ($cat.errno -eq 0) ("类目数={0}" -f $cat.data.total)

$orders = Invoke-RestMethod -Uri "$base/admin/order/list?page=1&limit=5" -Headers $ah -TimeoutSec 10
Check '后台订单列表' ($orders.errno -eq 0 -and $orders.data.list.Count -gt 0) `
  ("订单总数={0}" -f $orders.data.total)

$users = Invoke-RestMethod -Uri "$base/admin/user/list?page=1&limit=5" -Headers $ah -TimeoutSec 10
Check '后台会员列表' ($users.errno -eq 0) ("会员总数={0}" -f $users.data.total)

$ship = Invoke-RestMethod -Uri "$base/admin/order/ship" -Method Post -Headers $ah -ContentType 'application/json' `
  -Body (@{ orderId = $orderId; shipChannel = '顺丰速运'; shipSn = 'SF20251108001' } | ConvertTo-Json) -TimeoutSec 10
Check '后台发货' ($ship.errno -eq 0) ("订单ID={0}" -f $orderId)

$od3 = Invoke-RestMethod -Uri "$base/wx/order/detail?orderId=$orderId" -Headers $h -TimeoutSec 10
Check '小程序端看到已发货' ($od3.errno -eq 0 -and $od3.data.orderInfo.orderStatusText -eq '已发货') `
  ("状态={0}" -f $od3.data.orderInfo.orderStatusText)

$stat = Invoke-RestMethod -Uri "$base/admin/stat/order?page=1&limit=12" -Headers $ah -TimeoutSec 10
Check '订单统计报表' ($stat.errno -eq 0) ("统计行数={0}" -f $stat.data.Columns.Count)

Write-Output ""
Write-Output "===== 4. 静态资源 ====="
foreach ($u in '/', '/web/', '/web/js/app.js', '/flower/banner_1.jpg', '/flower/goods_001.jpg') {
  try {
    $r = Invoke-WebRequest -Uri "$base$u" -UseBasicParsing -TimeoutSec 10
    Check ("静态资源 " + $u) ($r.StatusCode -eq 200) ("HTTP {0} {1} 字节" -f $r.StatusCode, $r.RawContentLength)
  } catch {
    Check ("静态资源 " + $u) $false $_.Exception.Message
  }
}

Write-Output ""
Write-Output ("===== 汇总：通过 {0} 项，失败 {1} 项 =====" -f $pass, $fail)
