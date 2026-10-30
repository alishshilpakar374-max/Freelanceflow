import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@/components/ui/Card";
import { axisTick, tooltipProps } from "@/features/dashboard/chartTheme";
import type { MonthlyRevenue } from "@/features/dashboard/stats";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

interface RevenueChartProps {
  data: MonthlyRevenue[];
  description?: string;
}

export default function RevenueChart({
  data,
  description = "Payments received, last 6 months",
}: RevenueChartProps) {
  const summary = data
    .map((item) => `${item.month}: ${formatCurrency(item.revenue)}`)
    .join(", ");

  return (
    <Card className="min-w-0">
      <h2 className="text-base font-semibold">Monthly revenue</h2>
      <p className="text-sm text-muted">{description}</p>

      <p className="sr-only">{summary}</p>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="month"
              tick={axisTick}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={52}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => formatCompactCurrency(value)}
            />
            <Tooltip
              {...tooltipProps}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="var(--primary)"
              fillOpacity={0.15}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
