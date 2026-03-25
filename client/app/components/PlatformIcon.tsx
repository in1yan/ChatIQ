import { MessageCircle, Send, Mail, Globe } from "lucide-react";
import { Platform } from "../data/mockChats";

const platformConfig: Record<
  Platform,
  { icon: typeof Send; color: string; label: string }
> = {
  telegram: { icon: Send, color: "hsl(200, 80%, 50%)", label: "Telegram" },
  whatsapp: {
    icon: MessageCircle,
    color: "hsl(142, 70%, 45%)",
    label: "WhatsApp",
  },
  email: { icon: Mail, color: "hsl(220, 70%, 55%)", label: "Email" },
  web: { icon: Globe, color: "hsl(270, 60%, 55%)", label: "Web" },
};

export function PlatformIcon({
  platform,
  size = 12,
}: {
  platform: Platform;
  size?: number;
}) {
  const config = platformConfig[platform];
  const Icon = config.icon;

  return (
    <Icon
      className="shrink-0"
      style={{ color: config.color, width: size, height: size }}
      aria-label={config.label}
    />
  );
}
