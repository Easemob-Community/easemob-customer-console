import SDK from 'easemob-websdk'

const APP_KEY = import.meta.env.VITE_EASEMOB_APP_KEY || 'easemob-demo#support'

const conn = new SDK.connection({ appKey: APP_KEY })

let inited = false

export interface EasemobMessage {
  id: string
  msgId?: string
  from: string
  to: string
  type?: string
  msg?: string
  data?: string
  ext?: Record<string, any>
  time?: number
}

export interface NormalizedMessage {
  id: string
  msgId: string
  senderType: 'USER' | 'AGENT' | 'AI' | 'SYSTEM'
  senderId: string
  content: string
  createTime: string
  ext?: Record<string, any>
}

export async function loginEasemob(userId: string, token: string) {
  if (inited) return
  await conn.open({ user: userId, accessToken: token })
  inited = true
}

export function getConn() {
  return conn
}

function formatTime(t?: number): string {
  if (!t) return ''
  const d = new Date(t)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function normalizeMessage(
  m: EasemobMessage,
  currentUserId: string,
  aiAccountId?: string
): NormalizedMessage {
  let senderType: NormalizedMessage['senderType'] = 'USER'
  if (m.from === currentUserId) {
    senderType = 'AGENT'
  } else if (aiAccountId && m.from === aiAccountId) {
    senderType = 'AI'
  }
  const id = m.id || m.msgId || `em-${Date.now()}`
  return {
    id,
    msgId: id,
    senderType,
    senderId: m.from,
    content: (m.msg || m.data || '') as string,
    createTime: formatTime(m.time),
    ext: m.ext || {}
  }
}

export function bindMessageListener(handlers: {
  onTextMessage: (m: EasemobMessage, raw: EasemobMessage) => void
  onDisconnected?: () => void
}) {
  conn.addEventHandler('cs-console', {
    onTextMessage: (m: any) => {
      handlers.onTextMessage(m as EasemobMessage, m)
    },
    onDisconnected: () => {
      handlers.onDisconnected?.()
    }
  })
}
