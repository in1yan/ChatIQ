"use client";
import { useTheme } from "next-themes";
import { ArrowLeft, Moon, Sun, Type } from "lucide-react";
import { Switch } from "../components/ui/switch";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const isDark = theme === "dark";
  
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');

  useEffect(() => {
    const savedSize = localStorage.getItem('text-size') as typeof textSize;
    if (savedSize) {
      setTextSize(savedSize);
      document.documentElement.setAttribute('data-text-size', savedSize);
    }
  }, []);

  const handleTextSizeChange = (size: typeof textSize) => {
    setTextSize(size);
    localStorage.setItem('text-size', size);
    document.documentElement.setAttribute('data-text-size', size);
  };

  const textSizes = [
    { value: 'small', label: 'Small', preview: 'Aa' },
    { value: 'medium', label: 'Medium', preview: 'Aa' },
    { value: 'large', label: 'Large', preview: 'Aa' },
    { value: 'extra-large', label: 'Extra Large', preview: 'Aa' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Text size scales for chat messages */
        [data-text-size="small"] .message-bubble {
          font-size: 14px !important;
        }
        
        [data-text-size="medium"] .message-bubble {
          font-size: 16px !important;
        }
        
        [data-text-size="large"] .message-bubble {
          font-size: 18px !important;
        }
        
        [data-text-size="extra-large"] .message-bubble {
          font-size: 20px !important;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      
      <div className="max-w-2xl mx-auto px-6 py-8 animate-[fade-in_400ms_cubic-bezier(0.16,1,0.3,1)]">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-all duration-200 leading-normal hover:translate-x-[-2px] active:scale-[0.98] group"
          aria-label="Back to inbox"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-[-2px]" />
          Back to Inbox
        </button>

        <h1 className="text-2xl font-semibold text-foreground mb-8 leading-tight animate-[slide-up_400ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
          Settings
        </h1>

        <div className="space-y-6">
          {/* Theme Setting */}
          <section 
            className="border border-border rounded-lg p-5 animate-[slide-up_400ms_cubic-bezier(0.16,1,0.3,1)_150ms_backwards] transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5"
            aria-labelledby="theme-heading"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                )}
                <div>
                  <h2 id="theme-heading" className="text-sm font-medium text-foreground leading-tight">
                    Dark theme
                  </h2>
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
                aria-label="Toggle dark theme"
              />
            </div>
          </section>

          {/* Text Size Setting */}
          <section 
            className="border border-border rounded-lg p-5 animate-[slide-up_400ms_cubic-bezier(0.16,1,0.3,1)_250ms_backwards] transition-all duration-300 hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5"
            aria-labelledby="text-size-heading"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Type className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <div>
                  <h2 id="text-size-heading" className="text-sm font-medium text-foreground leading-tight">
                    Chat text size
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-normal">
                    Adjust the text size in chat messages
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                {textSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => handleTextSizeChange(size.value)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 active:scale-[0.98] ${
                      textSize === size.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30 hover:bg-muted/50'
                    }`}
                    aria-label={`Set text size to ${size.label}`}
                    aria-pressed={textSize === size.value}
                  >
                    <span 
                      className={`font-semibold text-foreground mb-2 ${
                        size.value === 'small' ? 'text-lg' :
                        size.value === 'medium' ? 'text-2xl' :
                        size.value === 'large' ? 'text-3xl' :
                        'text-4xl'
                      }`}
                    >
                      {size.preview}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {size.label}
                    </span>
                    {textSize === size.value && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-[fade-in_200ms_cubic-bezier(0.16,1,0.3,1)]" 
                           aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
