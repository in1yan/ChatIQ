"use client";

import { Users, TrendingDown, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

interface MetricsCardsProps {
  metrics: {
    total_insights: number;
    high_churn_risk_count: number;
    upsell_opportunities_count: number;
  };
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Insights Card */}
      <Card className="relative overflow-hidden group bg-zinc-900/40 border-white/5 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-violet-600/20 transition-colors" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Users className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
              <ArrowUpRight className="w-3 h-3" /> 12%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.1em]">Total Analysis</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-semibold text-white tracking-tight tabular-nums">
                {metrics.total_insights.toLocaleString()}
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Customer interactions scanned</p>
          </div>
        </CardContent>
      </Card>

      {/* Churn Risk Card */}
      <Card className="relative overflow-hidden group bg-zinc-900/40 border-white/5 backdrop-blur-xl transition-all duration-300 hover:border-rose-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-rose-600/20 transition-colors" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <TrendingDown className="h-5 w-5 text-rose-400" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400 uppercase tracking-wider">
              <ArrowDownRight className="w-3 h-3" /> 5%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.1em]">Retention Alerts</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-semibold text-rose-500 tracking-tight tabular-nums">
                {metrics.high_churn_risk_count.toLocaleString()}
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Users showing exit behavioral patterns</p>
          </div>
        </CardContent>
      </Card>

      {/* Upsell Opportunity Card */}
      <Card className="relative overflow-hidden group bg-zinc-900/40 border-white/5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-emerald-600/20 transition-colors" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <ArrowUpRight className="w-3 h-3" /> 18%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.1em]">Revenue Growth</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-semibold text-emerald-400 tracking-tight tabular-nums">
                {metrics.upsell_opportunities_count.toLocaleString()}
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Qualified expansion signals caught</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
