"use client";

import { useFcmToken } from "@/lib/hooks/useFcmToken";

export default function FcmTokenListener({ userId }: { userId: string }) {
  useFcmToken(userId);
  return null;
}