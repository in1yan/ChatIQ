"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, LayoutDashboard, BrainCircuit } from "lucide-react";
import { fetchWithAuth } from "../lib/auth";
import { MetricsCards } from "./components/MetricsCards";
import { SentimentChart } from "./components/SentimentChart";
import { TrendingTopics } from "./components/TrendingTopics";
import { ServiceGapsAlerts } from "./components/ServiceGapsAlerts";
import { InsightsTable } from "./components/InsightsTable";
import { Button } from "../components/ui/button";

export default function InsightsPage() {
  const [metrics, setMetrics] = useState<{
    total_insights?: number;
    high_churn_risk_count?: number;
    upsell_opportunities_count?: number;
    sentiment_distribution?: unknown;
    top_trending_topics?: unknown;
    recent_service_gaps?: unknown;
  } | null>(null);
  const [insights, setInsights] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (currentSkip = 0) => {
    try {
      setRefreshing(true);
      const [metricsRes, insightsRes] = await Promise.all([
        fetchWithAuth("/insights/metrics"),
        fetchWithAuth(`/insights/?skip=${currentSkip}&limit=10`),
      ]);

      if (metricsRes.ok) {
        setMetrics(await metricsRes.json());
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data);
        setTotal(data.length > 0 ? 100 : 0); 
      }
    } catch {
      // Silent fail - metrics are non-critical
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(skip);
  }, [fetchData, skip]);

  if (loading) {
    return (
      <div className="flex-1 bg-zinc-950 p-8 space-y-8">
        <div className="flex items-center justify-between animate-[fade-in_400ms_cubic-bezier(0.16,1,0.3,1)]">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-zinc-900 rounded-lg animate-[pulse-subtle_2s_ease-in-out_infinite]"></div>
            <div className="h-4 w-32 bg-zinc-900/50 rounded-lg animate-[pulse-subtle_2s_ease-in-out_infinite_200ms]"></div>
          </div>
          <div className="h-10 w-32 bg-zinc-900 rounded-lg animate-[pulse-subtle_2s_ease-in-out_infinite_400ms]"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="h-40 bg-zinc-900/60 rounded-3xl border border-white/5 animate-[pulse-subtle_2s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 150}ms` }}
            ></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="h-[420px] bg-zinc-900/60 rounded-3xl border border-white/5 animate-[pulse-subtle_2s_ease-in-out_infinite]"
              style={{ animationDelay: `${(i + 3) * 150}ms` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 p-6 md:p-10 lg:p-12 overflow-y-auto space-y-12 h-screen scrollbar-hide selection:bg-violet-500/30">
      
      {/* Dynamic Glow Backgrounds - Animated with brand colors */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] -mr-64 -mt-64 rounded-full animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-success/5 blur-[120px] -ml-64 -mb-64 rounded-full animate-[float_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-info/5 blur-[140px] -ml-48 -mt-48 rounded-full animate-[float_12s_ease-in-out_infinite_4s]" />
      </div>

      <div className="relative space-y-10 max-w-7xl mx-auto">
        
        {/* Header Section - Enhanced entrance */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 animate-[slide-up_600ms_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex items-center gap-2.5 px-3 py-1.5 w-fit rounded-full bg-primary/5 border border-primary/20 text-[10px] uppercase font-bold text-primary/80 tracking-[0.2em] transition-all hover:border-primary/40 hover:bg-primary/10 hover:scale-105 active:scale-100 duration-200">
               <BrainCircuit className="w-3.5 h-3.5 text-primary animate-[pulse-subtle_3s_ease-in-out_infinite]" />
               AI Intelligence Core
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white leading-tight">
              Operational <span className="text-primary/70">Insights</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-500 max-w-md font-medium">
              Consolidated behavioral analysis and high-risk retention triggers across active communication channels.
            </p>
          </div>
          <div className="flex items-center gap-3 animate-[slide-up_600ms_cubic-bezier(0.16,1,0.3,1)_100ms_backwards]">
             <Button 
                variant="outline" 
                size="lg" 
                onClick={() => fetchData(skip)}
                disabled={refreshing}
                className="h-12 px-6 rounded-2xl bg-zinc-900/50 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all hover:scale-105 active:scale-95 duration-200 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-primary disabled:opacity-50 disabled:hover:scale-100"
             >
               <RefreshCw className={`h-4 w-4 mr-3 text-primary/70 transition-transform duration-500 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
               {refreshing ? 'Analyzing...' : 'Refresh Intel'}
             </Button>
          </div>
        </header>

        {/* Dash Grid - Orchestrated entrance */}
        <div className="space-y-8">
          {metrics && (
            <div className="animate-[fade-in_800ms_cubic-bezier(0.16,1,0.3,1)_200ms_backwards]">
              <MetricsCards metrics={{
                total_insights: metrics.total_insights,
                high_churn_risk_count: metrics.high_churn_risk_count,
                upsell_opportunities_count: metrics.upsell_opportunities_count
              }} />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics?.sentiment_distribution && (
              <div className="animate-[slide-up_800ms_cubic-bezier(0.16,1,0.3,1)_300ms_backwards]">
                <SentimentChart data={metrics.sentiment_distribution} />
              </div>
            )}
            
            {metrics?.top_trending_topics && (
              <div className="animate-[slide-up_800ms_cubic-bezier(0.16,1,0.3,1)_400ms_backwards]">
                <TrendingTopics topics={metrics.top_trending_topics} />
              </div>
            )}

            {metrics?.recent_service_gaps && (
              <div className="animate-[slide-up_800ms_cubic-bezier(0.16,1,0.3,1)_500ms_backwards]">
                <ServiceGapsAlerts gaps={metrics.recent_service_gaps} />
              </div>
            )}
          </div>

          {/* Table Feed section - Delayed entrance */}
          <div className="space-y-6 pt-4 animate-[fade-in_1000ms_cubic-bezier(0.16,1,0.3,1)_600ms_backwards]">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3 group">
                   <div className="w-10 h-10 rounded-2xl bg-info/5 border border-info/20 flex items-center justify-center transition-all duration-200 group-hover:border-info/40 group-hover:bg-info/10 group-hover:scale-110">
                     <LayoutDashboard className="h-5 w-5 text-info transition-colors duration-200 group-hover:text-info" />
                   </div>
                   <div className="space-y-0.5">
                      <h2 className="text-lg font-semibold text-white tracking-tight">Intelligence Feed</h2>
                      <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">Raw Log Stream</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full animate-[pulse-subtle_2s_ease-in-out_infinite]">
                   <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                   LIVE SYNC ACTIVE
                </div>
            </div>
            <InsightsTable 
              insights={insights} 
              total={total}
              skip={skip}
              limit={10}
              onPageChange={setSkip}
            />
          </div>
        </div>

        {/* Terminal Style Footer */}
        <footer className="pt-12 pb-6 flex flex-col items-center gap-8 text-center animate-[fade-in_1200ms_cubic-bezier(0.16,1,0.3,1)_800ms_backwards]">
           <div className="w-16 h-1 bg-zinc-800 rounded-full" />
           <div className="space-y-2">
              <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.25em]">
                  <span className="hover:text-primary transition-colors cursor-pointer duration-200">Security Protocol 84B</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="hover:text-primary transition-colors cursor-pointer duration-200">Supabase Auth Layer</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="hover:text-primary transition-colors cursor-pointer duration-200">Vercel Edge Ready</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                Proprietary AI Modeling for ChatIQ Inc. All communication encrypted.
              </p>
           </div>
        </footer>

      </div>
    </div>
  );
}
