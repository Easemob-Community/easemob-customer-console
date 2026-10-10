<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const words = ref<string[]>([])
const newWord = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await request.get('/admin/ai/transfer-words')
    if (res.code === 0) words.value = res.data || []
  } finally {
    loading.value = false
  }
}

async function save(list: string[], tip: string) {
  const res = await request.put('/admin/ai/transfer-words', list)
  if (res.code === 0) {
    words.value = list
    ElMessage.success(tip)
  } else {
    ElMessage.error(res.msg || '保存失败')
  }
}

async function addWord() {
  const w = newWord.value.trim()
  if (!w) return
  if (words.value.includes(w)) {
    ElMessage.warning('关键词已存在')
    return
  }
  await save([...words.value, w], '添加成功')
  newWord.value = ''
}

async function removeWord(w: string) {
  await save(words.value.filter((x) => x !== w), '删除成功')
}

onMounted(load)
</script>

<template>
  <div v-loading="loading">
    <div style="margin-bottom: 12px">
      <el-input
        v-model="newWord"
        placeholder="新增关键词"
        style="width: 200px; margin-right: 8px"
        @keyup.enter="addWord"
      />
      <el-button type="primary" @click="addWord">添加</el-button>
    </div>
    <el-tag
      v-for="w in words"
      :key="w"
      closable
      style="margin-right: 8px; margin-bottom: 8px"
      @close="removeWord(w)"
    >
      {{ w }}
    </el-tag>
    <p v-if="!words.length" style="color: #909399">暂无关键词</p>
  </div>
</template>
