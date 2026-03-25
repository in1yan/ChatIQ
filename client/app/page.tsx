"use client";
import Image from "next/image";
import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { chats as initialChats, Chat, Message } from "./data/mockChats";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatView } from "./components/ChatView";

export default function Home() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeId, setActiveId] = useState<string | null>(
    initialChats[0]?.id ?? null,
  );

  const activeChat = chats.find((c) => c.id === activeId) ?? null;

  const handleSend = (chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, message],
              lastMessage: message.text,
              timestamp: message.timestamp,
            }
          : c,
      ),
    );
  };
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar chats={chats} activeId={activeId} onSelect={setActiveId} />
      {activeChat ? (
        <ChatView chat={activeChat} onSend={handleSend} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
