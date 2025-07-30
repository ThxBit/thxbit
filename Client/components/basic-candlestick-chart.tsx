"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { bybitService } from "@/lib/bybit-client";
import {
  LightweightCandlestickChart,
  Candle,
} from "./lightweight-candlestick-chart";

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
  const [isAsking, setIsAsking] = useState(false);
  const [gptAnswer, setGptAnswer] = useState<string | null>(null);

  const computeRsi = (data: Candle[]) => {
    if (data.length < 15) return 0;
    let gain = 0;
    let loss = 0;
    for (let i = data.length - 14; i < data.length; i++) {
      const diff = data[i].close - data[i - 1].close;
      if (diff > 0) gain += diff;
      else loss -= diff;
    }
    const avgGain = gain / 14;
    const avgLoss = loss / 14;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  };

  const handleAskGpt = async () => {
    if (candles.length === 0) return;
    setIsAsking(true);
    setGptAnswer(null);
    try {
      const data = candles.slice(-20).map((c) => ({
        timestamp: (c.time as number) * 1000,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      const payload = {
        symbol,
        currentPrice: candles[candles.length - 1].close,
        rsi: computeRsi(candles),
        data,
      };
      const text = await bybitService.getGptAnalysis(payload);
      setGptAnswer(text);
    } catch (err: any) {
      setGptAnswer("오류: " + (err.message || "failed"));
    } finally {
      setIsAsking(false);
    }
  };

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
            time: (Number(k[0]) / 1000) as any,
            open: Number(k[1]),
            high: Number(k[2]),
            low: Number(k[3]),
            close: Number(k[4]),
          }));
          combined = [...chunk, ...combined];
          start = Number(list[0][0]) - msMap[timeframe] * 200 - 1;
        } catch (err) {
          console.error("Failed to fetch klines", err);
          break;
        }
      }
      if (!cancelled) {
        combined.sort((a, b) => Number(a.time) - Number(b.time));
        combined = combined.filter(
          (c, i, arr) => i === 0 || c.time !== arr[i - 1].time,
        );
        setCandles(combined);
        unsub = bybitService.subscribeToKlines(
          symbol,
          intervalMap[timeframe] || "1",
          (k) => {
            setCandles((prev) => {
              const ts = k.start < 1e12 ? k.start * 1000 : k.start;
              const newItem: Candle = {
                time: (ts / 1000) as any,
                open: k.open,
                high: k.high,
                low: k.low,
                close: k.close,
              };
              const updated = [...prev];
              if (
                updated.length &&
                updated[updated.length - 1].time === newItem.time
              ) {
                updated[updated.length - 1] = newItem;
              } else {
                updated.push(newItem);
              }
              updated.sort((a, b) => Number(a.time) - Number(b.time));
              const dedup = updated.filter(
                (c, i, arr) => i === 0 || c.time !== arr[i - 1].time,
              );
              return dedup.slice(-1000);
            });
          },
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
      <div className="flex items-center justify-between mb-2">
        <Tabs value={timeframe} onValueChange={setTimeframe}>
          <TabsList>
            <TabsTrigger value="1m">1분</TabsTrigger>
            <TabsTrigger value="5m">5분</TabsTrigger>
            <TabsTrigger value="15m">15분</TabsTrigger>
            <TabsTrigger value="1h">1시간</TabsTrigger>
            <TabsTrigger value="1d">1일</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAskGpt}
          disabled={isAsking}
        >
          {isAsking ? "분석 중..." : "GPT에 이 코인 물어보기"}
        </Button>
      </div>
      <LightweightCandlestickChart data={candles} />
      {gptAnswer && (
        <Alert>
          <AlertDescription className="whitespace-pre-wrap">
            {gptAnswer}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
