import { Search, Settings, Puzzle, GitFork, LogOut, MessageSquare, Layout, Mail, Globe } from "lucide-react";
import { useState } from "react";
import type React from "react";
import { Chat, currentUser } from "../data/mockChats";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { PlatformIcon } from "./PlatformIcon";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../lib/auth";

interface ChatSidebarProps {
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ChatSidebar({ chats, activeId, onSelect }: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const filtered = chats.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesChannel = selectedChannel === "all" || c.platform === selectedChannel;
    return matchesSearch && matchesChannel;
  });

  return (
    <aside className="w-full border-r border-border flex flex-col bg-sidebar h-full animate-[slide-in-left_400ms_cubic-bezier(0.16,1,0.3,1)]" aria-label="Chat sidebar">
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
              <span className="w-1.5 h-1.5 rounded-full bg-online" aria-hidden="true"></span>
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
          <button
            onClick={() => router.push("/agent")}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150 hover:scale-105 active:scale-95"
            aria-label="Agent management"
          >
            <GitFork className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-3 py-4 space-y-1 animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_150ms_backwards]">
        <button
          onClick={() => router.push("/")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium ${
            pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <MessageSquare className={`h-4 w-4 ${pathname === "/" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
          Conversations
        </button>
        <button
          onClick={() => router.push("/insights")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium ${
            pathname.includes("/insights") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Layout className={`h-4 w-4 ${pathname.includes("/insights") ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
          Intelligence Dashboard
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_200ms_backwards]">
        <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full leading-normal"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Channel Switcher */}
      <div className="px-3 py-3 border-b border-border flex flex-wrap gap-2 animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_250ms_backwards]" role="tablist" aria-label="Filter by channel">
        {[
          { id: "all", label: "All", icon: MessageSquare },
          { id: "whatsapp", label: "WhatsApp", icon: PlatformIcon, color: "hover:text-whatsapp" },
          { id: "telegram", label: "Telegram", icon: PlatformIcon, color: "hover:text-telegram" },
          { id: "email", label: "Email", icon: Mail, color: "hover:text-blue-500" },
          { id: "web", label: "Web", icon: Globe, color: "hover:text-primary" },
        ].map((channel) => (
          <button
            key={channel.id}
            onClick={() => setSelectedChannel(channel.id)}
            role="tab"
            aria-selected={selectedChannel === channel.id}
            aria-label={`Filter by ${channel.label}`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border border-transparent hover:border-border active:scale-95 ${
              selectedChannel === channel.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : `bg-accent/40 text-muted-foreground ${channel.color || "hover:text-foreground"}`
            }`}
          >
            {channel.id === "whatsapp" || channel.id === "telegram" ? (
              <PlatformIcon platform={channel.id as Platform} size={12} />
            ) : channel.id === "all" ? (
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            ) : channel.id === "email" ? (
              <Mail className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Globe className="h-3.5 w-3.5 shrink-0" />
            )}
            {channel.label}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Conversations">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No conversations found</p>
            <p className="text-xs text-muted-foreground">
              {search ? "Try a different search term" : "No active conversations yet"}
            </p>
          </div>
        ) : (
          filtered.map((chat, index) => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            role="listitem"
            aria-label={`Chat with ${chat.name}, ${chat.unread > 0 ? `${chat.unread} unread messages, ` : ''}last message: ${chat.lastMessage}`}
            aria-current={activeId === chat.id ? "true" : undefined}
            style={
              {
                animationDelay: `${Math.min(index * 50, 400)}ms`,
              } as React.CSSProperties
            }
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-notion-hover hover:translate-x-0.5 active:scale-[0.98] animate-[slide-up_300ms_cubic-bezier(0.16,1,0.3,1)_backwards] relative ${
              activeId === chat.id
                ? "bg-notion-active before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r"
                : ""
            }`}
          >
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5">
                <PlatformIcon
                  platform={chat.platform}
                  size={10}
                  showBackground
                />
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
        )))}
      </div>

      {/* Sidebar Footer (Logout) */}
      <div className="p-4 border-t border-border mt-auto animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_500ms_backwards]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 border border-transparent hover:border-destructive/20 active:scale-[0.98]"
          aria-label="Sign out from ChatIQ"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Sign out from ChatIQ</span>
        </button>
      </div>
    </aside>
  );
}
