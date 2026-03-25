"use client";
import { ArrowLeft, MessageCircle, Mail, Globe, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const integrations = [
  {
    id: "telegram",
    name: "Telegram",
    description: "Connect your Telegram bot to receive and send messages",
    icon: Send,
    color: "hsl(200, 80%, 50%)",
    connected: false,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Integrate WhatsApp Business API for customer messaging",
    icon: MessageCircle,
    color: "hsl(142, 70%, 45%)",
    connected: true,
  },
  {
    id: "email",
    name: "Email",
    description: "Connect your email inbox to manage conversations",
    icon: Mail,
    color: "hsl(220, 70%, 55%)",
    connected: false,
  },
  {
    id: "web",
    name: "Web Widget",
    description: "Embed a live chat widget on your website",
    icon: Globe,
    color: "hsl(270, 60%, 55%)",
    connected: false,
  },
];

const Integrations = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-all duration-200 leading-normal hover:translate-x-[-4px] active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </button>

        <h1 className="text-2xl font-semibold text-foreground mb-2 leading-tight animate-[slide-up_300ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          Integrations
        </h1>
        <p className="text-base text-muted-foreground mb-8 leading-normal animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)_150ms_backwards]">
          Connect your messaging platforms to manage all conversations in one
          place.
        </p>

        <div className="space-y-3">
          {integrations.map((item, index) => (
            <div
              key={item.id}
              style={{ animationDelay: `${200 + index * 75}ms` }}
              className="border border-border rounded-lg p-5 flex items-center gap-4 animate-[slide-up_300ms_cubic-bezier(0.16,1,0.3,1)_backwards] transition-all duration-200 hover:border-foreground/20 hover:shadow-md hover:translate-y-[-2px]"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: item.color + "20",
                  color: item.color,
                }}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {item.name}
                  </p>
                  {item.connected && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-0.5 leading-none"
                    >
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-normal">
                  {item.description}
                </p>
              </div>
              <Button
                variant={item.connected ? "outline" : "default"}
                size="sm"
                className="shrink-0"
              >
                {item.connected ? "Manage" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
