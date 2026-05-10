"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full h-16 border-b border-border bg-background/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-3 transition-transform">
              C
            </div>
            <span className="text-xl font-bold tracking-tight">ChatIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Product</Link>
            <Link href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Log in</Link>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 text-sm font-medium transition-all active:scale-[0.98]">
            <Link href="/login">Get ChatIQ free</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-brand-navy">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 inset-x-0 h-full -z-10 flex items-center justify-center overflow-hidden">
          {/* Subtle dots/mesh wires inspired by Notion */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-primary/40 blur-xl" />
          <div className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-purple-400/30 blur-xl" />
        </div>

        <div className="container mx-auto px-6 text-center text-white relative z-10">
          <h1 className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight leading-[1.05] max-w-4xl mx-auto mb-8 animate-[slide-up_600ms_ease-out]">
            Your workspace for every conversation.
          </h1>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-10 font-normal leading-relaxed animate-[slide-up_700ms_ease-out]">
            Connect your WhatsApp, Telegram, and Email into one beautifully minimalist command center. Enhanced by AI, managed by you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-[slide-up_800ms_ease-out]">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 rounded-md shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
              <Link href="/login">Get started for free <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent text-white border-white/20 hover:bg-white/10 text-lg px-8 py-6 rounded-md transition-all">
              Request a demo
            </Button>
          </div>

          {/* Workspace Mockup Card */}
          <div className="max-w-6xl mx-auto rounded-xl border border-white/10 bg-white p-1 shadow-[0_24px_48px_-8px_rgba(0,0,0,0.3)] animate-[slide-up_900ms_ease-out] overflow-hidden">
             <img 
               src="/chatiq_workspace_mockup.png" 
               alt="ChatIQ Workspace Mockup" 
               className="w-full h-auto rounded-lg"
             />
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Focus on what matters.</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to handle high-volume messaging without the noise.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Unified Inbox */}
            <div className="p-8 rounded-xl border border-border bg-[hsl(30,100%,97%)] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Unified Inbox</h3>
              <p className="text-muted-foreground leading-relaxed">
                Reply to WhatsApp, Telegram, and Email from a single interface. No more context switching.
              </p>
            </div>

            {/* Feature 2: AI Assistance */}
            <div className="p-8 rounded-xl border border-border bg-[hsl(260,100%,98%)] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Copilot</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automate routine replies and get smart summaries of long conversations instantly.
              </p>
            </div>

            {/* Feature 3: Secure & Private */}
            <div className="p-8 rounded-xl border border-border bg-[hsl(150,100%,97%)] transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Enterprise Security</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your data is encrypted and private. We never use your conversations to train global models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-secondary/30 border-y border-border">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Ready to reclaim your time?</h2>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 py-6 text-xl rounded-md transition-all active:scale-[0.98]">
            <Link href="/login">Get ChatIQ free</Link>
          </Button>
          <p className="mt-6 text-muted-foreground">Free for individuals. Custom plans for teams.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white font-bold text-sm">C</div>
                <span className="text-lg font-bold">ChatIQ</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                The all-in-one conversation workspace. Built for modern teams and busy professionals.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">Integrations</Link></li>
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">AI Copilot</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Solutions</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">Support Teams</Link></li>
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">Sales Reps</Link></li>
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">Individuals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">About</Link></li>
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-sm hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ChatIQ Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Zap className="w-4 h-4" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><MessageSquare className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
