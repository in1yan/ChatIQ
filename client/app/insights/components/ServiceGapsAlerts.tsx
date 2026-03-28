"use client";

import { AlertCircle, ChevronRight, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";

interface ServiceGapsAlertsProps {
  gaps: string[];
}

export function ServiceGapsAlerts({ gaps }: ServiceGapsAlertsProps) {
  return (
    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl h-[420px] flex flex-col group overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-[0.15em] flex items-center gap-2">
            <Bell className="h-3 w-3 text-rose-500" />
            Detected Intelligence Gaps
          </CardTitle>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-bold text-rose-500 uppercase tracking-widest leading-none">
             Critical
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-6 space-y-4 pr-3 scrollbar-hide">
        {gaps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
            <div className="p-4 rounded-full bg-zinc-900/50 border border-white/5 mb-3 group-hover:scale-110 duration-500 transition-transform">
               <AlertCircle className="h-6 w-6 text-emerald-500/40" />
            </div>
            <p className="text-xs font-medium text-zinc-500 italic">Conversations are fully captured.</p>
          </div>
        ) : (
          gaps.map((gap, i) => (
            <div key={i} className="relative group/item flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 hover:border-rose-500/20 transition-all duration-300">
              <div className="shrink-0 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
                 <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                 <p className="text-xs font-semibold text-zinc-300 tracking-tight leading-tight group-hover/item:text-rose-400 transition-colors">Information Deficit</p>
                 <p className="text-[11px] text-zinc-500 font-medium leading-relaxed line-clamp-2">{gap}</p>
                 <div className="flex items-center gap-2 pt-1">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Just now</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Needs Resolution</span>
                 </div>
              </div>
              <button className="shrink-0 p-1 rounded-lg hover:bg-rose-500/20 text-zinc-600 hover:text-rose-500 transition-all duration-200">
                 <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
