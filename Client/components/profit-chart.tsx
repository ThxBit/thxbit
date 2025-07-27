"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "1월", profit: 1000, simulation: 800 },
  { date: "2월", profit: 2500, simulation: 2200 },
  { date: "3월", profit: 1800, simulation: 2100 },
  { date: "4월", profit: 3200, simulation: 2800 },
  { date: "5월", profit: 4100, simulation: 3900 },
  { date: "6월", profit: 3800, simulation: 4200 },
  { date: "7월", profit: 5200, simulation: 4800 },
]

export function ProfitChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>수익률 추이</CardTitle>
        <CardDescription>실제 수익률 vs AI 시뮬레이션 비교</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value, name) => [`$${value}`, name === "profit" ? "실제 수익" : "AI 시뮬레이션"]} />
            <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2} name="profit" />
            <Line
              type="monotone"
              dataKey="simulation"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="simulation"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
