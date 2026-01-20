import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A stacked bar chart with a legend"

interface ChartBarStackedProps {
  data?: Array<{ [key: string]: any }>;
  title?: string;
  description?: string;
  dataKeys?: { key: string; label: string; color: string }[];
  categoryKey?: string;
  showFooter?: boolean;
}

const defaultChartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const defaultChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartBarStacked({ 
  data,
  title = "Bar Chart - Stacked + Legend",
  description = "January - June 2024",
  dataKeys = [{ key: 'desktop', label: 'Desktop', color: 'var(--chart-1)' }, { key: 'mobile', label: 'Mobile', color: 'var(--chart-2)' }],
  categoryKey = "month",
  showFooter = true
}: ChartBarStackedProps = {}) {
  const chartData = data || defaultChartData;
  
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    dataKeys.forEach(dk => {
      config[dk.key] = { label: dk.label, color: dk.color };
    });
    return config;
  }, [dataKeys]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={categoryKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            {dataKeys.map((dk, idx) => (
              <Bar
                key={dk.key}
                dataKey={dk.key}
                stackId="a"
                fill={dk.color}
                radius={idx === 0 ? [0, 0, 4, 4] : idx === dataKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      {showFooter && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
