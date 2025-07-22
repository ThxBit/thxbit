import React, { useEffect, useState } from 'react';
import { Chart, CandlestickController, CategoryScale, LinearScale, TimeScale, Tooltip } from 'chart.js';
import { FinancialChart } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { RSI, BollingerBands } from 'technicalindicators';

Chart.register(CandlestickController, CategoryScale, LinearScale, TimeScale, Tooltip, FinancialChart);

const fetchData = async (interval) => {
  const res = await fetch(`/api/klines?interval=${interval}&limit=200`);
  const data = await res.json();
  return data?.result?.list || [];
};

const TradingDashboard = () => {
  const [balances, setBalances] = useState(null);
  const [klines, setKlines] = useState({ '1': [], '5': [], '15': [] });
  const [chart, setChart] = useState(null);

  useEffect(() => {
    const load = async () => {
      const bal = await fetch('/api/balance').then((r) => r.json());
      setBalances(bal);
      const k1 = await fetchData('1');
      const k5 = await fetchData('5');
      const k15 = await fetchData('15');
      setKlines({ '1': k1, '5': k5, '15': k15 });
    };
    load();
  }, []);

  useEffect(() => {
    if (!klines['1'].length || chart) return;
    const ctx = document.getElementById('chart').getContext('2d');
    const candleData = klines['1'].map((k) => ({
      x: k[0] * 1000,
      o: parseFloat(k[1]),
      h: parseFloat(k[2]),
      l: parseFloat(k[3]),
      c: parseFloat(k[4]),
    }));
    const closes = candleData.map((c) => c.c);
    const rsi = RSI.calculate({ values: closes, period: 14 });
    const bb = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 });

    const newChart = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: 'BTCUSDT',
            data: candleData,
          },
        ],
      },
    });
    setChart(newChart);
    console.log('RSI', rsi[rsi.length - 1], 'BB', bb[bb.length - 1]);
  }, [klines, chart]);

  const handleOrder = async (leverage) => {
    await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty: 0.001, leverage }),
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Bybit Trading Dashboard</h1>
      <div className="mb-2">Balance: {JSON.stringify(balances)}</div>
      <canvas id="chart" height="300"></canvas>
      <div className="mt-4">
        <button className="px-4 py-2 bg-green-500 text-white mr-2" onClick={() => handleOrder(1)}>Buy x1</button>
        <button className="px-4 py-2 bg-red-500 text-white" onClick={() => handleOrder(-1)}>Sell x1</button>
      </div>
    </div>
  );
};

export default TradingDashboard;
