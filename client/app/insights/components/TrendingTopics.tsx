"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface TrendingTopicsProps {
  topics: string[];
}

export function TrendingTopics({ topics }: TrendingTopicsProps) {
  const chartData = topics.slice(0, 5).map((topic, i) => ({
    name: topic,
    count: 5 - i, 
  }));

  return (
    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl h-[420px] flex flex-col group overflow-hidden">
      <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-[0.15em]">
             Topic Frequency
           </CardTitle>
           <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
         </div>
      </CardHeader>
      <CardContent className="flex-1 pt-6 px-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
              barSize={14}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.03)" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                fontSize={11}
                width={100}
                tick={{ fill: "rgba(161, 161, 170, 0.8)", fontWeight: 500 }}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.02)" }}
                contentStyle={{
                  backgroundColor: "rgba(9, 9, 11, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  fontSize: "11px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                }}
                labelStyle={{ display: "none" }}
              />
              <Bar dataKey="count" radius={[0, 10, 10, 0]} animationDuration={1800}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "hsl(var(--primary))" : `hsla(var(--primary), ${0.8 - index * 0.15})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 font-medium px-2">
           <span className="uppercase tracking-widest text-[9px] font-bold">Volume</span>
           <span className="text-zinc-400">Updates every 10 min</span>
        </div>
      </CardContent>
    </Card>
  );
}
