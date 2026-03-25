export type Platform = "whatsapp" | "telegram" | "email" | "web";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  platform: Platform;
  messages: Message[];
}

const ME = "me";

export const currentUser = {
  id: ME,
  name: "You",
  avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=You",
};

export const chats: Chat[] = [
  {
    id: "1",
    name: "Alex Rivera",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Alex",
    lastMessage: "Let me check the design spec",
    timestamp: "2:14 PM",
    unread: 2,
    platform: "whatsapp",
    messages: [
      { id: "m1", senderId: "1", text: "Hey! Did you see the new project brief?", timestamp: "1:50 PM" },
      { id: "m2", senderId: ME, text: "Yeah, I went through it this morning. Looks solid.", timestamp: "1:52 PM" },
      { id: "m3", senderId: "1", text: "Great. I think we should start with the wireframes first.", timestamp: "2:00 PM" },
      { id: "m4", senderId: ME, text: "Agreed. Can you share the Figma link?", timestamp: "2:05 PM" },
      { id: "m5", senderId: "1", text: "Let me check the design spec", timestamp: "2:14 PM" },
    ],
  },
  {
    id: "2",
    name: "Samira Khan",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Samira",
    lastMessage: "The deploy went smoothly 🚀",
    timestamp: "12:30 PM",
    unread: 0,
    platform: "telegram",
    messages: [
      { id: "m1", senderId: "2", text: "Deploy is starting now", timestamp: "12:10 PM" },
      { id: "m2", senderId: ME, text: "Fingers crossed!", timestamp: "12:15 PM" },
      { id: "m3", senderId: "2", text: "The deploy went smoothly 🚀", timestamp: "12:30 PM" },
    ],
  },
  {
    id: "3",
    name: "Jordan Lee",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Jordan",
    lastMessage: "Can we sync tomorrow at 10?",
    timestamp: "Yesterday",
    unread: 1,
    platform: "email",
    messages: [
      { id: "m1", senderId: ME, text: "How's the API integration going?", timestamp: "Yesterday" },
      { id: "m2", senderId: "3", text: "Almost done, just fixing edge cases.", timestamp: "Yesterday" },
      { id: "m3", senderId: "3", text: "Can we sync tomorrow at 10?", timestamp: "Yesterday" },
    ],
  },
  {
    id: "4",
    name: "Priya Patel",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Priya",
    lastMessage: "Thanks for the review!",
    timestamp: "Monday",
    unread: 0,
    platform: "web",
    messages: [
      { id: "m1", senderId: "4", text: "PR is ready for review", timestamp: "Monday" },
      { id: "m2", senderId: ME, text: "I left a few comments, mostly minor.", timestamp: "Monday" },
      { id: "m3", senderId: "4", text: "Thanks for the review!", timestamp: "Monday" },
    ],
  },
  {
    id: "5",
    name: "Marcus Chen",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Marcus",
    lastMessage: "Let's grab coffee sometime",
    timestamp: "Last week",
    unread: 0,
    platform: "whatsapp",
    messages: [
      { id: "m1", senderId: "5", text: "Hey, long time no chat!", timestamp: "Last week" },
      { id: "m2", senderId: ME, text: "I know! Been super busy with the launch.", timestamp: "Last week" },
      { id: "m3", senderId: "5", text: "Let's grab coffee sometime", timestamp: "Last week" },
    ],
  },
];
