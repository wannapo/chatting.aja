// lib/hooks/useFcmToken.ts
"use client";

import { useEffect } from "react";
import { requestFcmToken, listenForegroundMessages } from "@/lib/firebase/client";
import { createClient } from "@/lib/supabase/client";

export function useFcmToken(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    async function registerToken() {
      const token = await requestFcmToken();
      if (!token) return;

      await supabase.from("fcm_tokens").upsert(
        {
          user_id: userId,
          token,
          device_info: navigator.userAgent,
        },
        { onConflict: "token" }
      );
    }

    registerToken();

    listenForegroundMessages((payload) => {
      console.log("Notif masuk saat tab aktif:", payload);
    });
  }, [userId]);
}

export async function removeFcmTokenOnLogout() {
  const supabase = createClient();
  const currentToken = await requestFcmToken();

  if (currentToken) {
    await supabase.from("fcm_tokens").delete().eq("token", currentToken);
  }
}