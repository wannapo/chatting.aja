export interface Profile {
  id: string
  username: string
  unique_tag: string
  avatar_color: string
  created_at: string
  last_seen: string
}

export interface Conversation {
  id: string
  created_at: string
  members?: Profile[]
  last_message?: Message
  unread_count?: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  sender?: Profile
}

export interface FriendRequest {
  id: string
  from_user_id: string
  to_user_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  from_user?: Profile
  to_user?: Profile
}

export function getInitial(username: string): string {
  return username.charAt(0).toUpperCase()
}

export function formatLastSeen(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  return `${Math.floor(hours / 24)} hari lalu`
}

export function isOnline(lastSeen: string): boolean {
  return Date.now() - new Date(lastSeen).getTime() < 60000
}

export function generateUniqueTag(username: string): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${username.toLowerCase().replace(/[^a-z0-9_]/g, '_')}#${num}`
}

export const AVATAR_COLORS = [
  'from-violet-600 to-pink-500',
  'from-pink-500 to-orange-400',
  'from-emerald-400 to-cyan-400',
  'from-orange-400 to-pink-500',
  'from-cyan-400 to-violet-600',
  'from-red-600 to-red-400',
  'from-lime-400 to-emerald-500',
  'from-fuchsia-500 to-pink-400',
]

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}
