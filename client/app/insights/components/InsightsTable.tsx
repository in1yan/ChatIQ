"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, AlertTriangle, Lightbulb, BarChart2, ShieldAlert, Zap, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

interface Insight {
  id: number;
  customer_id: number;
  per_message_sentiment: string | null;
  conversation_sentiment: string | null;
  trending_topics: string[] | null;
  sentiment_score: number | null;
  churn_risk: string | null;
  upsell_opportunity: string | null;
  service_gap: string | null;
  created_at: string;
}

interface InsightsTableProps {
  insights: Insight[];
  total: number;
  skip: number;
  limit: number;
  onPageChange: (newSkip: number) => void;
}

export function InsightsTable({ insights, total, skip, limit, onPageChange }: InsightsTableProps) {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl group overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-6">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-[0.1em]">
            Historical Intel Feed
          </CardTitle>
          <p className="text-[11px] text-zinc-500 font-medium">Reviewing {total} captured conversation signals</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-zinc-950/50 border border-white/5 px-3 py-1.5 transition-all focus-within:border-primary/50">
             <Search className="h-3.5 w-3.5 text-zinc-600" />
             <input type="text" placeholder="Filter feed..." className="bg-transparent text-xs text-white outline-none w-32 placeholder:text-zinc-700" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest tabular-nums">
              {currentPage} / {totalPages || 1}
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-zinc-900/50 border-white/10 hover:bg-zinc-800 hover:text-white"
                onClick={() => onPageChange(Math.max(0, skip - limit))}
                disabled={skip === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-zinc-900/50 border-white/10 hover:bg-zinc-800 hover:text-white"
                onClick={() => onPageChange(skip + limit)}
                disabled={insights.length < limit || skip + limit >= total}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-zinc-950/20 text-zinc-600 border-b border-white/5 uppercase font-bold tracking-[0.15em] text-[10px]">
                <th className="px-6 py-4 font-bold text-left">Timestamp</th>
                <th className="px-6 py-4 font-bold text-left">Entity</th>
                <th className="px-6 py-4 font-bold text-left">Sentiment</th>
                <th className="px-6 py-4 font-bold text-left">Key Context</th>
                <th className="px-6 py-4 font-bold text-right pr-10">Alerts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {insights.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-zinc-500 italic">
                    No insights found matching your criteria.
                  </td>
                </tr>
              ) : (
                insights.map((insight) => (
                  <tr key={insight.id} className="hover:bg-white/[0.02] transition-colors group/row">
                    <td className="px-6 py-5 whitespace-nowrap tabular-nums text-zinc-500 font-medium">
                      {format(new Date(insight.created_at), "MMM dd, HH:mm")}
                    </td>
                    <td className="px-6 py-5 font-bold text-zinc-300">USER-{insight.customer_id}</td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                        (insight.conversation_sentiment || "").toLowerCase().includes("positive") ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                        (insight.conversation_sentiment || "").toLowerCase().includes("negative") ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                        "bg-zinc-800/50 border-white/10 text-zinc-400"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          (insight.conversation_sentiment || "").toLowerCase().includes("positive") ? "bg-emerald-500" :
                          (insight.conversation_sentiment || "").toLowerCase().includes("negative") ? "bg-rose-500" :
                          "bg-zinc-600"
                        }`} />
                        {insight.conversation_sentiment || "Neutral"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2 max-w-sm">
                        {(insight.trending_topics || []).slice(0, 3).map((topic, i) => (
                          <span key={i} className="text-[10px] text-zinc-500 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-lg group-hover/row:border-primary/20 transition-colors">
                            {topic}
                          </span>
                        ))}
                        {(insight.trending_topics?.length || 0) > 3 && (
                          <span className="text-[10px] text-zinc-600 font-bold px-1 py-0.5 italic">+{insight.trending_topics!.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-3 pr-4 transition-all duration-300">
                        {insight.churn_risk && (insight.churn_risk.toLowerCase().includes("high")) && (
                          <span className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 group-hover/row:scale-110 duration-200 transition-transform cursor-help" title="High Churn Risk">
                            <ShieldAlert className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {insight.upsell_opportunity && (
                          <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-hover/row:scale-110 duration-200 transition-transform cursor-help" title="Upsell Potential">
                            <Zap className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {insight.service_gap && (
                          <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover/row:scale-110 duration-200 transition-transform cursor-help" title="Service Gap">
                            <Lightbulb className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
