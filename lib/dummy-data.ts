export const dummyUser = {
  id: "user-1",
  username: "gua_sendiri",
  unique_tag: "gua#7734",
  avatar: "G",
  avatarColor: "from-red-600 to-red-400",
};

export const dummyContacts = [
  {
    id: "user-2",
    username: "budi_asli",
    unique_tag: "budi#4291",
    avatar: "B",
    avatarColor: "from-violet-600 to-pink-500",
    online: true,
    lastSeen: new Date(),
  },
  {
    id: "user-3",
    username: "rara.exe",
    unique_tag: "rara#8810",
    avatar: "R",
    avatarColor: "from-pink-500 to-orange-400",
    online: true,
    lastSeen: new Date(),
  },
  {
    id: "user-4",
    username: "aldy_dev",
    unique_tag: "aldy#3302",
    avatar: "A",
    avatarColor: "from-emerald-400 to-cyan-400",
    online: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "user-5",
    username: "dimas99",
    unique_tag: "dimas#5571",
    avatar: "D",
    avatarColor: "from-orange-400 to-pink-500",
    online: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: "user-6",
    username: "sinta_w",
    unique_tag: "sinta#1190",
    avatar: "S",
    avatarColor: "from-cyan-400 to-violet-600",
    online: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

export const dummyConversations = [
  {
    id: "conv-1",
    contactId: "user-2",
    lastMessage: "oke siap bro 🔥",
    lastTime: "12:41",
    unread: 2,
  },
  {
    id: "conv-2",
    contactId: "user-3",
    lastMessage: "haha iya tau 😭",
    lastTime: "11:20",
    unread: 0,
  },
  {
    id: "conv-3",
    contactId: "user-4",
    lastMessage: "push dulu ya brb",
    lastTime: "Kem.",
    unread: 0,
  },
  {
    id: "conv-4",
    contactId: "user-5",
    lastMessage: "wkwk iya bro",
    lastTime: "Sen.",
    unread: 0,
  },
  {
    id: "conv-5",
    contactId: "user-6",
    lastMessage: "ok nanti gua cek",
    lastTime: "Min.",
    unread: 0,
  },
];

export const dummyMessages: Record<string, {
  id: string; senderId: string; text: string; time: string; isRead: boolean;
}[]> = {
  "conv-1": [
    { id: "m1", senderId: "user-2", text: "bro udah coba deploy belum?", time: "12:30", isRead: true },
    { id: "m2", senderId: "user-1", text: "belum, masih ada bug di auth-nya", time: "12:31", isRead: true },
    { id: "m3", senderId: "user-2", text: "wah samaan, gua juga kemarin stuck di situ", time: "12:32", isRead: true },
    { id: "m4", senderId: "user-1", text: "pake supabase kan? coba check RLS policy nya, mungkin itu masalahnya", time: "12:35", isRead: true },
    { id: "m5", senderId: "user-2", text: "OH BENER BANGET. policy read-nya belum di enable 😭", time: "12:37", isRead: true },
    { id: "m6", senderId: "user-2", text: "oke siap bro 🔥", time: "12:41", isRead: false },
  ],
  "conv-2": [
    { id: "m1", senderId: "user-3", text: "eh lo udah nonton series itu belum?", time: "11:00", isRead: true },
    { id: "m2", senderId: "user-1", text: "yang mana?", time: "11:05", isRead: true },
    { id: "m3", senderId: "user-3", text: "yang viral di tiktok kemarin", time: "11:10", isRead: true },
    { id: "m4", senderId: "user-1", text: "belum sempet, gimana?", time: "11:15", isRead: true },
    { id: "m5", senderId: "user-3", text: "haha iya tau 😭", time: "11:20", isRead: true },
  ],
  "conv-3": [
    { id: "m1", senderId: "user-1", text: "ld gimana progressnya?", time: "Kem.", isRead: true },
    { id: "m2", senderId: "user-4", text: "push dulu ya brb", time: "Kem.", isRead: true },
  ],
  "conv-4": [
    { id: "m1", senderId: "user-5", text: "wkwk iya bro", time: "Sen.", isRead: true },
  ],
  "conv-5": [
    { id: "m1", senderId: "user-1", text: "cek dulu ya ntar", time: "Min.", isRead: true },
    { id: "m2", senderId: "user-6", text: "ok nanti gua cek", time: "Min.", isRead: true },
  ],
};
