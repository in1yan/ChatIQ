"use client";
import { useTheme } from "next-themes";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useRouter } from "next/navigation";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";

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

        <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>

        <div className="space-y-6">
          <div className="border border-border rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Dark theme
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Switch between light and dark appearance
                  </p>
                </div>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={(checked: boolean) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
