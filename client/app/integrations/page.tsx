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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </button>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Connect your messaging platforms to manage all conversations in one
          place.
        </p>

        <div className="space-y-3">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg p-5 flex items-center gap-4"
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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  {item.connected && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
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
