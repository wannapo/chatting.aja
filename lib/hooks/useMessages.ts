'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!conversationId) return

    // Load initial messages
    async function loadMessages() {
      setLoading(true)
      const { data } = await supabase
        .from('messages')
        .select('*, sender:profiles(id,username,unique_tag,avatar_color)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
      setLoading(false)

      // Mark as read
      await supabase.rpc('mark_messages_read', { p_conversation_id: conversationId })
    }

    loadMessages()

    // Realtime subscription
    channelRef.current = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        // Fetch sender profile for new message
        const { data: msgWithSender } = await supabase
          .from('messages')
          .select('*, sender:profiles(id,username,unique_tag,avatar_color)')
          .eq('id', payload.new.id)
          .single()

        if (msgWithSender) {
          setMessages(prev => [...prev, msgWithSender])
          // Mark read jika bukan dari diri sendiri
          await supabase.rpc('mark_messages_read', { p_conversation_id: conversationId })
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
      })
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [conversationId])

  async function sendMessage(content: string, senderId: string) {
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
    })
    return !error
  }

  return { messages, loading, sendMessage }
}
