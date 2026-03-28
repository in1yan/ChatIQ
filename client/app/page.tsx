"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatView } from "./components/ChatView";
import { useAuth } from "./lib/auth";

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
  ai_paused: boolean;
  messages: Message[];
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarWidth] = useState(320);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/chat/customers/all");
        if (!res.ok) return;
        const data = await res.json();
        
        setChats(prevChats => {
          return data.map((c: { id: number; full_name?: string; telegram_username?: string; phone_number?: string; profile_picture_url?: string; created_at: string; channel: Platform; ai_paused: boolean }) => {
            const existing = prevChats.find(pc => pc.id === String(c.id));
            return {
              id: String(c.id),
              name: c.full_name || c.telegram_username || c.phone_number || "Unknown User",
              avatar: c.profile_picture_url || `https://api.dicebear.com/9.x/notionists/svg?seed=${c.id}`,
              lastMessage: existing?.lastMessage || "...",
              timestamp: new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              unread: 0,
              platform: c.channel as Platform,
              ai_paused: c.ai_paused,
              messages: existing?.messages || []
            };
          });
        });
      } catch { }
    };

    fetchCustomers();
    const interval = setInterval(fetchCustomers, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !activeId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/chat/${activeId}`);
        if (!res.ok) return;
        const text = await res.text();
        const lines = text.split("\n").filter(Boolean);
        const parsedMessages = lines.map(line => JSON.parse(line));
        
        const newMessages: Message[] = parsedMessages.map((m: any, i: number) => {
           let sender = m.role === "user" ? activeId : "ai"; // 'ai' by default
           let contentText = m.content;
           
           if (m.role === "model" && contentText.startsWith("[AGENT] ")) {
             sender = "agent";
             contentText = contentText.replace("[AGENT] ", "");
           } else if (m.role === "agent") {
             sender = "agent";
           }

           return {
             id: `msg-${i}`,
             senderId: sender,
             text: contentText,
             timestamp: new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
           };
        });

        setChats(prev => prev.map(c => 
          c.id === activeId ? { 
            ...c, 
            messages: newMessages,
            lastMessage: newMessages[newMessages.length - 1]?.text || "..."
          } : c
        ));
      } catch {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeId, isAuthenticated]);

  const handleSend = async (chatId: string, text: string) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, { id: `opt-${Date.now()}`, senderId: "agent", text, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }],
              lastMessage: text,
            }
          : c,
      ),
    );
    
    try {
      await fetch(`http://localhost:8000/api/v1/chat/${chatId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
    } catch {}
  };

  const handleToggleAi = async (chatId: string) => {
    try {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, ai_paused: !c.ai_paused } : c));
      await fetch(`http://localhost:8000/api/v1/chat/${chatId}/toggle-ai`, { method: "POST" });
    } catch {}
  };

  const activeChat = chats.find((c) => c.id === activeId) ?? null;

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div 
        className="relative shrink-0"
        style={{ width: `${sidebarWidth}px` }}
        role="complementary"
        aria-label="Chat sidebar"
      >
        <ChatSidebar chats={chats} activeId={activeId} onSelect={setActiveId} />
        
        <div
          className="absolute top-0 right-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-primary/20 cursor-col-resize transition-all duration-150 z-10"
          role="separator"
          aria-label="Resize sidebar"
        />
      </div>
      {activeChat ? (
        <ChatView chat={activeChat} onSend={handleSend} onToggleAi={() => handleToggleAi(activeChat.id)} />
      ) : (
        <main className="flex-1 flex items-center justify-center text-muted-foreground" role="main" aria-label="Chat view">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center" aria-hidden="true">
              <MessageSquare className="h-8 w-8 text-primary/40" />
            </div>
            <p className="text-base leading-normal">Select a conversation to start messaging</p>
          </div>
        </main>
      )}
    </div>
  );
}
