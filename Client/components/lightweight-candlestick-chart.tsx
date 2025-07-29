"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMoveEventParams,
  ColorType,
  Time,
} from "lightweight-charts";

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
  const seriesRef =
    useRef<
      ReturnType<ReturnType<typeof createChart>["addCandlestickSeries"]>
    >();
  const [hover, setHover] = useState<Candle | null>(null);
  const lengthRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!chartRef.current) {
      chartRef.current = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "#111827" },
          textColor: "#e5e7eb",
        },
        grid: {
          vertLines: { color: "#374151" },
          horzLines: { color: "#374151" },
        },
        rightPriceScale: {
          borderColor: "#374151",
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: { borderColor: "#374151" },
        crosshair: { mode: 1 },
      });
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      chartRef.current.timeScale().fitContent();

      const resize = () => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
          });
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
    if (!seriesRef.current) {
      if (chartRef.current) {
        seriesRef.current = chartRef.current.addCandlestickSeries();
      } else {
        return;
      }
    }

    if (lengthRef.current === 0) {
      seriesRef.current.setData(data);
    } else if (data.length >= lengthRef.current) {
      const last = data[data.length - 1];
      seriesRef.current.update(last);
    } else {
      seriesRef.current.setData(data);
    }
    chartRef.current?.timeScale().scrollToRealTime();
    lengthRef.current = data.length;
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
        <div className="text-xs text-center text-white">
          H: {hover.high} L: {hover.low}
        </div>
      )}
    </div>
  );
}
