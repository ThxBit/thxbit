import React, { useState } from "react";
import { Button } from "../ui/button";

const TradingUI = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [price] = useState(0);
  const [tradeSettings, setTradeSettings] = useState({
    amount: "",
    leverage: "",
  });
  const predictions = [
    {
      date: "2025-06-01",
      coin: "BTC",
      predicted: 40000,
      actual: 41000,
      roi: "2.5%",
    },
    {
      date: "2025-06-02",
      coin: "ETH",
      predicted: 2200,
      actual: 2250,
      roi: "2.3%",
    },
    {
      date: "2025-06-03",
      coin: "SOL",
      predicted: 70,
      actual: 68,
      roi: "-2.9%",
    },
    {
      date: "2025-06-04",
      coin: "XRP",
      predicted: 0.55,
      actual: 0.6,
      roi: "9.1%",
    },
    {
      date: "2025-06-05",
      coin: "DOGE",
      predicted: 0.08,
      actual: 0.081,
      roi: "1.2%",
    },
  ];
  const [trading, setTrading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoggedIn(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTradeSettings((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTrading = () => {
    setTrading((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 text-gray-800">
      {!loggedIn ? (
        <div className="w-full max-w-md space-y-8">
          <form
            onSubmit={handleLogin}
            className="space-y-4 rounded-lg border p-8 shadow"
          >
            <h2 className="text-center text-xl font-bold">로그인</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full rounded border px-3 py-2 focus:outline-none"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full rounded border px-3 py-2 focus:outline-none"
            />
            <Button type="submit" className="w-full">
              시작하기
            </Button>
          </form>
          <div>
            <h3 className="mb-2 text-lg font-semibold">예측 수익률</h3>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1">날짜</th>
                  <th className="px-2 py-1">코인</th>
                  <th className="px-2 py-1">예측가</th>
                  <th className="px-2 py-1">실제가</th>
                  <th className="px-2 py-1">수익률</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr key={p.date} className="odd:bg-gray-50">
                    <td className="px-2 py-1">{p.date}</td>
                    <td className="px-2 py-1">{p.coin}</td>
                    <td className="px-2 py-1 text-right">{p.predicted}</td>
                    <td className="px-2 py-1 text-right">{p.actual}</td>
                    <td className="px-2 py-1 text-right">{p.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">현재 코인 가격</h2>
            <p className="text-4xl">{price} USD</p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">트레이딩 세팅</h3>
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={tradeSettings.amount}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 focus:outline-none"
            />
            <input
              type="number"
              name="leverage"
              placeholder="Leverage"
              value={tradeSettings.leverage}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 focus:outline-none"
            />
          </div>
          <Button onClick={toggleTrading} className="w-full">
            {trading ? "트레이딩 중지" : "트레이딩 시작"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TradingUI;
