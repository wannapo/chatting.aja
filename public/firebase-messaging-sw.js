// public/firebase-messaging-sw.js
// File ini WAJIB ada di root folder /public (bukan di dalam /public/lib dll)
// karena scope service worker default itu berdasarkan lokasi filenya.
// Inilah "otak" yang tetap jalan di background browser/OS meskipun tab ditutup.
 
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
 
// NOTE: Service worker tidak bisa baca process.env, jadi config di-hardcode di sini.
// Ini aman karena firebaseConfig memang public (bukan secret key).
firebase.initializeApp({
  apiKey: "AIzaSyDrBrnFcnqwCUs8fCSVv3ojLu5myoZwgQk",
  authDomain: "chatting-aja.firebaseapp.com",
  projectId: "chatting-aja",
  storageBucket: "chatting-aja.firebasestorage.app",
  messagingSenderId: "844214860946",
  appId: "1:844214860946:web:104a0d4e81f07675cbba4b",
});
 
const messaging = firebase.messaging();
 
// Handler ini jalan saat notifikasi masuk DAN tab web sedang tidak fokus/tertutup
messaging.onBackgroundMessage((payload) => {
  console.log("Notifikasi diterima di background:", payload);
 
  const { title, body, icon } = payload.notification || {};
 
  const notificationTitle = title || "Pesan baru";
  const notificationOptions = {
    body: body || "Kamu punya notifikasi baru",
    icon: icon || "/icon-192.png", // ganti sesuai icon app lu
    badge: "/icon-192.png",
    data: payload.data || {}, // bisa dipakai untuk redirect saat notif diklik
  };
 
  self.registration.showNotification(notificationTitle, notificationOptions);
});
 
// Saat notifikasi diklik, arahkan user ke halaman chat yang relevan
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
 
  const chatUrl = event.notification.data?.chatId
    ? `/chat/${event.notification.data.chatId}`
    : "/chat";
 
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Kalau tab web sudah terbuka, fokuskan ke tab itu
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(chatUrl);
          return client.focus();
        }
      }
      // Kalau belum ada tab terbuka, buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(chatUrl);
      }
    })
  );
});
