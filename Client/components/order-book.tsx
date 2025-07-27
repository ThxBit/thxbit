"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OrderBookData {
  price: number
  amount: number
  total: number
}

interface OrderBookProps {
  symbol: string
}

export function OrderBook({ symbol }: OrderBookProps) {
  const [asks, setAsks] = useState<OrderBookData[]>([])
  const [bids, setBids] = useState<OrderBookData[]>([])

  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = 43250
      const newAsks: OrderBookData[] = []
      const newBids: OrderBookData[] = []

      // 매도 호가 (asks)
      for (let i = 0; i < 10; i++) {
        const price = basePrice * (1 + (i + 1) * 0.0001)
        const amount = Math.random() * 10
        const total = price * amount
        newAsks.push({ price, amount, total })
      }

      // 매수 호가 (bids)
      for (let i = 0; i < 10; i++) {
        const price = basePrice * (1 - (i + 1) * 0.0001)
        const amount = Math.random() * 10
        const total = price * amount
        newBids.push({ price, amount, total })
      }

      setAsks(newAsks.reverse())
      setBids(newBids)
    }

    generateOrderBook()

    const interval = setInterval(generateOrderBook, 2000)
    return () => clearInterval(interval)
  }, [symbol])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">호가창</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xs">
          {/* 헤더 */}
          <div className="grid grid-cols-3 gap-2 p-2 bg-muted text-muted-foreground font-medium">
            <div>가격(USDT)</div>
            <div className="text-right">수량</div>
            <div className="text-right">총액</div>
          </div>

          {/* 매도 호가 */}
          <div className="space-y-1">
            {asks.map((ask, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 p-1 hover:bg-red-50 cursor-pointer">
                <div className="text-red-600 font-mono">{ask.price.toFixed(2)}</div>
                <div className="text-right font-mono">{ask.amount.toFixed(4)}</div>
                <div className="text-right font-mono">{ask.total.toFixed(0)}</div>
              </div>
            ))}
          </div>

          {/* 현재가 */}
          <div className="p-2 bg-muted text-center font-medium">현재가: ${bids[0]?.price.toFixed(2)}</div>

          {/* 매수 호가 */}
          <div className="space-y-1">
            {bids.map((bid, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 p-1 hover:bg-green-50 cursor-pointer">
                <div className="text-green-600 font-mono">{bid.price.toFixed(2)}</div>
                <div className="text-right font-mono">{bid.amount.toFixed(4)}</div>
                <div className="text-right font-mono">{bid.total.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
