"use client"

import { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMoveEventParams, ColorType, Time } from "lightweight-charts";

export interface Candle {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Props {
  data: Candle[];
}

export function LightweightCandlestickChart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart>>();
  const seriesRef = useRef<ReturnType<typeof createChart>["addCandlestickSeries"]>();
  const [hover, setHover] = useState<Candle | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!chartRef.current) {
      chartRef.current = createChart(containerRef.current, {
        layout: { background: { type: ColorType.Solid, color: "#ffffff" } },
        rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.1 } },
      });
      seriesRef.current = chartRef.current.addCandlestickSeries();
      const resize = () => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
        }
      };
      resize();
      window.addEventListener("resize", resize);
      return () => {
        window.removeEventListener("resize", resize);
        chartRef.current?.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (!seriesRef.current && chartRef.current) {
      seriesRef.current = chartRef.current.addCandlestickSeries();
    }
    seriesRef.current?.setData(data);
  }, [data]);

  useEffect(() => {
    const chart = chartRef.current;
    const series = seriesRef.current;
    if (!chart || !series) return;
    const handler = (param: CrosshairMoveEventParams) => {
      if (param.time && param.seriesData.size) {
        const d = param.seriesData.get(series) as Candle | undefined;
        if (d) setHover(d);
      } else {
        setHover(null);
      }
    };
    chart.subscribeCrosshairMove(handler);
    return () => chart.unsubscribeCrosshairMove(handler);
  }, [data]);

  return (
    <div className="space-y-1">
      <div ref={containerRef} className="w-full h-96" />
      {hover && (
        <div className="text-xs text-center">
          O: {hover.open} H: {hover.high} L: {hover.low} C: {hover.close}
        </div>
      )}
    </div>
  );
}
