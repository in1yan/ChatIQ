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
  showBackground = false,
}: {
  platform: Platform;
  size?: number;
  showBackground?: boolean;
}) {
  const config = platformConfig[platform];
  const Icon = config.icon;

  if (showBackground) {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: config.color + "20",
          width: size * 1.8,
          height: size * 1.8,
        }}
      >
        <Icon
          className="shrink-0"
          style={{ color: config.color, width: size, height: size }}
          aria-label={config.label}
          strokeWidth={2.5}
        />
      </div>
    );
  }

  return (
    <Icon
      className="shrink-0"
      style={{ color: config.color, width: size, height: size }}
      aria-label={config.label}
      strokeWidth={2.5}
    />
  );
}
