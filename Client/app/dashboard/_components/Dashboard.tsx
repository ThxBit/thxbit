"use client";

import { useState } from "react";

import Header from "./Header";
import Main from "./Main";

export function Dashboard() {
  const [totalBalance] = useState(125430.5);
  const [totalProfit] = useState(12543.2);
  const [profitPercentage] = useState(11.2);
  const [activeStrategies] = useState(3);

  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const onLogout = () => setUser(null);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={onLogout} />
      <Main
        totalBalance={totalBalance}
        totalProfit={totalProfit}
        profitPercentage={profitPercentage}
        activeStrategies={activeStrategies}
      />
    </div>
  );
}
