"use client";

import { useEffect, useRef, useState } from "react";
import { Users, TrendingDown, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

interface MetricsCardsProps {
  metrics: {
    total_insights: number;
    high_churn_risk_count: number;
    upsell_opportunities_count: number;
  };
}

// Animated counter hook
function useCountUp(end: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const startTime = Date.now() + delay;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out-quart for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(eased * end);
      
      if (current !== countRef.current) {
        countRef.current = current;
        setCount(current);
      }
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration, delay]);

  return count;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const totalCount = useCountUp(metrics.total_insights, 1500, 200);
  const churnCount = useCountUp(metrics.high_churn_risk_count, 1500, 350);
  const upsellCount = useCountUp(metrics.upsell_opportunities_count, 1500, 500);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Insights Card */}
      <Card className="relative overflow-hidden group bg-zinc-900/40 border-white/5 backdrop-blur-xl transition-all duration-300 hover:border-info/30 hover:shadow-2xl hover:shadow-info/10 hover:scale-[1.02] active:scale-[0.98]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-info/10 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-info/20 transition-all duration-500" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-info/10 border border-info/20 group-hover:scale-110 group-hover:bg-info/15 transition-all duration-300">
              <Users className="h-5 w-5 text-info" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-info/10 border border-info/20 text-[10px] font-bold text-info uppercase tracking-wider group-hover:scale-105 transition-transform duration-200">
              <ArrowUpRight className="w-3 h-3 animate-[float_3s_ease-in-out_infinite]" /> 12%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.1em]">Total Analysis</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-semibold text-white tracking-tight tabular-nums group-hover:text-info/90 transition-colors duration-300">
                {totalCount.toLocaleString()}
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Customer interactions scanned</p>
          </div>
        </CardContent>
      </Card>

      {/* Churn Risk Card */}
      <Card className="relative overflow-hidden group bg-zinc-900/40 border-white/5 backdrop-blur-xl transition-all duration-300 hover:border-destructive/30 hover:shadow-2xl hover:shadow-destructive/10 hover:scale-[1.02] active:scale-[0.98]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-destructive/20 transition-all duration-500" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 group-hover:scale-110 group-hover:bg-destructive/15 transition-all duration-300">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20 text-[10px] font-bold text-destructive uppercase tracking-wider group-hover:scale-105 transition-transform duration-200">
              <ArrowDownRight className="w-3 h-3 animate-[float_3s_ease-in-out_infinite_500ms]" /> 5%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.1em]">Retention Alerts</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-semibold text-destructive tracking-tight tabular-nums group-hover:text-destructive/80 transition-colors duration-300">
                {churnCount.toLocaleString()}
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Users showing exit behavioral patterns</p>
          </div>
        </CardContent>
      </Card>

      {/* Upsell Opportunity Card */}
      <Card className="relative overflow-hidden group bg-zinc-900/40 border-white/5 backdrop-blur-xl transition-all duration-300 hover:border-success/30 hover:shadow-2xl hover:shadow-success/10 hover:scale-[1.02] active:scale-[0.98]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-success/20 transition-all duration-500" />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-success/10 border border-success/20 group-hover:scale-110 group-hover:bg-success/15 transition-all duration-300">
              <Zap className="h-5 w-5 text-success" />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-[10px] font-bold text-success uppercase tracking-wider group-hover:scale-105 transition-transform duration-200">
              <ArrowUpRight className="w-3 h-3 animate-[float_3s_ease-in-out_infinite_1s]" /> 18%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.1em]">Revenue Growth</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-semibold text-success tracking-tight tabular-nums group-hover:text-success/80 transition-colors duration-300">
                {upsellCount.toLocaleString()}
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Qualified expansion signals caught</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
