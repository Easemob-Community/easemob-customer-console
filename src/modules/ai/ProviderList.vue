<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

interface Provider {
  id: number
  providerCode: string
  name: string
  baseUrl: string
  appKey: string
  timeoutMs: number
  retryTimes: number
  weight: number
  status: number
  extraJson: string | null
}

interface ProviderForm {
  id?: number
  providerCode: string
  name: string
  baseUrl: string
  appKey: string
  model: string
  systemPrompt: string
  timeoutMs: number
  retryTimes: number
  weight: number
  status: number
}

const PROVIDER_TYPES = [
  { value: 'OPENAI', label: 'OpenAI 兼容（GPT / DeepSeek / Moonshot 等）' },
  { value: 'DIFY', label: 'Dify' }
]

const providers = ref<Provider[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const saving = ref(false)
const form = ref<ProviderForm>(emptyForm())

const testVisible = ref(false)
const testResult = ref<{ ok: boolean; latencyMs: number; answerSample: string } | null>(null)
const testing = ref(false)

function emptyForm(): ProviderForm {
  return {
    providerCode: 'OPENAI',
    name: '',
    baseUrl: 'https://api.openai.com/v1',
    appKey: '',
    model: 'gpt-4o-mini',
    systemPrompt: '',
    timeoutMs: 30000,
    retryTimes: 1,
    weight: 100,
    status: 1
  }
}

function parseExtra(extraJson: string | null): { model: string; systemPrompt: string } {
  try {
    const extra = extraJson ? JSON.parse(extraJson) : {}
    return { model: extra.model || '', systemPrompt: extra.systemPrompt || '' }
  } catch {
    return { model: '', systemPrompt: '' }
  }
}

const modelOf = (row: Provider) => parseExtra(row.extraJson).model || '-'

async function load() {
  loading.value = true
  try {
    const res = await request.get('/admin/ai/providers')
    if (res.code === 0) providers.value = res.data || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = emptyForm()
  dialogVisible.value = true
}

function openEdit(row: Provider) {
  const extra = parseExtra(row.extraJson)
  form.value = {
    id: row.id,
    providerCode: row.providerCode,
    name: row.name,
    baseUrl: row.baseUrl,
    appKey: '',
    model: extra.model,
    systemPrompt: extra.systemPrompt,
    timeoutMs: row.timeoutMs,
    retryTimes: row.retryTimes,
    weight: row.weight,
    status: row.status
  }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.name || !form.value.baseUrl) {
    ElMessage.warning('请填写名称和地址')
    return
  }
  if (!form.value.id && !form.value.appKey) {
    ElMessage.warning('请填写 API Key')
    return
  }
  saving.value = true
  try {
    const body = {
      providerCode: form.value.providerCode,
      name: form.value.name,
      baseUrl: form.value.baseUrl,
      appKey: form.value.appKey,
      timeoutMs: form.value.timeoutMs,
      retryTimes: form.value.retryTimes,
      weight: form.value.weight,
      status: form.value.status,
      extraJson: JSON.stringify({
        model: form.value.model,
        systemPrompt: form.value.systemPrompt
      })
    }
    const res = form.value.id
      ? await request.put(`/admin/ai/providers/${form.value.id}`, body)
      : await request.post('/admin/ai/providers', body)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      load()
    } else {
      ElMessage.error(res.msg || '保存失败')
    }
  } finally {
    saving.value = false
  }
}

async function remove(row: Provider) {
  await ElMessageBox.confirm(`确定删除厂家「${row.name}」吗？`, '删除确认', { type: 'warning' })
  const res = await request.delete(`/admin/ai/providers/${row.id}`)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    load()
  } else {
    ElMessage.error(res.msg || '删除失败')
  }
}

async function test(row: Provider) {
  testing.value = true
  testVisible.value = true
  testResult.value = null
  try {
    const res = await request.post('/admin/ai/provider/test', { id: row.id, question: '你好，请介绍一下你自己' })
    if (res.code === 0) {
      testResult.value = res.data
    }
  } finally {
    testing.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button type="primary" @click="openCreate">新增厂家</el-button>
    </div>
    <el-table v-loading="loading" :data="providers" border>
      <el-table-column prop="providerCode" label="厂家" width="100" />
      <el-table-column prop="name" label="名称" width="140" />
      <el-table-column prop="baseUrl" label="地址" show-overflow-tooltip />
      <el-table-column label="模型" width="140">
        <template #default="{ row }">{{ modelOf(row) }}</template>
      </el-table-column>
      <el-table-column prop="weight" label="权重" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button link type="success" @click="test(row)">连通性测试</el-button>
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑厂家' : '新增厂家'"
      width="560px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="厂家类型" required>
          <el-select v-model="form.providerCode" style="width: 100%">
            <el-option v-for="t in PROVIDER_TYPES" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="如：OpenAI 主账号" />
        </el-form-item>
        <el-form-item label="API 地址" required>
          <el-input v-model="form.baseUrl" placeholder="https://api.openai.com/v1" />
        </el-form-item>
        <el-form-item label="API Key" :required="!form.id">
          <el-input
            v-model="form.appKey"
            type="password"
            show-password
            :placeholder="form.id ? '留空则不修改' : 'sk-...'"
          />
        </el-form-item>
        <template v-if="form.providerCode === 'OPENAI'">
          <el-form-item label="模型">
            <el-input v-model="form.model" placeholder="gpt-4o-mini / deepseek-chat / moonshot-v1-8k ..." />
          </el-form-item>
          <el-form-item label="系统提示词">
            <el-input
              v-model="form.systemPrompt"
              type="textarea"
              :rows="3"
              placeholder="留空使用默认客服提示词"
            />
          </el-form-item>
        </template>
        <el-form-item label="超时(ms)">
          <el-input-number v-model="form.timeoutMs" :min="1000" :max="120000" :step="1000" />
        </el-form-item>
        <el-form-item label="重试次数">
          <el-input-number v-model="form.retryTimes" :min="0" :max="5" />
        </el-form-item>
        <el-form-item label="权重">
          <el-input-number v-model="form.weight" :min="0" :max="1000" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="testVisible" title="连通性测试" width="480px">
      <div v-loading="testing" style="min-height: 80px">
        <template v-if="testResult">
          <p>
            结果：
            <el-tag :type="testResult.ok ? 'success' : 'danger'">
              {{ testResult.ok ? '成功' : '失败' }}
            </el-tag>
            <span style="margin-left: 12px">耗时：{{ testResult.latencyMs }}ms</span>
          </p>
          <p style="white-space: pre-wrap; word-break: break-all">{{ testResult.answerSample }}</p>
        </template>
        <p v-else>正在调用 AI 接口...</p>
      </div>
    </el-dialog>
  </div>
</template>
