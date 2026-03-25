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
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center gap-3 px-5 shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={chat.avatar} alt={chat.name} />
          <AvatarFallback>{chat.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">
            {chat.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {chat.messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
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
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isMe
                        ? "bg-chat-self text-foreground"
                        : "bg-chat-other text-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p
                    className={`text-[10px] text-muted-foreground mt-1 ${isMe ? "text-right" : ""}`}
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
      <div className="border-t border-border px-5 py-3">
        <div className="flex items-center gap-2 bg-accent rounded-lg px-3 py-2">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Smile className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Write a message…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="text-notion-blue hover:opacity-80 transition-opacity disabled:opacity-30"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
