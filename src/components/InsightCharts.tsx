import { ReactNode } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useChartTheme, SERIES_COLORS } from '@/components/insights/chartTheme';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export const ChartCard = ({ title, children, className, action }: ChartCardProps) => (
  <Card className={className}>
    <CardHeader className="pb-2 flex flex-row items-center justify-between">
      <CardTitle className="text-base font-medium">{title}</CardTitle>
      {action && <div className="flex items-center">{action}</div>}
    </CardHeader>
    <CardContent className="p-0 h-[250px]">
      {children}
    </CardContent>
  </Card>
);

interface ChartProps {
  data: Array<Record<string, string | number>>;
  currency?: string;
  className?: string;
}

const tooltipStyle = (th: ReturnType<typeof useChartTheme>) => ({
  backgroundColor: th.tooltipBg,
  borderColor: th.tooltipBorder,
  color: th.tooltipText,
  borderRadius: 8,
  fontSize: 12,
});

export const SpendingTrendsChart = ({ data, currency = 'USD', className }: ChartProps) => {
  const th = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={th.series} stopOpacity={0.8} />
            <stop offset="95%" stopColor={th.series} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={th.grid} />
        <XAxis
          dataKey="date"
          stroke={th.axis}
          fontSize={10}
          tickFormatter={(dateStr: string) => {
            if (!dateStr) return "";
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            if (isNaN(date.getTime())) return dateStr;
            return format(date, "MM/dd");
          }}
        />
        <YAxis
          stroke={th.axis}
          fontSize={10}
          tickFormatter={(value: number) => formatCurrency(value, currency, true)}
        />
        <Tooltip
          contentStyle={tooltipStyle(th)}
          formatter={(value: number) => [formatCurrency(value, currency), "Spending"]}
          labelFormatter={(label: string) => {
            if (!label) return "";
            const parts = label.split('-');
            if (parts.length !== 3) return label;
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            if (isNaN(date.getTime())) return label;
            return format(date, "MMMM dd, yyyy");
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={th.series}
          fillOpacity={1}
          fill="url(#colorValue)"
          activeDot={{ r: 6, fill: th.seriesLight, stroke: th.series, strokeWidth: 2 }}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const VendorSpendingChart = ({ data, currency = 'USD', className }: {
  data: Array<{ name: string; value: number }>;
  currency?: string;
  className?: string;
}) => {
  const th = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <BarChart data={data.slice(0, 7)} layout="vertical" margin={{ top: 10, right: 30, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={th.grid} />
        <XAxis
          type="number"
          stroke={th.axis}
          fontSize={10}
          tickFormatter={(value: number) => formatCurrency(value, currency, true)}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke={th.axis}
          fontSize={10}
          width={110}
          tickFormatter={(value: string) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
        />
        <Tooltip
          contentStyle={tooltipStyle(th)}
          formatter={(value: number) => [formatCurrency(value, currency), "Amount"]}
        />
        <Bar dataKey="value" fill={th.series} radius={[0, 4, 4, 0]}>
          {data.slice(0, 7).map((_, index) => (
            <Cell key={`cell-${index}`} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const CategoryDistributionChart = ({ data, className }: ChartProps) => {
  const th = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="currentColor"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle(th)} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const MonthlyComparisonChart = ({ data, currency = 'USD', className }: ChartProps) => {
  const th = useChartTheme();
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={th.grid} />
        <XAxis dataKey="name" stroke={th.axis} fontSize={10} />
        <YAxis
          stroke={th.axis}
          fontSize={10}
          tickFormatter={(value: number) => formatCurrency(value, currency, true)}
        />
        <Tooltip
          contentStyle={tooltipStyle(th)}
          formatter={(value: number) => [formatCurrency(value, currency), "Amount"]}
        />
        <Legend wrapperStyle={{ color: th.axis, fontSize: 12 }} />
        <Line type="monotone" dataKey="current" name="Current Year" stroke={th.series} activeDot={{ r: 6 }} strokeWidth={2} />
        <Line type="monotone" dataKey="previous" name="Previous Year" stroke={th.axis} strokeDasharray="5 5" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const SpendingGoalChart = ({ data }: { data: Array<{ name: string; value: number }> }) => {
  const th = useChartTheme();
  const rawPercentage = data[0]?.value ?? 0;
  const displayPercentage = Math.min(rawPercentage, 100);
  const isOverBudget = rawPercentage > 100;
  const remaining = Math.max(0, 100 - rawPercentage);

  const getSpendingColor = (percent: number) => {
    if (percent < 60) return th.positive;
    if (percent < 85) return th.warning;
    if (percent < 100) return th.danger;
    return th.danger;
  };
  const color = getSpendingColor(rawPercentage);

  const gaugeData = [
    { name: 'Spent', value: displayPercentage },
    { name: 'Remaining', value: 100 - displayPercentage },
  ];

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex flex-1 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              cornerRadius={10}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              <Cell key="spent" fill={color} />
              <Cell key="remaining" fill={th.gaugeTrack} />
            </Pie>
            <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" fill={th.tooltipText} fontSize={28} fontWeight="bold">
              {rawPercentage}%
            </text>
            <text x="50%" y="85%" textAnchor="middle" dominantBaseline="middle" fill={isOverBudget ? color : th.textMuted} fontSize={12} fontWeight={isOverBudget ? "bold" : "normal"}>
              {isOverBudget ? "OVER BUDGET" : "of budget used"}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid w-full grid-cols-2 gap-4 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-1 text-sm text-muted-foreground">Spent</div>
          <div className="text-lg font-semibold" style={{ color }}>
            {rawPercentage}%
            {isOverBudget && <span className="ms-1 text-xs">↑</span>}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="mb-1 text-sm text-muted-foreground">Remaining</div>
          <div className="text-lg font-semibold" style={{ color: remaining > 0 ? th.series : th.danger }}>
            {remaining}%
            {remaining <= 0 && <span className="ms-1 text-xs">↓</span>}
          </div>
        </div>
      </div>
    </div>
  );
};