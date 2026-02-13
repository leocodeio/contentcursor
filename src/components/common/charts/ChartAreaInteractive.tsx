"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartData {
  name: string;
  views: number;
  engagement: number;
}

interface ChartAreaInteractiveProps {
  data?: ChartData[];
}

const defaultData: ChartData[] = [
  { name: "Jan", views: 4000, engagement: 2400 },
  { name: "Feb", views: 3000, engagement: 1398 },
  { name: "Mar", views: 2000, engagement: 9800 },
  { name: "Apr", views: 2780, engagement: 3908 },
  { name: "May", views: 1890, engagement: 4800 },
  { name: "Jun", views: 2390, engagement: 3800 },
  { name: "Jul", views: 3490, engagement: 4300 },
];

export function ChartAreaInteractive({ data = defaultData }: ChartAreaInteractiveProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelStyle={{
              color: "var(--card-foreground)",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="var(--primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorViews)"
          />
          <Area
            type="monotone"
            dataKey="engagement"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorEngagement)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
