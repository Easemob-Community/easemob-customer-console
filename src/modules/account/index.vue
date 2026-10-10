<script setup lang="ts">
import { ref } from 'vue'
import AgentList from './AgentList.vue'
import AiAccountList from './AiAccountList.vue'

const activeTab = ref('agents')
</script>

<template>
  <div>
    <h3>账号管理</h3>
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="坐席账号" name="agents">
        <AgentList v-if="activeTab === 'agents'" />
      </el-tab-pane>
      <el-tab-pane label="AI 账号" name="ai">
        <AiAccountList v-if="activeTab === 'ai'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
