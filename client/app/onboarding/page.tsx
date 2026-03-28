"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  UploadCloud,
  Globe,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Headset,
  TrendingUp,
  Users,
  X,
  Code2,
  Copy,
  Terminal,
  FileText
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

// --- Custom Brand Icons ---
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "w-full h-full"} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "w-full h-full"} fill="currentColor">
    <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#0088cc"/>
    <path d="M4.697 11.666l14.241-5.496c.661-.247 1.25.158 1.05.952l-2.43 11.458c-.167.753-.615.932-1.242.576l-3.435-2.53-1.657 1.595c-.183.183-.337.337-.692.337l.245-3.498 6.368-5.753c.277-.247-.061-.383-.43-.136l-7.872 4.956-3.391-1.06c-.737-.23-.751-.737.154-1.093z" fill="#ffffff"/>
  </svg>
);

const EmailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className || "w-full h-full"} fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const WidgetIcon = ({ className }: { className?: string }) => (
   <svg viewBox="0 0 24 24" className={className || "w-full h-full"} fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
  </svg>
);

type Step = 1 | 2 | 3 | 4;
type ChannelStatus = 'idle' | 'success' | 'error';

const ONBOARDING_STEPS = [
  { id: 1, title: "Workspace", description: "Set up your brand presence" },
  { id: 2, title: "Knowledge Base", description: "Train your AI on your data" },
  { id: 3, title: "Channels", description: "Connect your platforms" },
  { id: 4, title: "Activation", description: "Review and go live" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form States
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [primaryGoal, setPrimaryGoal] = React.useState("");
  const [websiteUrl, setWebsiteUrl] = React.useState("");

  // Channel Connections State
  const [channelStatus, setChannelStatus] = React.useState<Record<string, ChannelStatus>>({
    whatsapp: 'idle',
    telegram: 'idle',
    email: 'idle',
    widget: 'idle'
  });
  
  // Modal State
  const [activeModal, setActiveModal] = React.useState<string | null>(null);
  const [modalMode, setModalMode] = React.useState<'init' | 'loading' | 'qr' | 'done'>('init');

  // Specific Modal Inputs
  const [tgToken, setTgToken] = React.useState("");
  const [widgetTheme, setWidgetTheme] = React.useState("light");
  const [widgetWelcome, setWidgetWelcome] = React.useState("Hi! How can I help you today?");
  const [emailValue, setEmailValue] = React.useState("");

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
    } else {
      setIsSubmitting(true);
      setTimeout(() => router.push("/"), 1500);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const openChannelModal = (channelId: string) => {
    if (channelStatus[channelId] === 'success') return; // already connected
    setActiveModal(channelId);
    setModalMode('init');
  };

  const connectChannel = (channelId: string, shouldFail: boolean = false) => {
    setModalMode('loading');
    
    // Simulate API connection delay
    setTimeout(() => {
      if (shouldFail) {
        setChannelStatus(prev => ({ ...prev, [channelId]: 'error' }));
        setActiveModal(null);
      } else {
        setChannelStatus(prev => ({ ...prev, [channelId]: 'success' }));
        setModalMode('done');
        // Auto close after success
        setTimeout(() => setActiveModal(null), 1500);
      }
    }, 2000);
  };

  // WhatsApp QR Flow
  const startWhatsappFlow = () => {
    setModalMode('loading');
    setTimeout(() => setModalMode('qr'), 1200); // Simulate fetching QR
  };

  const completeWhatsappFlow = (success: boolean) => {
    setModalMode('loading');
    setTimeout(() => {
      setChannelStatus(prev => ({ ...prev, whatsapp: success ? 'success' : 'error' }));
      if (success) {
        setModalMode('done');
        setTimeout(() => setActiveModal(null), 1500);
      } else {
        setActiveModal(null);
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      
      {/* --- MODAL OVERLAY --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-[fade-in_200ms_ease-out]">
          <div className="bg-card border border-border/50 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden animate-[scale-in_200ms_ease-out]">
            
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors z-10 bg-background/50 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 pb-10">
              
              {/* WhatsApp Modal */}
              {activeModal === 'whatsapp' && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto h-16 w-16 text-emerald-500 mb-2">
                    <WhatsAppIcon />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Connect WhatsApp</h2>
                  
                  {modalMode === 'init' && (
                    <div className="animate-[fade-in_300ms_ease-out]">
                      <p className="text-muted-foreground text-sm">Link ChatIQ to your WhatsApp Business number. We'll generate a secure QR code for you to scan via the WhatsApp app.</p>
                      <Button onClick={startWhatsappFlow} className="w-full h-12 text-base mt-6 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
                        Generate QR Code
                      </Button>
                    </div>
                  )}
                  
                  {modalMode === 'loading' && (
                    <div className="py-8 flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
                      <p className="text-sm text-muted-foreground">Connecting securely...</p>
                    </div>
                  )}

                  {modalMode === 'qr' && (
                    <div className="space-y-6 animate-[fade-in_300ms_ease-out] flex flex-col items-center">
                      <p className="text-sm font-medium">Scan this QR within WhatsApp via "Linked Devices"</p>
                      <div className="p-4 bg-white rounded-xl shadow-inner border border-zinc-200 w-56 h-56 flex items-center justify-center relative">
                        {/* Fake QR representation */}
                        <div className="absolute inset-4 grid grid-cols-6 grid-rows-6 gap-0.5 opacity-80">
                           {Array.from({length: 36}).map((_, i) => (
                              <div key={i} className={cn("bg-zinc-900 rounded-[1px]", Math.random() > 0.3 ? "opacity-100" : "opacity-0")} />
                           ))}
                        </div>
                        {/* Center logo piece */}
                        <div className="absolute inset-0 m-auto bg-white p-1 rounded-sm flex items-center justify-center z-10 w-12 h-12 shadow-sm border border-zinc-100">
                           <WhatsAppIcon className="text-emerald-500 w-8 h-8" />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 w-full pt-2">
                        <Button variant="outline" className="flex-1 opacity-50 hover:opacity-100 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => completeWhatsappFlow(false)}>
                          Simulate Fail
                        </Button>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={() => completeWhatsappFlow(true)}>
                          Simulate Scan
                        </Button>
                      </div>
                    </div>
                  )}

                  {modalMode === 'done' && (
                    <div className="py-6 flex flex-col items-center animate-[fade-in_300ms_ease-out]">
                      <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                        <Check className="h-8 w-8" />
                      </div>
                      <p className="font-bold text-lg">WhatsApp Connected</p>
                    </div>
                  )}
                </div>
              )}

              {/* Telegram Modal */}
              {activeModal === 'telegram' && (
                <div className="space-y-6">
                  <div className="mx-auto h-16 w-16 mb-2">
                    <TelegramIcon />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-center">Connect Telegram</h2>
                  
                  {modalMode === 'init' && (
                    <div className="space-y-5 animate-[fade-in_300ms_ease-out]">
                      <p className="text-muted-foreground text-sm text-center">Paste your Telegram Bot Token provided by <a href="#" className="text-blue-500 hover:underline">@BotFather</a>.</p>
                      <div className="space-y-2">
                        <Label>Bot Token</Label>
                        <Input 
                          placeholder="e.g. 123456:ABC-DEF1234..." 
                          className="h-12 font-mono text-sm"
                          value={tgToken}
                          onChange={(e) => setTgToken(e.target.value)}
                        />
                      </div>
                      <Button 
                         onClick={() => connectChannel('telegram', tgToken.length < 10)} 
                         className="w-full h-12 shadow-sm bg-[#0088cc] hover:bg-[#0077b3] text-white"
                      >
                        Authenticate Bot
                      </Button>
                    </div>
                  )}

                  {modalMode === 'loading' && (
                    <div className="py-8 flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#0088cc] mb-4" />
                      <p className="text-sm text-muted-foreground">Verifying token...</p>
                    </div>
                  )}

                  {modalMode === 'done' && (
                    <div className="py-6 flex flex-col items-center animate-[fade-in_300ms_ease-out]">
                      <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-[#0088cc]">
                        <Check className="h-8 w-8" />
                      </div>
                      <p className="font-bold text-lg text-center">Telegram Bot Connected</p>
                    </div>
                  )}
                </div>
              )}

              {/* Email Modal */}
              {activeModal === 'email' && (
                <div className="space-y-6">
                  <div className="mx-auto h-16 w-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center p-3 mb-2">
                    <EmailIcon />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-center">Connect Email Inbox</h2>
                  
                  {modalMode === 'init' && (
                    <div className="space-y-5 animate-[fade-in_300ms_ease-out]">
                      <p className="text-muted-foreground text-sm text-center">Enable ChatIQ to read and reply to support emails.</p>
                      
                      <div className="space-y-2">
                        <Label>Inbox Address</Label>
                        <Input 
                          type="email"
                          placeholder="support@yourcompany.com" 
                          className="h-12"
                          value={emailValue}
                          onChange={(e) => setEmailValue(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>App Password / SMTP Token</Label>
                        <Input type="password" placeholder="••••••••••••" className="h-12" />
                      </div>

                      <Button 
                         onClick={() => connectChannel('email', !emailValue.includes('@'))} 
                         className="w-full h-12 shadow-sm bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        Connect Inbox
                      </Button>
                    </div>
                  )}

                  {modalMode === 'loading' && (
                    <div className="py-8 flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-4" />
                      <p className="text-sm text-muted-foreground">Authorizing inbox...</p>
                    </div>
                  )}

                  {modalMode === 'done' && (
                    <div className="py-6 flex flex-col items-center animate-[fade-in_300ms_ease-out]">
                      <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-orange-600">
                        <Check className="h-8 w-8" />
                      </div>
                      <p className="font-bold text-lg text-center">Inbox Connected</p>
                    </div>
                  )}
                </div>
              )}

              {/* Web Widget Modal */}
              {activeModal === 'widget' && (
                <div className="space-y-6">
                  <div className="mx-auto h-16 w-16 bg-zinc-900 text-zinc-50 rounded-2xl flex items-center justify-center p-3 mb-2">
                    <WidgetIcon />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-center">Configure Web Widget</h2>
                  
                  {modalMode === 'init' && (
                    <div className="space-y-5 animate-[fade-in_300ms_ease-out]">
                      <div className="space-y-2">
                        <Label>Welcome Message</Label>
                        <Input 
                          value={widgetWelcome}
                          onChange={(e) => setWidgetWelcome(e.target.value)}
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2 pb-2">
                        <Label>Theme Color</Label>
                        <div className="flex gap-3">
                           {['light', 'dark', 'brand'].map(t => (
                             <div 
                                key={t} 
                                onClick={() => setWidgetTheme(t)}
                                className={cn(
                                  "flex-1 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-semibold capitalize cursor-pointer transition-colors",
                                  widgetTheme === t ? "border-primary bg-primary/10 text-primary" : "border-border/60 hover:bg-secondary text-muted-foreground"
                                )}
                             >
                               {t}
                             </div>
                           ))}
                        </div>
                      </div>

                      <Button 
                         onClick={() => {
                           setModalMode('loading');
                           setTimeout(() => setModalMode('done'), 2000);
                         }} 
                         className="w-full h-12 shadow-sm"
                      >
                        Generate Widget Script
                      </Button>
                    </div>
                  )}

                  {modalMode === 'loading' && (
                    <div className="py-8 flex flex-col items-center animate-[fade-in_300ms_ease-out]">
                      <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50 mb-4" />
                      <p className="text-sm text-muted-foreground">Compiling optimized script...</p>
                    </div>
                  )}

                  {modalMode === 'done' && (
                    <div className="py-2 animate-[fade-in_300ms_ease-out] flex flex-col items-center">
                      <div className="w-full bg-zinc-950 rounded-xl p-4 relative overflow-hidden group border border-zinc-800">
                         <div className="flex items-center gap-2 mb-3 text-zinc-400 text-xs font-mono">
                           <Terminal className="w-4 h-4" /> index.html
                         </div>
                         <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed truncate">
{`<!-- ChatIQ Widget -->
<script src="https://chatiq.com/widget.js" 
  data-theme="${widgetTheme}" 
  data-msg="${Buffer.from(widgetWelcome).toString('base64').substring(0,10)}..."
  defer>
</script>`}
                         </pre>
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(`<script src="https://chatiq.com/widget.js" data-theme="${widgetTheme}" defer></script>`);
                             setChannelStatus(prev => ({ ...prev, widget: 'success' }));
                             setActiveModal(null);
                           }} 
                           className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                         >
                           <Copy className="h-4 w-4" />
                         </button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-4 text-center">Paste this snippet before the closing `&lt;/body&gt;` tag. <br/>You can access this snippet anytime later.</p>
                      
                      <Button className="w-full mt-6 shadow-sm" onClick={() => {
                           setChannelStatus(prev => ({ ...prev, widget: 'success' }));
                           setActiveModal(null);
                      }}>
                         Done
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* --- LEFT SIDEBAR (Progress Indicator) --- */}
      <div className="hidden lg:flex w-[320px] shrink-0 flex-col bg-zinc-950 p-10 text-zinc-50 border-r border-border/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent opacity-20 pointer-events-none" />
        
        <div className="relative z-10 font-bold text-2xl tracking-tight mb-16 flex items-center gap-2">
          ChatIQ<span className="text-primary">.</span>
        </div>

        <nav aria-label="Progress" className="relative z-10 flex-1">
          <ol role="list" className="space-y-8">
            {ONBOARDING_STEPS.map((s, index) => {
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              
              return (
                <li key={s.id} className="relative">
                  {index !== ONBOARDING_STEPS.length - 1 && (
                    <div 
                      className={cn(
                        "absolute left-3.5 top-10 -ml-px h-full w-[2px]",
                        isCompleted ? "bg-primary" : "bg-zinc-800"
                      )} 
                      aria-hidden="true" 
                    />
                  )}
                  
                  <div className="relative flex items-start group">
                    <span className="flex h-9 items-center">
                      <span 
                        className={cn(
                          "relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300",
                          isCompleted ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" 
                          : isCurrent ? "border-2 border-primary bg-zinc-950" 
                          : "border-2 border-zinc-800 bg-zinc-950"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className={cn(
                            "text-xs font-medium",
                            isCurrent ? "text-primary" : "text-zinc-600"
                          )}>
                            {s.id}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="ml-4 flex min-w-0 flex-col">
                      <span className={cn(
                        "text-sm font-semibold tracking-wide transition-colors",
                        isCurrent || isCompleted ? "text-zinc-50" : "text-zinc-500"
                      )}>
                        {s.title}
                      </span>
                      <span className={cn(
                        "text-xs transition-colors",
                        isCurrent ? "text-zinc-400" : "text-zinc-600"
                      )}>
                        {s.description}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="relative z-10 text-xs text-zinc-600 mt-auto">
          Need help? <a href="#" className="underline hover:text-zinc-300 transition-colors">Contact Support</a>
        </div>
      </div>

      {/* --- RIGHT AREA (Main Content) --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="font-bold text-lg tracking-tight">ChatIQ.</div>
          <div className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Step {step} of 4
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8 md:p-12 lg:p-20 flex flex-col selection:bg-primary/20">
          <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
            
            {/* STEP 1: Workspace */}
            {step === 1 && (
              <div className="animate-[fade-in_400ms_ease-out] flex flex-col h-full">
                <div className="mb-10 space-y-3">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Tell us about your workspace</h1>
                  <p className="text-muted-foreground text-lg">Let's personalize ChatIQ to fit your team's workflow perfectly.</p>
                </div>

                <div className="space-y-8 flex-1">
                  <div className="space-y-3">
                    <Label htmlFor="workspace-name" className="text-sm font-medium">Workspace Name</Label>
                    <Input 
                      id="workspace-name"
                      placeholder="e.g. Acme Corp" 
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="h-14 text-lg bg-background border-border/60 hover:border-primary/50 focus-visible:ring-primary/20 transition-all rounded-xl" 
                      autoFocus
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">What is your primary goal?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'support', icon: Headset, title: 'Customer Support', desc: 'Resolve tickets instantly' },
                        { id: 'sales', icon: TrendingUp, title: 'Lead Generation', desc: 'Capture & qualify leads' },
                        { id: 'internal', icon: Users, title: 'Internal Ops', desc: 'Help your team find docs' }
                      ].map((goal) => (
                        <div 
                          key={goal.id}
                          onClick={() => setPrimaryGoal(goal.id)}
                          className={cn(
                            "cursor-pointer rounded-xl border p-5 flex flex-col gap-3 transition-all",
                            primaryGoal === goal.id 
                              ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                              : "border-border/60 hover:border-primary/40 hover:bg-secondary/20"
                          )}
                        >
                          <goal.icon className={cn("h-6 w-6", primaryGoal === goal.id ? "text-primary" : "text-muted-foreground")} />
                          <div>
                            <p className="font-semibold text-sm">{goal.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{goal.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Knowledge Base */}
            {step === 2 && (
              <div className="animate-[fade-in_400ms_ease-out] flex flex-col h-full">
                <div className="mb-10 space-y-3">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">What should your AI know?</h1>
                  <p className="text-muted-foreground text-lg">Provide links or upload documents so ChatIQ can instantly answer questions based strictly on your data.</p>
                </div>

                <div className="space-y-10 flex-1">
                  
                  {/* Website Crawl */}
                  <div className="rounded-2xl border border-border/60 p-6 bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-foreground font-semibold">
                      <div className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
                        <Globe className="h-4 w-4" />
                      </div>
                      Sync Website Content
                    </div>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="https://yourwebsite.com" 
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="h-12 bg-background border-border/60 rounded-xl"
                      />
                      <Button variant="secondary" className="h-12 px-6 rounded-xl font-medium shrink-0">
                        Scan URLs
                      </Button>
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="border-2 border-dashed border-border/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-secondary/20 hover:border-primary/50 transition-all cursor-pointer group bg-card">
                    <div className="h-14 w-14 bg-background border border-border/50 shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform duration-300">
                      <UploadCloud className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-1">Drag and drop documents here</h3>
                    <p className="text-xs text-muted-foreground">Supports PDF, DOCX, TXT, CSV (Max 25MB each)</p>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 3: Channels (Redesigned) */}
            {step === 3 && (
              <div className="animate-[fade-in_400ms_ease-out] flex flex-col h-full">
                <div className="mb-10 space-y-3">
                  <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Connect your channels</h1>
                  <p className="text-muted-foreground text-lg">Select the channels you'd like to integrate right now. Click on a channel to securely authenticate it.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {[
                    { id: 'whatsapp', name: 'WhatsApp Business', icon: WhatsAppIcon, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' },
                    { id: 'telegram', name: 'Telegram Bot', icon: TelegramIcon, color: 'text-[#0088cc] bg-blue-50 dark:bg-blue-500/10' },
                    { id: 'email', name: 'Email Inbox', icon: EmailIcon, color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
                    { id: 'widget', name: 'Web Widget', icon: WidgetIcon, color: 'text-zinc-900 bg-zinc-100 dark:text-zinc-50 dark:bg-zinc-800' }
                  ].map(channel => {
                    const status = channelStatus[channel.id];
                    
                    return (
                      <div 
                        key={channel.id}
                        onClick={() => openChannelModal(channel.id)}
                        className={cn(
                          "relative cursor-pointer rounded-2xl border p-5 flex items-center gap-4 transition-all duration-200 overflow-hidden",
                          status === 'success' 
                            ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm" 
                            : status === 'error'
                            ? "border-destructive/60 bg-destructive/5 hover:border-destructive shadow-sm"
                            : "border-border/60 hover:border-primary/40 bg-card hover:shadow-sm"
                        )}
                      >
                        {status === 'success' && <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />}
                        {status === 'error' && <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />}

                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 p-2.5 shadow-sm", channel.color)}>
                          <channel.icon />
                        </div>
                        
                        <div className="font-semibold text-base flex-1">
                          {channel.name}
                          {status === 'error' && <span className="block text-xs text-destructive font-medium leading-tight mt-0.5">Connection failed. Tap to retry.</span>}
                          {status === 'success' && <span className="block text-xs text-emerald-600 dark:text-emerald-500 font-medium leading-tight mt-0.5">Connected</span>}
                          {status === 'idle' && <span className="block text-xs text-muted-foreground font-medium leading-tight mt-0.5">Not connected</span>}
                        </div>

                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center transition-all",
                          status === 'success' ? "bg-emerald-500 text-white" 
                          : status === 'error' ? "bg-destructive text-destructive-foreground"
                          : "border-2 border-border/80 text-transparent"
                        )}>
                          {status === 'success' && <Check className="h-3.5 w-3.5" />}
                          {status === 'error' && <X className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Activation */}
            {step === 4 && (
              <div className="animate-[fade-in_400ms_ease-out] flex flex-col h-full items-center justify-center text-center relative z-10 pb-12">
                
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150" />
                  <div className="h-28 w-28 bg-background border-2 border-primary/20 rounded-full flex items-center justify-center relative z-10 shadow-xl">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <Check className="h-8 w-8 text-primary" strokeWidth={3} />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">You're all set!</h1>
                <p className="text-muted-foreground text-lg max-w-sm mb-10 leading-relaxed">
                  ChatIQ has successfully provisioned your workspace.
                </p>

                <div className="w-full max-w-sm p-5 bg-card border border-border/50 rounded-2xl text-left shadow-sm">
                  <h3 className="text-sm font-semibold mb-3">Workspace Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{workspaceName || "Acme Corp"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Goal</span>
                      <span className="font-medium capitalize">{primaryGoal || "Support"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Channels</span>
                      <span className="font-medium">{Object.values(channelStatus).filter(s => s === 'success').length} connected</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
            
          </div>
        </main>

        {/* BOTTOM ACTION BAR */}
        <footer className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-md pb-safe">
          <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              {step > 1 && step < 4 && (
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  className="h-12 px-6 rounded-xl hover:bg-secondary/60 text-muted-foreground hover:text-foreground font-medium transition-all"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
            </div>
            
            <div className="flex md:hidden"></div>

            <div>
              <Button 
                onClick={handleNext} 
                disabled={isSubmitting}
                className="h-12 px-8 rounded-xl font-semibold shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] bg-primary text-primary-foreground"
              >
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : step === 4 ? (
                  <>Enter Dashboard <ArrowRight className="ml-2 h-4 w-4" /></>
                ) : step === 3 ? (
                 <>Launch Workspace</> 
                ) : (
                  <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
