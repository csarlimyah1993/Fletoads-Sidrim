"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Pie,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  PieChart,
} from "recharts"

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: Record<string, any>
}

export function ChartContainerComponent({ children, config, className, ...props }: ChartProps) {
  return (
    <div
      className={className}
      style={
        {
          "--color-receita": "hsl(217, 91%, 60%)",
          "--color-estimativa": "hsl(142, 71%, 45%)",
          "--color-media": "hsl(215, 16%, 47%)",
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

export function ChartTooltipComponent({ children }: { children: React.ReactNode }) {
  return <div className="bg-white p-2 border rounded-md shadow-md text-sm">{children}</div>
}

export function ChartTooltipContentComponent() {
  return (
    <div className="bg-white p-2 border rounded-md shadow-md">
      <p className="text-sm font-medium">Tooltip Content</p>
    </div>
  )
}

interface ChartLegendProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartLegend = React.forwardRef<HTMLDivElement, ChartLegendProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props} />
})
ChartLegend.displayName = "ChartLegend"

interface ChartLegendContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("text-sm", className)} {...props} />
})
ChartLegendContent.displayName = "ChartTooltipContent"

interface ChartStyleProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartStyle = React.forwardRef<HTMLDivElement, ChartStyleProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("text-sm", className)} {...props} />
})
ChartStyle.displayName = "ChartStyle"

// Define interfaces for chart data
interface BarChartData {
  name: string
  pv: number
  uv: number
  [key: string]: any // For any additional properties
}

interface LineChartData {
  name: string
  pv: number
  uv: number
  [key: string]: any // For any additional properties
}

interface PieChartData {
  name: string
  value: number
  [key: string]: any // For any additional properties
}

// Update component props with proper types
interface BarChartComponentProps {
  data: BarChartData[]
}

interface LineChartComponentProps {
  data: LineChartData[]
}

interface PieChartComponentProps {
  data: PieChartData[]
}

const BarChartComponent = ({ data }: BarChartComponentProps) => {
  return (
    <BarChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="pv" fill="#8884d8" />
      <Bar dataKey="uv" fill="#82ca9d" />
    </BarChart>
  )
}

const LineChartComponent = ({ data }: LineChartComponentProps) => {
  return (
    <LineChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
    </LineChart>
  )
}

const PieChartComponent = ({ data }: PieChartComponentProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export {
  ChartStyle as Chart,
  BarChartComponent as BarChart,
  LineChartComponent as LineChart,
  PieChartComponent as PieChart,
  ChartContainerComponent as ChartContainer,
  ChartTooltipComponent as ChartTooltip,
  ChartTooltipContentComponent as ChartTooltipContent,
}
