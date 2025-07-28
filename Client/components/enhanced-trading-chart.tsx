"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTradingStore } from "@/lib/trading-store";
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
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, LineChart } from "lucide-react";

interface ChartData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi: number;
  bb_upper: number;
  bb_middle: number;
  bb_lower: number;
  macd: number;
  macd_signal: number;
  macd_histogram: number;
}

interface EnhancedTradingChartProps {
  symbol: string;
}

export function EnhancedTradingChart({ symbol }: EnhancedTradingChartProps) {
  const { tickers, isSimulationMode } = useTradingStore();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState("1h");
  const [chartType, setChartType] = useState<"candlestick" | "line">(
    "candlestick",
  );
  const [showIndicators, setShowIndicators] = useState({
    rsi: true,
    bollinger: true,
    macd: false,
    volume: true,
  });
  const lastValidPrice = useRef(0);

  const currentTicker = tickers[symbol];
  const currentPrice = currentTicker?.lastPrice
    ? Number.parseFloat(currentTicker.lastPrice)
    : 0;
  const priceChange = currentTicker?.price24hPcnt
    ? Number.parseFloat(currentTicker.price24hPcnt)
    : 0;

  // Preserve the last valid price so the chart doesn't jump to zero when
  // the websocket misses a tick.
  useEffect(() => {
    if (currentPrice > 0) {
      lastValidPrice.current = currentPrice;
    }
  }, [currentPrice]);

  // Generate enhanced chart data whenever the symbol changes
  useEffect(() => {
    const generateEnhancedChartData = () => {
      const data: ChartData[] = [];
      let basePrice = lastValidPrice.current || currentPrice || 43250;

      for (let i = 0; i < 200; i++) {
        const timestamp = Date.now() - (200 - i) * 60 * 60 * 1000;
        const time = new Date(timestamp).toLocaleTimeString();

        const change = (Math.random() - 0.5) * 0.02;
        const open = basePrice;
        const close = basePrice * (1 + change);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.random() * 1000000;

        // Technical indicators (simplified calculations)
        const rsi = 30 + Math.random() * 40;
        const bb_middle = close;
        const bb_upper = bb_middle * 1.02;
        const bb_lower = bb_middle * 0.98;

        // MACD (simplified)
        const macd = (Math.random() - 0.5) * 100;
        const macd_signal = macd * 0.8;
        const macd_histogram = macd - macd_signal;

        data.push({
          time,
          timestamp,
          open,
          high,
          low,
          close,
          volume,
          rsi,
          bb_upper,
          bb_middle,
          bb_lower,
          macd,
          macd_signal,
          macd_histogram,
        });

        basePrice = close;
      }

      return data;
    };

    setChartData(generateEnhancedChartData());
  }, [symbol]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const price = currentPrice > 0 ? currentPrice : lastValidPrice.current;
      if (price > 0) {
        setChartData((prevData) => {
          const newData = [...prevData];
          const lastItem = newData[newData.length - 1];
          const newItem: ChartData = {
            ...lastItem,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            close: price,
            high: Math.max(lastItem.high, price),
            low: Math.min(lastItem.low, price),
            volume: Math.random() * 1000000,
            rsi: Math.max(
              0,
              Math.min(100, lastItem.rsi + (Math.random() - 0.5) * 10),
            ),
            macd: (Math.random() - 0.5) * 100,
          };

          newItem.bb_middle = newItem.close;
          newItem.bb_upper = newItem.bb_middle * 1.02;
          newItem.bb_lower = newItem.bb_middle * 0.98;
          newItem.macd_signal = newItem.macd * 0.8;
          newItem.macd_histogram = newItem.macd - newItem.macd_signal;

          newData.push(newItem);
          return newData.slice(-200);
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [symbol, currentPrice]);

  const MainChart = ({ data }: { data: ChartData[] }) => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} isAnimationActive={false}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis yAxisId="price" orientation="right" />
        {showIndicators.volume && <YAxis yAxisId="volume" orientation="left" />}
        <Tooltip
          formatter={(value, name) => {
            if (name === "volume")
              return [Number(value).toLocaleString(), "거래량"];
            return [`$${Number(value).toFixed(2)}`, name];
          }}
        />

        {/* Bollinger Bands */}
        {showIndicators.bollinger && (
          <>
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="bb_upper"
              stackId="bb"
              stroke="#e5e7eb"
              fill="transparent"
              strokeDasharray="2 2"
            />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="bb_lower"
              stackId="bb"
              stroke="#e5e7eb"
              fill="#f3f4f6"
              fillOpacity={0.1}
              strokeDasharray="2 2"
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="bb_middle"
              stroke="#6b7280"
              strokeDasharray="2 2"
              dot={false}
            />
          </>
        )}

        {/* Price Line/Candlestick */}
        {chartType === "line" ? (
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
          />
        ) : (
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
          />
        )}

        {/* Volume */}
        {showIndicators.volume && (
          <Bar yAxisId="volume" dataKey="volume" fill="#e5e7eb" opacity={0.3} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );

  const RSIChart = ({ data }: { data: ChartData[] }) => (
    <ResponsiveContainer width="100%" height={120}>
      <ComposedChart data={data} isAnimationActive={false}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={[0, 100]} />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(1)}`, "RSI"]}
        />
        <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" />
        <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="2 2" />
        <Area
          type="monotone"
          dataKey="rsi"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.1}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const MACDChart = ({ data }: { data: ChartData[] }) => (
    <ResponsiveContainer width="100%" height={120}>
      <ComposedChart data={data} isAnimationActive={false}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="macd"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="macd_signal"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
        <Bar dataKey="macd_histogram" fill="#6b7280" opacity={0.6} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              {symbol} 차트
              <Badge variant={isSimulationMode ? "secondary" : "default"}>
                {isSimulationMode ? "시뮬레이션" : "실시간"}
              </Badge>
            </CardTitle>
            {currentPrice > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  ${currentPrice.toFixed(2)}
                </span>
                <div
                  className={`flex items-center gap-1 ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {priceChange >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {priceChange >= 0 ? "+" : ""}
                    {(priceChange * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Chart Type Toggle */}
            <Button
              variant={chartType === "candlestick" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("candlestick")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={chartType === "line" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("line")}
            >
              <LineChart className="h-4 w-4" />
            </Button>

            {/* Timeframe Selection */}
            <Tabs value={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="1m">1분</TabsTrigger>
                <TabsTrigger value="5m">5분</TabsTrigger>
                <TabsTrigger value="1h">1시간</TabsTrigger>
                <TabsTrigger value="1d">1일</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Indicator Toggles */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={showIndicators.bollinger ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setShowIndicators((prev) => ({
                ...prev,
                bollinger: !prev.bollinger,
              }))
            }
          >
            볼린저 밴드
          </Button>
          <Button
            variant={showIndicators.rsi ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setShowIndicators((prev) => ({ ...prev, rsi: !prev.rsi }))
            }
          >
            RSI
          </Button>
          <Button
            variant={showIndicators.macd ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setShowIndicators((prev) => ({ ...prev, macd: !prev.macd }))
            }
          >
            MACD
          </Button>
          <Button
            variant={showIndicators.volume ? "default" : "outline"}
            size="sm"
            onClick={() =>
              setShowIndicators((prev) => ({ ...prev, volume: !prev.volume }))
            }
          >
            거래량
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Chart */}
          <MainChart data={chartData} />

          {/* RSI Indicator */}
          {showIndicators.rsi && (
            <div>
              <h4 className="text-sm font-medium mb-2">RSI (14)</h4>
              <RSIChart data={chartData} />
            </div>
          )}

          {/* MACD Indicator */}
          {showIndicators.macd && (
            <div>
              <h4 className="text-sm font-medium mb-2">MACD</h4>
              <MACDChart data={chartData} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
