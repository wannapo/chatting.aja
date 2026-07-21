// app/api/notifications/send/route.ts
// Endpoint ini dipanggil otomatis oleh Supabase Database Webhook
// setiap kali ada row baru masuk ke tabel `messages`.

import { NextRequest, NextResponse } from "next/server";
import { adminMessaging } from "@/lib/firebase/admin";
import { createClient } from "@supabase/supabase-js";

// Pakai service role key karena ini server-side & butuh akses penuh
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // 1. Verifikasi request ini benar dari Supabase Webhook, bukan orang luar
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const newMessage = body.record;

  if (!newMessage) {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }

  const { sender_id, content, conversation_id } = newMessage;

  // 2. Ambil profil pengirim (buat nama di judul notif)
  const { data: sender } = await supabaseAdmin
    .from("profiles")
    .select("username")
    .eq("id", sender_id)
    .single();

  // 3. Cari semua anggota conversation ini, KECUALI si pengirim sendiri
  const { data: members, error: membersError } = await supabaseAdmin
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", conversation_id)
    .neq("user_id", sender_id);

  if (membersError || !members || members.length === 0) {
    return NextResponse.json({ message: "Tidak ada penerima di conversation ini" });
  }

  const receiverIds = members.map((m) => m.user_id);

  // 4. Ambil semua token FCM milik para penerima (bisa lebih dari 1 device per user)
  const { data: tokens, error } = await supabaseAdmin
    .from("fcm_tokens")
    .select("token")
    .in("user_id", receiverIds);

  if (error || !tokens || tokens.length === 0) {
    return NextResponse.json({ message: "Tidak ada token untuk dikirimi" });
  }

  // 5. Kirim push notification ke semua token sekaligus
  const message = {
    notification: {
      title: sender?.username ?? "Pesan baru",
      body: content?.slice(0, 100) ?? "Kamu punya pesan baru",
    },
    data: {
      chatId: String(conversation_id ?? ""),
    },
    tokens: tokens.map((t) => t.token),
  };

  try {
    const response = await adminMessaging.sendEachForMulticast(message);

    // 6. Bersihkan token yang sudah tidak valid (device uninstall app, dll)
    const invalidTokens: string[] = [];
    response.responses.forEach((res, idx) => {
      if (!res.success && res.error?.code === "messaging/registration-token-not-registered") {
        invalidTokens.push(tokens[idx].token);
      }
    });

    if (invalidTokens.length > 0) {
      await supabaseAdmin.from("fcm_tokens").delete().in("token", invalidTokens);
    }

    return NextResponse.json({
      success: response.successCount,
      failed: response.failureCount,
    });
  } catch (err) {
    console.error("Gagal kirim notifikasi:", err);
    return NextResponse.json({ error: "Gagal kirim notifikasi" }, { status: 500 });
  }
}