import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { axisTick, tooltipProps } from "@/features/dashboard/chartTheme";
import type { StageCount } from "@/features/dashboard/stats";

interface LeadFunnelChartProps {
  data: StageCount[];
  conversionRate: number;
}

export default function LeadFunnelChart({
  data,
  conversionRate,
}: LeadFunnelChartProps) {
  const summary = data.map((item) => `${item.stage}: ${item.count}`).join(", ");

  return (
    <Card className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Lead conversion</h2>
          <p className="text-sm text-muted">Leads by pipeline stage</p>
        </div>
        <Badge tone="success">{conversionRate}% won</Badge>
      </div>

      {/* Screen readers can't "see" the chart, so give them the numbers as text. */}
      <p className="sr-only">{summary}</p>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 16 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="stage"
              width={96}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              {...tooltipProps}
              cursor={{ fill: "var(--surface-muted)" }}
            />
            <Bar
              dataKey="count"
              name="Leads"
              fill="var(--primary)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
