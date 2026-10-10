<script setup lang="ts">
import { ref } from 'vue'
import ProviderList from './ProviderList.vue'
import TransferWords from './TransferWords.vue'

const activeTab = ref('providers')
</script>

<template>
  <div>
    <h3>AI 管理</h3>
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="厂家配置" name="providers">
        <ProviderList v-if="activeTab === 'providers'" />
      </el-tab-pane>
      <el-tab-pane label="转人工词表" name="words">
        <TransferWords v-if="activeTab === 'words'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
