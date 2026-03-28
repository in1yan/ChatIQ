"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../../lib/utils";

// Custom Google SVG icon
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    className="h-[18px] w-[18px] shrink-0"
  >
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.445 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
    />
  </svg>
);

export function AuthCard({ mode = "login" }: { mode?: "login" | "signup" }) {
  const isLogin = mode === "login";
  const router = useRouter();

  // States
  const [industry, setIndustry] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [emailError, setEmailError] = React.useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    const DUMMY_EMAIL = "demo@chatiq.com";
    const DUMMY_PASSWORD = "password123";

    if (isLogin) {
      if (email === DUMMY_EMAIL && password === DUMMY_PASSWORD) {
        router.push("/");
      } else {
        setEmailError("Incorrect email or password");
      }
    } else {
      if (!email.includes("@") || password.length < 6) {
        setEmailError("Please enter a valid email & secure password");
      } else {
        router.push("/onboarding");
      }
    }
  };

  // Minimal input style for the premium look
  const inputStyle =
    "border-0 border-b border-border/50 bg-transparent rounded-none px-0 py-5 shadow-none focus-visible:ring-0 focus-visible:border-primary text-base transition-colors";

  return (
    <div className="flex-1 flex w-full relative min-h-screen">
      {/* LEFT PANELS: BRANDING (Hidden on smaller screens) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 p-12 flex-col justify-between text-zinc-50 relative overflow-hidden">
        {/* Abstract Glowing Accent */}
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
            ChatIQ.
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-8 animate-[fade-in_600ms_ease-out]">
          <h2 className="text-4xl lg:text-[44px] font-medium tracking-tight leading-[1.1] text-white">
            Command your daily conversations.
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
            Stop switching between tabs. Manage WhatsApp, email, and web chat from a beautifully quiet, uncluttered workspace.
          </p>
          
          <div className="pt-6 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-xs font-medium">A</div>
              <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-700 flex items-center justify-center text-xs font-medium">K</div>
              <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-600 flex items-center justify-center text-xs font-medium">+</div>
            </div>
            <p className="text-sm text-zinc-400 font-medium">Used by top professionals</p>
          </div>
        </div>

        <div className="relative z-10 text-sm font-medium text-zinc-600">
          <span>© {new Date().getFullYear()} ChatIQ Inc.</span>
        </div>
      </div>

      {/* RIGHT PANEL: FORM */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 xl:px-32 bg-background relative selection:bg-primary/20">
        
        {/* Mobile Top Header */}
        <div className="absolute top-8 left-6 sm:left-12 lg:hidden flex justify-between right-6 sm:right-12 items-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            ChatIQ.
          </Link>
          {/* Mobile Login/Signup Toggle */}
          <Link 
            href={isLogin ? "/signup" : "/login"} 
            className="text-xs font-medium hover:text-primary transition-colors hover:underline underline-offset-4"
          >
            {isLogin ? "Create account" : "Sign in"}
          </Link>
        </div>

        {/* Desktop Top Right Toggle */}
        <div className="absolute top-12 right-12 hidden lg:block">
           {isLogin ? (
             <span className="text-sm text-muted-foreground mr-2">New here?</span>
           ) : (
             <span className="text-sm text-muted-foreground mr-2">Have an account?</span>
           )}
           <Link 
             href={isLogin ? "/signup" : "/login"} 
             className="text-sm font-medium hover:text-primary transition-colors hover:underline underline-offset-4"
           >
             {isLogin ? "Create an account" : "Sign in"}
           </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[420px] mx-auto mt-12 lg:mt-0">
          
          <div className="space-y-3 mb-12 animate-[fade-in_300ms_ease-out]">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
              {isLogin ? "Welcome back" : "Get started"}
            </h1>
            <p className="text-base text-muted-foreground">
              {isLogin 
                ? "Enter your credentials to access your workspace." 
                : "Enter your details to create your command center."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {isLogin ? (
              <div className="space-y-6 animate-[fade-in_400ms_ease-out]">
                <div className="space-y-1 relative group">
                  <div className="flex justify-between items-end">
                    <Label htmlFor="email-login" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Work Email
                    </Label>
                    <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">hint: demo@chatiq.com</span>
                  </div>
                  <Input
                    id="email-login"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className={cn(inputStyle, emailError && "border-destructive/60 focus-visible:border-destructive")}
                  />
                  {emailError && <p className="text-xs text-destructive mt-2 absolute -bottom-5 left-0">{emailError}</p>}
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex justify-between items-end">
                    <Label htmlFor="password-login" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Password
                    </Label>
                    <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">hint: password123</span>
                  </div>
                  <Input
                    id="password-login"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputStyle}
                  />
                </div>

                <div className="flex justify-start pt-2">
                  <Link href="#" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-[fade-in_400ms_ease-out]">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label htmlFor="your-name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your name</Label>
                    <Input id="your-name" placeholder="Priya M." className={inputStyle} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="business-name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Business name</Label>
                    <Input id="business-name" placeholder="Spice Garden" className={inputStyle} />
                  </div>
                </div>

                <div className="space-y-1 relative group">
                  <Label htmlFor="work-email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Work Email</Label>
                  <Input
                    id="work-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className={cn(inputStyle, emailError && "border-destructive/60 focus-visible:border-destructive")}
                  />
                  {emailError && <p className="text-xs text-destructive mt-2 absolute -bottom-5 left-0">{emailError}</p>}
                </div>

                <div className="space-y-1 pt-2">
                  <Label htmlFor="industry" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="border-0 border-b border-border/50 bg-transparent rounded-none px-0 py-5 shadow-none focus:ring-0 focus:border-primary text-base">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant / Food & Beverage</SelectItem>
                      <SelectItem value="retail">Retail e-Commerce</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional Industry Input with smooth animation */}
                <div className={cn(
                  "space-y-1 transition-all duration-300 ease-out overflow-hidden border-l-[3px] border-primary/40 pl-4",
                  industry === "other" ? "h-[70px] opacity-100 mt-6" : "h-0 opacity-0 mt-0 pointer-events-none"
                )}>
                  <Label htmlFor="custom-industry" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Please specify</Label>
                  <Input
                    id="custom-industry"
                    placeholder="e.g. Healthcare, Real Estate..."
                    className={inputStyle}
                  />
                </div>

                <div className="space-y-1 pt-2">
                  <Label htmlFor="password-signup" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className={inputStyle}
                  />
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" className="w-full h-12 text-base font-medium rounded-lg shadow-md transition-all active:scale-[0.98]">
                {isLogin ? "Log In" : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Social Auth */}
          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground tracking-widest bg-opacity-100">
                  Or
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.href = "http://localhost:8000/api/v1/auth/oauth/google"}
              className="w-full mt-8 h-12 text-sm font-medium rounded-lg bg-transparent border-border/60 hover:bg-secondary/40 transition-all active:scale-[0.98]"
            >
              <GoogleIcon />
              <span className="ml-3">Continue with Google</span>
            </Button>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            By continuing, you agree to ChatIQ's{" "}
            <Link href="#" className="underline hover:text-foreground transition-colors">Terms of Service</Link> &{" "}
            <Link href="#" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>.
          </p>

        </div>
      </div>
    </div>
  );
}
