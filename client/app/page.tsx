"use client";
import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatView } from "./components/ChatView";

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
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320); 
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/chat/customers/all");
        if (!res.ok) return;
        const data = await res.json();
        
        setChats(prevChats => {
          return data.map((c: any) => {
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
      } catch (err) { }
    };

    fetchCustomers();
    const interval = setInterval(fetchCustomers, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeId) return;

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
      } catch (err) {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeId]);

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
    } catch(err) { console.error("Send failed", err); }
  };

  const handleToggleAi = async (chatId: string) => {
    try {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, ai_paused: !c.ai_paused } : c));
      await fetch(`http://localhost:8000/api/v1/chat/${chatId}/toggle-ai`, { method: "POST" });
    } catch(err) {}
  };

  const activeChat = chats.find((c) => c.id === activeId) ?? null;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div 
        className={`relative shrink-0 ${isResizing ? 'resizing-sidebar' : ''}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        <ChatSidebar chats={chats} activeId={activeId} onSelect={setActiveId} />
        
        <div
          onMouseDown={() => setIsResizing(true)}
          className={`absolute top-0 right-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-primary/20 cursor-col-resize transition-all duration-150 z-10`}
        />
      </div>
      {activeChat ? (
        <ChatView chat={activeChat} onSend={handleSend} onToggleAi={() => handleToggleAi(activeChat.id)} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary/40" />
            </div>
            <p className="text-base leading-normal">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
