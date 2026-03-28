"use client";

import { AlertCircle, ChevronRight, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface ServiceGapsAlertsProps {
  gaps: string[];
}

export function ServiceGapsAlerts({ gaps }: ServiceGapsAlertsProps) {
  return (
    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl h-[420px] flex flex-col group overflow-hidden transition-all duration-300 hover:border-warning/30 hover:shadow-2xl hover:shadow-warning/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
            <Bell className="h-3 w-3 text-warning animate-[pulse-subtle_2s_ease-in-out_infinite]" />
            Detected Intelligence Gaps
          </CardTitle>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-warning/10 border border-warning/20 text-[9px] font-bold text-warning uppercase tracking-widest leading-none animate-[pulse-subtle_3s_ease-in-out_infinite]">
             Critical
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-6 space-y-4 pr-3 scrollbar-hide">
        {gaps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
            <div className="p-4 rounded-full bg-zinc-900/50 border border-white/5 mb-3 group-hover:scale-110 duration-500 transition-transform">
               <AlertCircle className="h-6 w-6 text-success/40" />
            </div>
            <p className="text-xs font-medium text-zinc-500 italic">Conversations are fully captured.</p>
          </div>
        ) : (
          gaps.map((gap, i) => (
            <div 
              key={i} 
              className="relative group/item flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 hover:border-warning/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="shrink-0 p-1.5 rounded-lg bg-warning/10 border border-warning/20 text-warning group-hover/item:scale-110 group-hover/item:bg-warning/15 transition-all duration-200">
                 <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                 <p className="text-xs font-semibold text-zinc-300 tracking-tight leading-tight group-hover/item:text-warning transition-colors duration-200">Information Deficit</p>
                 <p className="text-[11px] text-zinc-500 font-medium leading-relaxed line-clamp-2 group-hover/item:text-zinc-400 transition-colors duration-200">{gap}</p>
                 <div className="flex items-center gap-2 pt-1">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Just now</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Needs Resolution</span>
                 </div>
              </div>
              <button className="shrink-0 p-1 rounded-lg hover:bg-warning/20 text-zinc-600 hover:text-warning transition-all duration-200 group-hover/item:scale-110">
                 <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
