'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useOnlineStatus(userId: string | undefined) {
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Update last_seen setiap 30 detik
    async function updateLastSeen() {
      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', userId)
    }

    updateLastSeen()
    const interval = setInterval(updateLastSeen, 30000)
    return () => clearInterval(interval)
  }, [userId])
}
