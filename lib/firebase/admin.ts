// lib/firebase/admin.ts
// Firebase Admin hanya boleh dipakai di SERVER (API Routes), jangan di client!

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let adminApp: App;

function getPrivateKey(): string {
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (base64Key) {
    return Buffer.from(base64Key, "base64").toString("utf-8");
  }
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "";
}

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
    }),
  });
} else {
  adminApp = getApps()[0];
}

export const adminMessaging = getMessaging(adminApp);