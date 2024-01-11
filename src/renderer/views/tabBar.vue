<!--
 * @Descripttion:
 * @Author: zhangchong zc16607@gmail.com
 * @Date: 2022-12-30 10:26:21
 * @LastEditors: zhangchong zc16607@gmail.com
 * @LastEditTime: 2023-05-22 17:03:29
-->

<template>
  <div class="tab-control-wrap">
    <div class="control-left">
      <el-tabs
        v-model="currentTabId"
        ref="elTabsRef"
        type="border-card"
        :closable="tabs.length > 1"
        style="display: inline-block; max-width: calc(100vw - 230px)"
        :stretch="false"
        @tab-remove="removeTab"
        @tab-change="changeTab"
      >
        <el-tab-pane
          v-for="item in tabs"
          :key="item.time"
          :label="item.title"
          :name="item.tabId"
        >
          <template #label>
            <span class="custom-tabs-label">
              <el-icon v-if="item.isLoading" class="is-loading">
                <ep-Loading />
              </el-icon>
              <img v-else class="tab-icon" :src="item.favicon" />
              <span
                v-if="item.title.length > 9"
                :title="item.title"
                class="tab-title"
                >{{ item.title.slice(0, 9) }}</span
              >
              <span v-else class="tab-title">{{ item.title }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
      <el-icon title="新标签页" @click="addNewTab" class="add-new-tab">
        <ep-plus />
      </el-icon>
    </div>

    <div class="control-right">
      <el-icon title="最小化" @click="minimize" class="control-right-btn">
        <ep-minus />
      </el-icon>
      <el-icon
        title="最大化"
        :size="13"
        @click="maximize"
        class="control-right-btn"
      >
        <ep-FullScreen />
      </el-icon>
      <el-icon
        title="关闭"
        @click="closeWindow"
        class="control-right-btn btn-close"
      >
        <ep-close />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'

const tabs = ref([])
const currentTabId = ref(0)
const elTabsRef = ref({})

// 关闭tab页
const removeTab = (tabId) => {
  window.ipcRenderer.send('close-tab', tabId)
}

// 切换tab页
const changeTab = (tabId) => {
  window.ipcRenderer.send('switch-tab', tabId)
}

// 添加新tab
const addNewTab = () => {
  window.ipcRenderer.send('new-tab')
}

// 最小化窗口
const minimize = () => {
  window.ipcRenderer.send('toMain', 'minimiseWin')
}

// 最大化窗口
const maximize = () => {
  window.ipcRenderer.send('toMain', 'maximiseOrRestoreWin')
}

// 关闭窗口
const closeWindow = () => {
  window.ipcRenderer.send('toMain', 'closeWin')
}

onMounted(() => {
  window.ipcRenderer.receive(
    'tabs-update',
    (tabOptions) => {
      const time = new Date().valueOf()
      tabs.value = Object.keys(tabOptions.confs).filter(id => tabOptions.confs[id]).map(tabId => {
        const obj = { ...tabOptions.confs[tabId], tabId: parseInt(tabId), time }
        if (!obj.title) obj.title = '新标签页'
        return obj
      })
    }
  )

  nextTick(() => {
    console.log('ref', elTabsRef)
  })

  // 获取当前显示的tab的id
  window.ipcRenderer.receive('fromMain', (data) => {
    if (typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'currentTabId')) {
      currentTabId.value = data.currentTabId
    }
  })

  window.ipcRenderer.send(
    'control-ready'
  )
})

</script>

<style scoped>
.tab-control-wrap {
  width: 100%;
  height: 40px;
  background-color: var(--el-fill-color-light);
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  -webkit-app-region: drag;
}
.el-tabs--border-card {
  border: none;
}
.add-new-tab {
  vertical-align: top;
  transform: translateY(12px);
  margin-left: 10px;
  border-radius: 10px;
}
.add-new-tab:hover {
  cursor: pointer;
  color: #fdfdfe;
  background-color: var(--el-border-color-hover);
}
.custom-tabs-label {
  position: relative;
}
.tab-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  display: inline;
}
.tab-title::after {
  content: "";
  background: linear-gradient(
    90deg,
    transparent,
    transparent,
    transparent,
    transparent,
    transparent,
    transparent,
    transparent,
    transparent,
    transparent,
    transparent,
    transparent,
    rgba(255, 255, 255, 0.8)
  );
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.control-left {
  -webkit-app-region: no-drag;
}
.control-right {
  -webkit-app-region: no-drag;
  display: flex;
  align-items: center;
}
.control-right-btn {
  width: 46px;
  height: 100%;
  font-size: 15px;
}
.control-right-btn:hover {
  cursor: pointer;
  background-color: #e5e5e5;
}
.btn-close:hover {
  color: #fff;
  background-color: #e81123;
}
</style>