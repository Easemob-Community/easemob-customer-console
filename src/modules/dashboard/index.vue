<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const overview = ref({
  sessionCount: 0,
  aiResolved: 0,
  transferred: 0,
  avgScore: 0
})

onMounted(async () => {
  const res = await request.get('/admin/stat/overview?range=7d')
  if (res.code === 0) overview.value = res.data
})
</script>

<template>
  <div>
    <h3>数据看板</h3>
    <div class="cards">
      <div class="card">
        <div class="value">{{ overview.sessionCount }}</div>
        <div class="label">7日会话量</div>
      </div>
      <div class="card">
        <div class="value">{{ overview.aiResolved }}</div>
        <div class="label">AI 解决数</div>
      </div>
      <div class="card">
        <div class="value">{{ overview.transferred }}</div>
        <div class="label">转人工数</div>
      </div>
      <div class="card">
        <div class="value">{{ overview.avgScore }}</div>
        <div class="label">平均满意度</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  text-align: center;
}
.value {
  font-size: 28px;
  font-weight: 700;
  color: #3b6cff;
}
.label {
  margin-top: 8px;
  color: #666;
}
</style>
