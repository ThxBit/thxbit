"use client"

import { useRef, useEffect } from "react"

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface Props {
  data: Candle[]
  width?: number
  height?: number
}

export function CandlestickChart({ data, width = 800, height = 400 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    // price range
    const prices = data.flatMap(d => [d.high, d.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    const candleWidth = (width - 100) / data.length
    const chartHeight = height - 80

    // grid
    ctx.strokeStyle = "#2a2a2a"
    ctx.lineWidth = 1

    for (let i = 0; i <= 10; i++) {
      const y = 40 + (chartHeight / 10) * i
      ctx.beginPath()
      ctx.moveTo(50, y)
      ctx.lineTo(width - 50, y)
      ctx.stroke()
    }

    for (let i = 0; i <= 10; i++) {
      const x = 50 + ((width - 100) / 10) * i
      ctx.beginPath()
      ctx.moveTo(x, 40)
      ctx.lineTo(x, height - 40)
      ctx.stroke()
    }

    // price labels
    ctx.fillStyle = "#888"
    ctx.font = "12px monospace"
    ctx.textAlign = "right"
    for (let i = 0; i <= 10; i++) {
      const price = maxPrice - (priceRange / 10) * i
      const y = 40 + (chartHeight / 10) * i
      ctx.fillText(price.toFixed(0), 45, y + 4)
    }

    // candles
    data.forEach((candle, index) => {
      const x = 50 + index * candleWidth + candleWidth / 2
      const openY = 40 + ((maxPrice - candle.open) / priceRange) * chartHeight
      const closeY = 40 + ((maxPrice - candle.close) / priceRange) * chartHeight
      const highY = 40 + ((maxPrice - candle.high) / priceRange) * chartHeight
      const lowY = 40 + ((maxPrice - candle.low) / priceRange) * chartHeight
      const isGreen = candle.close > candle.open

      ctx.strokeStyle = isGreen ? "#00ff88" : "#ff4444"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      ctx.fillStyle = isGreen ? "#00ff88" : "#ff4444"
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.abs(closeY - openY)
      ctx.fillRect(x - candleWidth / 4, bodyTop, candleWidth / 2, Math.max(bodyHeight, 1))
    })
  }, [data, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-800 bg-gray-900 w-full"
    />
  )
}

