'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ConversationWithContact {
  id: string
  contact: {
    id: string
    username: string
    unique_tag: string
    avatar_color: string
    last_seen: string
  }
  last_message: string
  last_time: string
  unread: number
}

export function useConversations(userId: string) {
  const [conversations, setConversations] = useState<ConversationWithContact[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    loadConversations()

    // Debug: pastikan sesi login yang aktif memang cocok dengan userId yang dipakai
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('[useConversations] getSession error:', error)
      const sessionUserId = data?.session?.user?.id
      if (sessionUserId !== userId) {
        console.warn('[useConversations] SESI TIDAK COCOK! session.user.id =', sessionUserId, ' vs userId prop =', userId)
      } else {
        console.log('[useConversations] Sesi cocok, user aktif:', sessionUserId)
      }
    })

    // Realtime: refresh when new message arrives
    // Nama channel dibikin unik per instance, soalnya hook ini bisa dipakai
    // di beberapa komponen sekaligus (Sidebar + halaman Beranda, dll)
    const uniqueSuffix = Math.random().toString(36).slice(2)
    const channel = supabase
      .channel(`conversations-updates-${userId}-${uniqueSuffix}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, () => loadConversations())
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      }, () => loadConversations())
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [userId])

  async function loadConversations() {
    // Get all conversations where user is member
    const { data: memberRows, error: memberErr } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', userId)

    if (memberErr) console.error('[useConversations] memberRows error:', memberErr)

    if (!memberRows?.length) { setConversations([]); setLoading(false); return }

    const convIds = memberRows.map(r => r.conversation_id)

    // Get the other member's user_id per conversation
    const { data: otherMembers, error: otherErr } = await supabase
      .from('conversation_members')
      .select('conversation_id, user_id')
      .in('conversation_id', convIds)
      .neq('user_id', userId)

    if (otherErr) console.error('[useConversations] otherMembers error:', otherErr)

    if (!otherMembers?.length) { setConversations([]); setLoading(false); return }

    // Get all contact profiles in one query
    const contactIds = [...new Set(otherMembers.map(m => m.user_id))]
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, username, unique_tag, avatar_color, last_seen')
      .in('id', contactIds)

    if (profilesErr) console.error('[useConversations] profiles error:', profilesErr)

    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))

    // Build results
    const results: ConversationWithContact[] = []

    for (const convId of convIds) {
      const member = otherMembers.find(m => m.conversation_id === convId)
      if (!member) continue

      const contact = profileMap[member.user_id]
      if (!contact) continue

      // Last message
      const { data: lastMsgArr } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(1)

      // Unread count
      const { count: unread } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .eq('is_read', false)
        .neq('sender_id', userId)

      const lastMsg = lastMsgArr?.[0]

      results.push({
        id: convId,
        contact,
        last_message: lastMsg?.content || '',
        last_time: lastMsg ? formatTime(lastMsg.created_at) : '',
        unread: unread || 0,
      })
    }

    // Sort by most recent message
    results.sort((a, b) => {
      if (!a.last_time && !b.last_time) return 0
      if (!a.last_time) return 1
      if (!b.last_time) return -1
      return 0
    })

    setConversations(results)
    setLoading(false)
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    if (diffDays === 0) return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Kem.'
    if (diffDays < 7) return ['Min.','Sen.','Sel.','Rab.','Kam.','Jum.','Sab.'][date.getDay()]
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })
  }

  return { conversations, loading, reload: loadConversations }
}
