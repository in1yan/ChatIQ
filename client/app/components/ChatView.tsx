import { useState } from "react";
import { Send, Smile, Bot, Power, PowerOff } from "lucide-react";
import { Chat, Message } from "../page";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

import ReactMarkdown from "react-markdown";

interface ChatViewProps {
  chat: Chat;
  onSend: (chatId: string, text: string) => void;
  onToggleAi: () => void;
}

export function ChatView({ chat, onSend, onToggleAi }: ChatViewProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(chat.id, text.trim());
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_200ms_backwards]">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between gap-3 px-5 shrink-0 animate-[slide-in-right_300ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback>{chat.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {chat.name}
            </p>
            <p className="text-xs mt-1 flex items-center gap-1.5 leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-online"></span>
              <span className="text-online font-medium">Online</span>
            </p>
          </div>
        </div>

        {/* AI Toggle Button */}
        <button 
          onClick={onToggleAi}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ${
            chat.ai_paused 
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20" 
              : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
          }`}
        >
          {chat.ai_paused ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          {chat.ai_paused ? "AI Paused" : "AI Active"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {chat.messages.map((msg, index) => {
          const isAgent = msg.senderId === "agent" || msg.senderId === "me";
          const isAi = msg.senderId === "ai";
          const isUser = !isAgent && !isAi;

          return (
            <div
              key={msg.id}
              className={`flex ${
                isUser ? "justify-start" : "justify-end"
              } animate-[slide-up_300ms_cubic-bezier(0.16,1,0.3,1)_backwards]`}
            >
              <div className={`flex flex-col gap-1 max-w-[70%] ${!isUser ? "items-end" : "items-start"}`}>
                <div className="flex items-end gap-2">
                  {isUser && (
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`message-bubble rounded-lg px-3 py-2 leading-normal prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-black/10 prose-pre:text-foreground ${
                        isAgent ? "bg-chat-self text-foreground"
                        : isAi ? "bg-indigo-500/20 text-foreground"
                        : "bg-chat-other text-foreground"
                      }`}
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-1.5 px-1 ${isUser ? "text-left justify-start" : "text-right justify-end"}`}>
                  {isAi && <Bot className="w-3 h-3 text-indigo-400" />}
                  <p className="text-[10px] text-muted-foreground uppercase opacity-70">
                    {isAgent ? "Agent" : isAi ? "ChatIQ AI" : "Customer"} • {msg.timestamp}
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
            placeholder={chat.ai_paused ? "Write a manual reply..." : "AI is active. Intervene manually?"}
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none leading-normal"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="text-primary hover:opacity-80 transition-all duration-150 disabled:opacity-30 hover:scale-110 active:scale-95 disabled:hover:scale-100"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
