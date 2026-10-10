<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'
import { useUserStore } from '@/store/user'
import { bindMessageListener, normalizeMessage } from '@/sdk/easemob'

const userStore = useUserStore()
const sessions = ref<any[]>([])
const currentSession = ref<any>(null)
const messages = ref<any[]>([])
const input = ref('')
const loading = ref(false)
const imMessageIds = new Set<string>()

async function loadSessions() {
  const res = await request.get('/admin/workbench/sessions')
  if (res.code === 0) {
    sessions.value = res.data.list || []
    if (currentSession.value) {
      const updated = sessions.value.find(s => s.id === currentSession.value.id)
      if (updated) currentSession.value = updated
    }
  }
}

function isSameMessage(a: any, b: any) {
  return a.senderType === b.senderType && a.content === b.content && a.createTime === b.createTime
}

async function loadMessages() {
  if (!currentSession.value) return
  const sessionId = currentSession.value.id
  const res = await request.get(`/admin/workbench/messages/${sessionId}`, {
    params: { limit: 50 }
  })
  if (res.code !== 0) return
  if (!currentSession.value || currentSession.value.id !== sessionId) return
  messages.value = (res.data || []) as any[]
}

async function selectSession(s: any) {
  currentSession.value = s
  messages.value = []
  await loadMessages()
}

async function send() {
  if (!currentSession.value || !input.value.trim()) return
  await request.post('/admin/workbench/send', {
    sessionId: currentSession.value.id,
    type: 'TXT',
    content: input.value
  })
  input.value = ''
  await loadMessages()
}

async function closeSession(s: any) {
  await request.post('/admin/workbench/close', { sessionId: s.id, reason: 'AGENT_CLOSE' })
  ElMessage.success('会话已结束')
  currentSession.value = null
  await loadSessions()
}

async function online() {
  await request.post('/admin/workbench/online', {})
}

function handleImMessage(raw: any) {
  const groupId = raw.to
  let session = sessions.value.find(s => s.groupId === groupId)

  // 如果列表里还没有这个会话（比如刚被分配进来），刷新会话列表
  if (!session) {
    loadSessions()
    return
  }

  const normalized = normalizeMessage(raw, userStore.userId, session.aiAccountId)
  if (!normalized.content) return
  session.lastMsgTime = normalized.createTime

  if (normalized.senderType === 'AGENT') return
  if (imMessageIds.has(normalized.msgId)) return
  imMessageIds.add(normalized.msgId)

  if (currentSession.value && currentSession.value.id === session.id) {
    if (!messages.value.some(m => isSameMessage(m, normalized))) {
      messages.value.push(normalized)
    }
  }
}

onMounted(() => {
  online()
  loadSessions()
  bindMessageListener({
    onTextMessage: handleImMessage,
    onDisconnected: () => console.warn('console im disconnected')
  })
})

onUnmounted(() => {
  // 保留 IM 监听器解绑逻辑（sdk 内部处理）
})
</script>

<template>
  <div class="workbench">
    <div class="left">
      <div class="session-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="session-item"
          :class="{ active: currentSession?.id === s.id }"
          @click="selectSession(s)"
        >
          <div class="name">{{ s.userAccountId }}</div>
          <div class="status">{{ s.status }}</div>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="chat-header">
        {{ currentSession ? currentSession.userAccountId : '请选择会话' }}
      </div>
      <div class="chat-body">
        <template v-if="currentSession">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-row"
            :class="{ me: msg.senderType === 'AGENT' }"
          >
            <div class="bubble">
              <div class="meta">{{ msg.senderType }} · {{ msg.createTime }}</div>
              <div class="content">{{ msg.content }}</div>
            </div>
          </div>
        </template>
        <div v-else class="empty-tip">请选择左侧会话</div>
      </div>
      <div class="chat-footer">
        <el-input v-model="input" placeholder="请输入回复..." @keydown.enter="send">
          <template #append>
            <el-button :loading="loading" @click="send">发送</el-button>
          </template>
        </el-input>
        <el-button v-if="currentSession" type="danger" @click="closeSession(currentSession)">
          结束会话
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.workbench {
  display: flex;
  gap: 16px;
  height: calc(100vh - 120px);
}
.left {
  width: 280px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}
.session-list {
  height: 100%;
  overflow-y: auto;
}
.right {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}
.chat-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e5e5;
  font-weight: 600;
}
.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
.chat-footer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #e5e5e5;
}
.session-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.session-item:hover,
.session-item.active {
  background: #f5f6f8;
}
.message-row {
  display: flex;
  margin-bottom: 12px;
}
.message-row.me {
  justify-content: flex-end;
}
.bubble {
  max-width: 60%;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f1f1f1;
}
.message-row.me .bubble {
  background: #d6ebff;
}
.meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}
</style>
