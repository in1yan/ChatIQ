import { Search, Settings, Puzzle } from "lucide-react";
import { useState } from "react";
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
    <aside className="w-80 border-r border-border flex flex-col bg-sidebar h-full shrink-0">
      {/* Profile header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">
              {currentUser.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Active</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/integrations")}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Integrations"
          >
            <Puzzle className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-notion-hover ${
              activeId === chat.id ? "bg-notion-active" : ""
            }`}
          >
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-[2px]">
                <PlatformIcon platform={chat.platform} size={11} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground truncate">
                  {chat.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {chat.timestamp}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {chat.lastMessage}
              </p>
            </div>
            {chat.unread > 0 && (
              <span className="h-5 w-5 rounded-full bg-notion-blue text-[11px] font-medium flex items-center justify-center shrink-0 text-primary-foreground">
                {chat.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
