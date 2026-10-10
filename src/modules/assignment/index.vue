<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const form = ref({
  defaultStrategy: 'FAMILIAR_FIRST',
  familiarValidDays: 30,
  queueLimit: 50,
  noAgentPolicy: 'QUEUE_WITH_AI',
  maxSessionsPerAgent: 5,
  groupOverrides: []
})

onMounted(async () => {
  const res = await request.get('/admin/assignment/strategy')
  if (res.code === 0) Object.assign(form.value, res.data)
})

async function save() {
  const res = await request.put('/admin/assignment/strategy', form.value)
  if (res.code === 0) ElMessage.success('保存成功')
}
</script>

<template>
  <div>
    <h3>分配策略配置</h3>
    <el-form :model="form" label-width="140px">
      <el-form-item label="默认策略">
        <el-radio-group v-model="form.defaultStrategy">
          <el-radio label="ROUND_ROBIN">平均分配</el-radio>
          <el-radio label="FAMILIAR_FIRST">熟客优先</el-radio>
          <el-radio label="SPECIFY">指定ID</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="熟客有效期（天）">
        <el-input-number v-model="form.familiarValidDays" :min="1" :max="365" />
      </el-form-item>
      <el-form-item label="排队上限">
        <el-input-number v-model="form.queueLimit" :min="1" :max="200" />
      </el-form-item>
      <el-form-item label="无坐席时策略">
        <el-radio-group v-model="form.noAgentPolicy">
          <el-radio label="QUEUE_WITH_AI">AI兜底+排队</el-radio>
          <el-radio label="LEAVE_MSG">直接留言</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="单坐席接待上限">
        <el-input-number v-model="form.maxSessionsPerAgent" :min="1" :max="50" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
