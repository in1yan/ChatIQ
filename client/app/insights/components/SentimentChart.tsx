"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface SentimentChartProps {
  data: Record<string, number>;
}

export function SentimentChart({ data }: SentimentChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const COLORS = {
    positive: "hsl(var(--success))",
    neutral: "hsl(var(--warning))",
    negative: "hsl(var(--destructive))",
    default: "hsl(var(--info))",
  };

  const getCellColor = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("positive") || n.includes("good")) return COLORS.positive;
    if (n.includes("negative") || n.includes("bad")) return COLORS.negative;
    if (n.includes("neutral")) return COLORS.neutral;
    return COLORS.default;
  };

  return (
    <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl h-[420px] flex flex-col group overflow-hidden transition-all duration-300 hover:border-success/30 hover:shadow-2xl hover:shadow-success/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-[0.15em]">
            Sentimental Analysis
          </CardTitle>
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center pb-8 pt-4">
        <div className="h-[240px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={95}
                strokeWidth={0}
                paddingAngle={8}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getCellColor(entry.name)} 
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                cursor={{ stroke: 'none' }}
                contentStyle={{
                  backgroundColor: "rgba(9, 9, 11, 0.95)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  fontSize: "11px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                }}
                itemStyle={{ color: "#fff", padding: "2px 0" }}
                labelStyle={{ display: "none" }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered value indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-18px]">
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Health</p>
             <p className="text-3xl font-semibold text-success tracking-tighter leading-none">84%</p>
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 text-center px-6 leading-relaxed">
          Aggregated sentiment across all communication touchpoints.
        </p>
      </CardContent>
    </Card>
  );
}
