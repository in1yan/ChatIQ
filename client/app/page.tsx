"use client";
import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { chats as initialChats, Chat, Message } from "./data/mockChats";
import { ChatSidebar } from "./components/ChatSidebar";
import { ChatView } from "./components/ChatView";

export default function Home() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeId, setActiveId] = useState<string | null>(
    initialChats[0]?.id ?? null,
  );
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebar-width');
    if (savedWidth) {
      setSidebarWidth(parseInt(savedWidth, 10));
    }
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, 240), 600); // Min 240px, Max 600px
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('sidebar-width', sidebarWidth.toString());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

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
      <style jsx global>{`
        /* Prevent text selection during resize */
        .resizing-sidebar * {
          user-select: none !important;
          cursor: col-resize !important;
        }
      `}</style>
      
      <div 
        className={`relative shrink-0 ${isResizing ? 'resizing-sidebar' : ''}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        <ChatSidebar chats={chats} activeId={activeId} onSelect={setActiveId} />
        
        {/* Resize Handle */}
        <div
          onMouseDown={() => setIsResizing(true)}
          className={`absolute top-0 right-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-primary/20 cursor-col-resize transition-all duration-150 group z-10 ${
            isResizing ? 'w-1.5 bg-primary/30' : ''
          }`}
          role="separator"
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          aria-valuenow={sidebarWidth}
          aria-valuemin={240}
          aria-valuemax={600}
        >
          <div className={`absolute inset-y-0 right-0 w-px bg-border transition-opacity duration-150 ${
            isResizing ? 'opacity-0' : ''
          }`} />
          
          {/* Hover indicator */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="flex flex-col gap-1 -mr-0.5">
              <div className="w-0.5 h-3 bg-primary/60 rounded-full" />
              <div className="w-0.5 h-3 bg-primary/60 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      {activeChat ? (
        <ChatView chat={activeChat} onSend={handleSend} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center animate-[fade-in_400ms_cubic-bezier(0.16,1,0.3,1)]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary/40 animate-[float_3s_ease-in-out_infinite]" />
            </div>
            <p className="text-base leading-normal">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
