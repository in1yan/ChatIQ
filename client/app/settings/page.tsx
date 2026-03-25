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
    <div className="min-h-screen bg-background animate-[fade-in_300ms_cubic-bezier(0.16,1,0.3,1)]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-all duration-200 leading-normal hover:translate-x-[-4px] active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inbox
        </button>

        <h1 className="text-2xl font-semibold text-foreground mb-8 leading-tight animate-[slide-up_300ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">Settings</h1>

        <div className="space-y-6">
          <div className="border border-border rounded-lg p-5 animate-[slide-up_300ms_cubic-bezier(0.16,1,0.3,1)_200ms_backwards] transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground leading-tight">
                    Dark theme
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-normal">
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
