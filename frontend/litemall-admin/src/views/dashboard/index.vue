<template>
  <div class="dashboard-editor-container">

    <div class="flower-hello">
      <div class="hello-title">花语鲜花商城 · 数据看板</div>
      <div class="hello-sub">鲜花订购与管理系统 —— 鲜花、类目、库存、订单、会员一体化管理</div>
    </div>

    <el-row :gutter="40" class="panel-group">
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
          <div class="card-panel-icon-wrapper icon-people">
            <svg-icon icon-class="peoples" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.section.user_total') }}</div>
            <count-to :start-val="0" :end-val="userTotal" :duration="2600" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('messages')">
          <div class="card-panel-icon-wrapper icon-message">
            <svg-icon icon-class="message" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.section.goods_total') }}</div>
            <count-to :start-val="0" :end-val="goodsTotal" :duration="3000" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('purchases')">
          <div class="card-panel-icon-wrapper icon-money">
            <svg-icon icon-class="message" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.section.product_total') }}</div>
            <count-to :start-val="0" :end-val="productTotal" :duration="3200" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
        <div class="card-panel" @click="handleSetLineChartData('shoppings')">
          <div class="card-panel-icon-wrapper icon-shoppingCard">
            <svg-icon icon-class="money" class-name="card-panel-icon" />
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">{{ $t('dashboard.section.order_total') }}</div>
            <count-to :start-val="0" :end-val="orderTotal" :duration="3600" class="card-panel-num"/>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { info } from '@/api/dashboard'
import CountTo from 'vue-count-to'

export default {
  components: {
    CountTo
  },
  data() {
    return {
      userTotal: 0,
      goodsTotal: 0,
      productTotal: 0,
      orderTotal: 0
    }
  },
  created() {
    info().then(response => {
      this.userTotal = response.data.data.userTotal
      this.goodsTotal = response.data.data.goodsTotal
      this.productTotal = response.data.data.productTotal
      this.orderTotal = response.data.data.orderTotal
    })
  },
  methods: {
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

.flower-hello {
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
  margin-top: 18px;

  .card-panel-col{
    margin-bottom: 32px;
  }
  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);
    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }
      .icon-people {
         background: #40c9c6;
      }
      .icon-message {
        background: #36a3f7;
      }
      .icon-money {
        background: #f4516c;
      }
      .icon-shoppingCard {
        background: #34bfa3
      }
    }
    .icon-people {
      color: #40c9c6;
    }
    .icon-message {
      color: #36a3f7;
    }
    .icon-money {
      color: #f4516c;
    }
    .icon-shoppingCard {
      color: #34bfa3
    }
    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }
    .card-panel-icon {
      float: left;
      font-size: 48px;
    }
    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;
      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }
      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}
</style>
