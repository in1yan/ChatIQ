import { Search, Settings, Puzzle } from "lucide-react";
import { useState } from "react";
import type React from "react";
import { Chat, currentUser } from "../data/mockChats";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { PlatformIcon } from "./PlatformIcon";
import { useRouter } from "next/navigation";
interface ChatSidebarProps {
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ChatSidebar({ chats, activeId, onSelect }: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-80 border-r border-border flex flex-col bg-sidebar h-full shrink-0 animate-[slide-in-left_400ms_cubic-bezier(0.16,1,0.3,1)]">
      {/* Profile header */}
      <div className="p-4 border-b border-border flex items-center justify-between animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {currentUser.name}
            </p>
            <p className="text-xs leading-tight mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-online"></span>
              <span className="text-online font-medium">Active</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/integrations")}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150 hover:scale-105 active:scale-95"
            title="Integrations"
          >
            <Puzzle className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150 hover:scale-105 active:scale-95"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_200ms_backwards]">
        <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full leading-normal"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((chat, index) => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            style={{ animationDelay: `${Math.min(index * 50, 400)}ms` } as React.CSSProperties}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-notion-hover hover:translate-x-0.5 active:scale-[0.98] animate-[slide-up_300ms_cubic-bezier(0.16,1,0.3,1)_backwards] relative ${
              activeId === chat.id ? "bg-notion-active before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r" : ""
            }`}
          >
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5">
                <PlatformIcon platform={chat.platform} size={10} showBackground />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground truncate leading-tight">
                  {chat.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2 leading-tight">
                  {chat.timestamp}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate leading-normal">
                {chat.lastMessage}
              </p>
            </div>
            {chat.unread > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-xs font-semibold flex items-center justify-center shrink-0 text-primary-foreground leading-none shadow-sm">
                {chat.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
