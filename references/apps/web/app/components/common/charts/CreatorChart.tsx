"use client";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const generateDummyData = (): Record<
  string,
  { date: string; desktop: number; mobile: number }[]
> => {
  const now = new Date();
  const formats = {
    daily: 30,
    weekly: 52,
    monthly: 12,
    yearly: 5,
  };

  const result: Record<
    string,
    { date: string; desktop: number; mobile: number }[]
  > = {
    daily: [],
    weekly: [],
    monthly: [],
    yearly: [],
  };

  // Generate daily data
  for (let i = 0; i < formats.daily; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    result.daily.push({
      date: date.toISOString().split("T")[0],
      desktop: Math.floor(Math.random() * 500),
      mobile: Math.floor(Math.random() * 500),
    });
  }

  // Weekly data
  for (let i = 0; i < formats.weekly; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    result.weekly.push({
      date: date.toISOString().split("T")[0],
      desktop: Math.floor(Math.random() * 2000),
      mobile: Math.floor(Math.random() * 2000),
    });
  }

  // Monthly data
  for (let i = 0; i < formats.monthly; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    result.monthly.push({
      date: date.toISOString().split("T")[0],
      desktop: Math.floor(Math.random() * 6000),
      mobile: Math.floor(Math.random() * 6000),
    });
  }

  // Yearly data
  for (let i = 0; i < formats.yearly; i++) {
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - i);
    result.yearly.push({
      date: date.toISOString().split("T")[0],
      desktop: Math.floor(Math.random() * 20000),
      mobile: Math.floor(Math.random() * 20000),
    });
  }

  return result;
};

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const allData = React.useMemo(() => generateDummyData(), []);
  const [range, setRange] = React.useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>Interactive chart by date range</CardDescription>
        <div className="absolute right-4 top-4">
          <Select value={range} onValueChange={(val) => setRange(val as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={[...allData[range]].reverse()}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: range === "yearly" ? undefined : "numeric",
                  year: range === "yearly" ? "numeric" : undefined,
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: range === "yearly" ? undefined : "numeric",
                      year: range === "yearly" ? "numeric" : undefined,
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="monotone"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="monotone"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export const CreatorChartExample = () => <ChartAreaInteractive />;
