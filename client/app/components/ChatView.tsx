import { useState } from "react";
import { Send, Smile } from "lucide-react";
import { Chat, currentUser, Message } from "../data/mockChats";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface ChatViewProps {
  chat: Chat;
  onSend: (chatId: string, message: Message) => void;
}

export function ChatView({ chat, onSend }: ChatViewProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    onSend(chat.id, msg);
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_200ms_backwards]">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center gap-3 px-5 shrink-0 animate-[slide-in-right_300ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
        <Avatar className="h-8 w-8">
          <AvatarImage src={chat.avatar} alt={chat.name} />
          <AvatarFallback>{chat.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">
            {chat.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {chat.messages.map((msg, index) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-[slide-up_300ms_cubic-bezier(0.16,1,0.3,1)_backwards]`}
            >
              <div className="flex items-end gap-2 max-w-[70%]">
                {!isMe && (
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div
                    className={`rounded-lg px-3 py-2 text-base leading-normal ${
                      isMe
                        ? "bg-chat-self text-foreground"
                        : "bg-chat-other text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p
                    className={`text-xs text-muted-foreground mt-1 leading-tight ${isMe ? "text-right" : ""}`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-border px-5 py-3 animate-[slide-up_300ms_cubic-bezier(0.16,1,0.3,1)_300ms_backwards]">
        <div className="flex items-center gap-2 bg-accent rounded-lg px-3 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
          <button className="text-muted-foreground hover:text-foreground transition-all duration-150 hover:scale-110 active:scale-95">
            <Smile className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Write a message…"
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none leading-normal"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="text-notion-blue hover:opacity-80 transition-all duration-150 disabled:opacity-30 hover:scale-110 active:scale-95 disabled:hover:scale-100"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
