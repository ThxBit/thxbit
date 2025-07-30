"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bybitService } from "@/lib/bybit-client";
import { LightweightCandlestickChart, Candle } from "./lightweight-candlestick-chart";

const intervalMap: Record<string, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "1h": "60",
  "1d": "D",
};

const msMap: Record<string, number> = {
  "1m": 60 * 1000,
  "5m": 5 * 60 * 1000,
  "15m": 15 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
};

interface Props {
  symbol: string;
}

export function BasicCandlestickChart({ symbol }: Props) {
  const [timeframe, setTimeframe] = useState("1m");
  const [candles, setCandles] = useState<Candle[]>([]);

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    const fetchData = async () => {
      let start: number | undefined;
      let combined: Candle[] = [];
      for (let i = 0; i < 5; i++) {
        try {
          const list = await bybitService.getKlines({
            symbol,
            interval: intervalMap[timeframe] || "1",
            limit: 200,
            category: "linear",
            start,
          });
          if (!list.length) break;
          list.sort((a: any, b: any) => Number(a[0]) - Number(b[0]));
          const chunk: Candle[] = list.map((k: any) => ({
            time: Number(k[0]) / 1000 as any,
            open: Number(k[1]),
            high: Number(k[2]),
            low: Number(k[3]),
            close: Number(k[4]),
          }));
          combined = [...chunk, ...combined];
          start = Number(list[0][0]) - msMap[timeframe] * 200;
        } catch (err) {
          console.error("Failed to fetch klines", err);
          break;
        }
      }
      if (!cancelled) {
        setCandles(combined);
        unsub = bybitService.subscribeToKlines(
          symbol,
          intervalMap[timeframe] || "1",
          (k) => {
            setCandles((prev) => {
              const ts = k.start < 1e12 ? k.start * 1000 : k.start;
              const newItem: Candle = {
                time: ts / 1000 as any,
                open: k.open,
                high: k.high,
                low: k.low,
                close: k.close,
              };
              const updated = [...prev];
              if (updated.length && updated[updated.length - 1].time === newItem.time) {
                updated[updated.length - 1] = newItem;
              } else {
                updated.push(newItem);
              }
              updated.sort((a, b) => Number(a.time) - Number(b.time));
              return updated.slice(-1000);
            });
          }
        );
      }
    };

    fetchData();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [symbol, timeframe]);

  return (
    <div className="space-y-2">
      <Tabs value={timeframe} onValueChange={setTimeframe} className="mb-2">
        <TabsList>
          <TabsTrigger value="1m">1분</TabsTrigger>
          <TabsTrigger value="5m">5분</TabsTrigger>
          <TabsTrigger value="15m">15분</TabsTrigger>
          <TabsTrigger value="1h">1시간</TabsTrigger>
          <TabsTrigger value="1d">1일</TabsTrigger>
        </TabsList>
      </Tabs>
      <LightweightCandlestickChart data={candles} />
    </div>
  );
}

