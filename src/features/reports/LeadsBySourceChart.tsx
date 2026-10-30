import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "@/components/ui/Card";
import { axisTick, tooltipProps } from "@/features/dashboard/chartTheme";
import type { SourceStat } from "@/features/reports/reportStats";

interface LeadsBySourceChartProps {
  data: SourceStat[];
}

export default function LeadsBySourceChart({ data }: LeadsBySourceChartProps) {
  const summary = data
    .map((item) => `${item.source}: ${item.leads} leads, ${item.won} won`)
    .join(". ");

  return (
    <Card className="min-w-0">
      <h2 className="text-base font-semibold">Leads by source</h2>
      <p className="text-sm text-muted">
        Where your leads come from, and which sources win
      </p>

      <p className="sr-only">{summary}</p>

      <div className="mt-4 h-72 w-full">
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
              dataKey="source"
              width={96}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              {...tooltipProps}
              cursor={{ fill: "var(--surface-muted)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "var(--muted)" }} />
            <Bar
              dataKey="leads"
              name="Leads"
              fill="var(--primary)"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="won"
              name="Won"
              fill="var(--success)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
