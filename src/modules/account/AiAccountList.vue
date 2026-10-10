<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

interface AiAccount {
  id: number
  easemobId: string
  nickname: string
  groupId: number | null
  status: number
  createTime: string
}

interface Group {
  id: number
  name: string
}

const ais = ref<AiAccount[]>([])
const groups = ref<Group[]>([])
const loading = ref(false)

const dialogVisible = ref(false)
const saving = ref(false)
const form = ref<Partial<AiAccount>>({})

const groupName = (id: number | null) =>
  groups.value.find((g) => g.id === id)?.name || '-'

async function load() {
  loading.value = true
  try {
    const [r1, r2] = await Promise.all([
      request.get('/admin/account/ai-accounts'),
      request.get('/admin/account/groups', { params: { type: 'AI' } })
    ])
    if (r1.code === 0) ais.value = r1.data || []
    if (r2.code === 0) groups.value = r2.data || []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { easemobId: '', nickname: '', groupId: null, status: 1 }
  dialogVisible.value = true
}

function openEdit(row: AiAccount) {
  form.value = { ...row }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.easemobId && !form.value.id) {
    ElMessage.warning('请填写环信ID')
    return
  }
  saving.value = true
  try {
    const res = form.value.id
      ? await request.put(`/admin/account/ai-accounts/${form.value.id}`, form.value)
      : await request.post('/admin/account/ai-accounts', form.value)
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

async function remove(row: AiAccount) {
  await ElMessageBox.confirm(
    `确定删除 AI 账号「${row.nickname || row.easemobId}」吗？`,
    '删除确认',
    { type: 'warning' }
  )
  const res = await request.delete(`/admin/account/ai-accounts/${row.id}`)
  if (res.code === 0) {
    ElMessage.success('删除成功')
    load()
  } else {
    ElMessage.error(res.msg || '删除失败')
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div style="margin-bottom: 12px">
      <el-button type="primary" @click="openCreate">新增 AI 账号</el-button>
    </div>
    <el-table v-loading="loading" :data="ais" border>
      <el-table-column prop="easemobId" label="环信ID" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column label="所属 AI 组">
        <template #default="{ row }">{{ groupName(row.groupId) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="form.id ? '编辑 AI 账号' : '新增 AI 账号'"
      width="480px"
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="环信ID" required>
          <el-input v-model="form.easemobId" :disabled="!!form.id" placeholder="环信用户ID" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item label="AI 组">
          <el-select v-model="form.groupId" clearable placeholder="选择 AI 组" style="width: 100%">
            <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id" />
          </el-select>
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
  </div>
</template>
