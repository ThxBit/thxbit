"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface ChartData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  rsi: number
  bb_upper: number
  bb_middle: number
  bb_lower: number
}

interface TradingChartProps {
  symbol: string
}

export function TradingChart({ symbol }: TradingChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [timeframe, setTimeframe] = useState("1h")

  // 차트 데이터 생성 (시뮬레이션)
  useEffect(() => {
    const generateChartData = () => {
      const data: ChartData[] = []
      let basePrice = 43250

      for (let i = 0; i < 100; i++) {
        const time = new Date(Date.now() - (100 - i) * 60 * 60 * 1000).toLocaleTimeString()
        const change = (Math.random() - 0.5) * 0.02
        const open = basePrice
        const close = basePrice * (1 + change)
        const high = Math.max(open, close) * (1 + Math.random() * 0.01)
        const low = Math.min(open, close) * (1 - Math.random() * 0.01)
        const volume = Math.random() * 1000000

        // RSI 계산 (단순화)
        const rsi = 30 + Math.random() * 40

        // 볼린저 밴드 계산 (단순화)
        const bb_middle = close
        const bb_upper = bb_middle * 1.02
        const bb_lower = bb_middle * 0.98

        data.push({
          time,
          open,
          high,
          low,
          close,
          volume,
          rsi,
          bb_upper,
          bb_middle,
          bb_lower,
        })

        basePrice = close
      }

      return data
    }

    setChartData(generateChartData())

    // 실시간 업데이트
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newData = [...prevData]
        const lastItem = newData[newData.length - 1]
        const change = (Math.random() - 0.5) * 0.005

        const newItem: ChartData = {
          ...lastItem,
          time: new Date().toLocaleTimeString(),
          close: lastItem.close * (1 + change),
          high: Math.max(lastItem.high, lastItem.close * (1 + change)),
          low: Math.min(lastItem.low, lastItem.close * (1 + change)),
          volume: Math.random() * 1000000,
          rsi: Math.max(0, Math.min(100, lastItem.rsi + (Math.random() - 0.5) * 10)),
        }

        newItem.bb_middle = newItem.close
        newItem.bb_upper = newItem.bb_middle * 1.02
        newItem.bb_lower = newItem.bb_middle * 0.98

        newData.push(newItem)
        return newData.slice(-100) // 최근 100개 데이터만 유지
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [symbol, timeframe])

  const CandlestickChart = ({ data }: { data: ChartData[] }) => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis yAxisId="price" orientation="right" />
        <YAxis yAxisId="volume" orientation="left" />
        <Tooltip
          formatter={(value, name) => {
            if (name === "volume") return [Number(value).toLocaleString(), "거래량"]
            return [`$${Number(value).toFixed(2)}`, name]
          }}
        />

        {/* 볼린저 밴드 */}
        <Line yAxisId="price" type="monotone" dataKey="bb_upper" stroke="#e5e7eb" strokeDasharray="2 2" dot={false} />
        <Line yAxisId="price" type="monotone" dataKey="bb_middle" stroke="#6b7280" strokeDasharray="2 2" dot={false} />
        <Line yAxisId="price" type="monotone" dataKey="bb_lower" stroke="#e5e7eb" strokeDasharray="2 2" dot={false} />

        {/* 가격 라인 */}
        <Line yAxisId="price" type="monotone" dataKey="close" stroke="#8b5cf6" strokeWidth={2} dot={false} />

        {/* 거래량 */}
        <Bar yAxisId="volume" dataKey="volume" fill="#e5e7eb" opacity={0.3} />
      </ComposedChart>
    </ResponsiveContainer>
  )

  const RSIChart = ({ data }: { data: ChartData[] }) => (
    <ResponsiveContainer width="100%" height={150}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={[0, 100]} />
        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}`, "RSI"]} />
        <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" />
        <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="2 2" />
        <Line type="monotone" dataKey="rsi" stroke="#f59e0b" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{symbol} 차트</CardTitle>
          <Tabs value={timeframe} onValueChange={setTimeframe}>
            <TabsList>
              <TabsTrigger value="1m">1분</TabsTrigger>
              <TabsTrigger value="5m">5분</TabsTrigger>
              <TabsTrigger value="1h">1시간</TabsTrigger>
              <TabsTrigger value="1d">1일</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 메인 차트 */}
          <CandlestickChart data={chartData} />

          {/* RSI 지표 */}
          <div>
            <h4 className="text-sm font-medium mb-2">RSI (14)</h4>
            <RSIChart data={chartData} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
