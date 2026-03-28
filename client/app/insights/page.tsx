"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart2, RefreshCw, MessageSquare, Info, LayoutDashboard, BrainCircuit } from "lucide-react";
import { fetchWithAuth } from "../lib/auth";
import { MetricsCards } from "./components/MetricsCards";
import { SentimentChart } from "./components/SentimentChart";
import { TrendingTopics } from "./components/TrendingTopics";
import { ServiceGapsAlerts } from "./components/ServiceGapsAlerts";
import { InsightsTable } from "./components/InsightsTable";
import { Button } from "../components/ui/button";

export default function InsightsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
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
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
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
      <div className="flex-1 bg-zinc-950 p-8 space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-zinc-900 rounded-lg"></div>
            <div className="h-4 w-32 bg-zinc-900/50 rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-zinc-900 rounded-lg"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-zinc-900/60 rounded-3xl border border-white/5"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[420px] bg-zinc-900/60 rounded-3xl border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-950 p-6 md:p-10 lg:p-12 overflow-y-auto space-y-12 h-screen scrollbar-hide selection:bg-violet-500/30">
      
      {/* Dynamic Glow Backgrounds */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 blur-[150px] -mr-64 -mt-64 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[120px] -ml-64 -mb-64 rounded-full" />
      </div>

      <div className="relative space-y-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-[fade-in_600ms_cubic-bezier(0.16,1,0.3,1)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-3 py-1.5 w-fit rounded-full bg-zinc-900 border border-white/5 text-[10px] uppercase font-bold text-zinc-500 tracking-[0.2em] transition-all hover:border-violet-500/30">
               <BrainCircuit className="w-3.5 h-3.5 text-violet-500" />
               AI Intelligence Core
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-white leading-tight">
              Operational <span className="text-zinc-500">Insights</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-500 max-w-md font-medium">
              Consolidated behavioral analysis and high-risk retention triggers across active communication channels.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                size="lg" 
                onClick={() => fetchData(skip)}
                disabled={refreshing}
                className="h-12 px-6 rounded-2xl bg-zinc-900/50 border-white/10 hover:bg-zinc-800 hover:border-violet-500/50 transition-all active:scale-95 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white"
             >
               <RefreshCw className={`h-4 w-4 mr-3 ${refreshing ? 'animate-spin' : ''}`} />
               {refreshing ? 'Analyzing...' : 'Refresh Intel'}
             </Button>
          </div>
        </header>

        {/* Dash Grid */}
        <div className="space-y-8 animate-[fade-in_800ms_cubic-bezier(0.16,1,0.3,1)_200ms_backwards]">
          {metrics && (
            <MetricsCards metrics={{
              total_insights: metrics.total_insights,
              high_churn_risk_count: metrics.high_churn_risk_count,
              upsell_opportunities_count: metrics.upsell_opportunities_count
            }} />
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {metrics?.sentiment_distribution && (
              <SentimentChart data={metrics.sentiment_distribution} />
            )}
            
            {metrics?.top_trending_topics && (
              <TrendingTopics topics={metrics.top_trending_topics} />
            )}

            {metrics?.recent_service_gaps && (
              <ServiceGapsAlerts gaps={metrics.recent_service_gaps} />
            )}
          </div>

          {/* Table Feed section */}
          <div className="space-y-6 pt-4 animate-[fade-in_1000ms_cubic-bezier(0.16,1,0.3,1)_400ms_backwards]">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-center">
                     <LayoutDashboard className="h-5 w-5 text-zinc-500" />
                   </div>
                   <div className="space-y-0.5">
                      <h2 className="text-lg font-semibold text-white tracking-tight">Intelligence Feed</h2>
                      <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">Raw Log Stream</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1.5 rounded-full">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
        <footer className="pt-12 pb-6 flex flex-col items-center gap-8 text-center animate-[fade-in_1200ms_cubic-bezier(0.16,1,0.3,1)_600ms_backwards]">
           <div className="w-16 h-1 bg-zinc-800 rounded-full" />
           <div className="space-y-2">
              <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.25em]">
                  <span className="hover:text-primary transition-colors cursor-pointer">Security Protocol 84B</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="hover:text-primary transition-colors cursor-pointer">Supabase Auth Layer</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="hover:text-primary transition-colors cursor-pointer">Vercel Edge Ready</span>
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
