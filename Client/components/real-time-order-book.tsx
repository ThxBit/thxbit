"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTradingStore } from "@/lib/trading-store"

interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

interface RealTimeOrderBookProps {
  symbol: string
}

export function RealTimeOrderBook({ symbol }: RealTimeOrderBookProps) {
  const { orderbooks, isSimulationMode } = useTradingStore()
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [spread, setSpread] = useState(0)

  useEffect(() => {
    const orderbookData = orderbooks[symbol]

    if (orderbookData && orderbookData.a && orderbookData.b) {
      // Process asks (sell orders)
      const processedAsks = orderbookData.a
        .slice(0, 15)
        .map((ask: string[]) => ({
          price: Number.parseFloat(ask[0]),
          amount: Number.parseFloat(ask[1]),
          total: Number.parseFloat(ask[0]) * Number.parseFloat(ask[1]),
        }))
        .reverse()

      // Process bids (buy orders)
      const processedBids = orderbookData.b.slice(0, 15).map((bid: string[]) => ({
        price: Number.parseFloat(bid[0]),
        amount: Number.parseFloat(bid[1]),
        total: Number.parseFloat(bid[0]) * Number.parseFloat(bid[1]),
      }))

      setAsks(processedAsks)
      setBids(processedBids)

      // Calculate spread
      if (processedAsks.length > 0 && processedBids.length > 0) {
        const bestAsk = processedAsks[processedAsks.length - 1].price
        const bestBid = processedBids[0].price
        setSpread(bestAsk - bestBid)
      }
    }
  }, [orderbooks, symbol])

  const maxVolume = Math.max(...asks.map((ask) => ask.amount), ...bids.map((bid) => bid.amount))

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">호가창</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isSimulationMode ? "secondary" : "default"}>
              {isSimulationMode ? "시뮬레이션" : "실시간"}
            </Badge>
            {spread > 0 && <Badge variant="outline">스프레드: ${spread.toFixed(2)}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xs">
          {/* Header */}
          <div className="grid grid-cols-3 gap-2 p-2 bg-muted text-muted-foreground font-medium">
            <div>가격(USDT)</div>
            <div className="text-right">수량</div>
            <div className="text-right">총액</div>
          </div>

          {/* Asks (Sell Orders) */}
          <div className="space-y-0.5">
            {asks.map((ask, index) => {
              const volumePercent = (ask.amount / maxVolume) * 100
              return (
                <div
                  key={index}
                  className="relative grid grid-cols-3 gap-2 p-1 hover:bg-red-50 cursor-pointer"
                  onClick={() => {
                    // Handle price click for quick order
                    console.log("Selected ask price:", ask.price)
                  }}
                >
                  {/* Volume bar background */}
                  <div className="absolute inset-0 bg-red-100 opacity-30" style={{ width: `${volumePercent}%` }} />
                  <div className="relative text-red-600 font-mono font-medium">{ask.price.toFixed(2)}</div>
                  <div className="relative text-right font-mono">{ask.amount.toFixed(4)}</div>
                  <div className="relative text-right font-mono text-xs">{ask.total.toFixed(0)}</div>
                </div>
              )
            })}
          </div>

          {/* Current Price */}
          <div className="p-2 bg-muted text-center font-medium">
            {bids.length > 0 && asks.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-green-600">${bids[0]?.price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">현재가</span>
                <span className="text-red-600">${asks[asks.length - 1]?.price.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Bids (Buy Orders) */}
          <div className="space-y-0.5">
            {bids.map((bid, index) => {
              const volumePercent = (bid.amount / maxVolume) * 100
              return (
                <div
                  key={index}
                  className="relative grid grid-cols-3 gap-2 p-1 hover:bg-green-50 cursor-pointer"
                  onClick={() => {
                    // Handle price click for quick order
                    console.log("Selected bid price:", bid.price)
                  }}
                >
                  {/* Volume bar background */}
                  <div className="absolute inset-0 bg-green-100 opacity-30" style={{ width: `${volumePercent}%` }} />
                  <div className="relative text-green-600 font-mono font-medium">{bid.price.toFixed(2)}</div>
                  <div className="relative text-right font-mono">{bid.amount.toFixed(4)}</div>
                  <div className="relative text-right font-mono text-xs">{bid.total.toFixed(0)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
