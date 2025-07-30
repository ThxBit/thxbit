"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMoveEventParams,
  ColorType,
  Time,
  LastPriceAnimationMode,
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
        handleScroll: { mouseWheel: false },
        handleScale: { mouseWheel: false },
      });
      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        lastPriceAnimation: LastPriceAnimationMode.Disabled,
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
      const wheel = (e: WheelEvent) => {
        if (!e.ctrlKey || !chartRef.current) return;
        e.preventDefault();
        const ts = chartRef.current.timeScale();
        const opts = ts.options();
        const current = opts.barSpacing;
        const factor = e.deltaY > 0 ? 1.1 : 0.9;
        const next = Math.max(1, Math.min(50, current * factor));
        ts.applyOptions({ barSpacing: next });
      };
      containerRef.current.addEventListener("wheel", wheel, { passive: false });
      return () => {
        window.removeEventListener("resize", resize);
        containerRef.current?.removeEventListener("wheel", wheel);
        chartRef.current?.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (!seriesRef.current) {
      if (chartRef.current) {
        seriesRef.current = chartRef.current.addCandlestickSeries({
          lastPriceAnimation: LastPriceAnimationMode.Disabled,
        });
      } else {
        return;
      }
    }

    const sorted = [...data].sort((a, b) => Number(a.time) - Number(b.time));

    if (lengthRef.current === 0) {
      seriesRef.current.setData(sorted);
    } else if (sorted.length >= lengthRef.current) {
      const last = sorted[sorted.length - 1];
      seriesRef.current.update(last);
    } else {
      seriesRef.current.setData(sorted);
    }
    chartRef.current?.timeScale().scrollToRealTime();
    lengthRef.current = sorted.length;
  }, [data]);

  // useEffect(() => {
  //   const chart = chartRef.current;
  //   const series = seriesRef.current;
  //   if (!chart || !series) return;
  //   const handler = (param: CrosshairMoveEventParams) => {
  //     if (param.time && param.seriesData.size) {
  //       const d = param.seriesData.get(series) as Candle | undefined;
  //       if (d) setHover(d);
  //     } else {
  //       setHover(null);
  //     }
  //   };
  //   chart.subscribeCrosshairMove(handler);
  //   return () => chart.unsubscribeCrosshairMove(handler);
  // }, [data]);

  return (
    <div className="space-y-1">
      <div ref={containerRef} className="w-full h-96" />
      {/*
      {hover && (
        <div className="text-xs text-center text-white">
          H: {hover.high} L: {hover.low}
        </div>
      )}
      */}
    </div>
  );
}
