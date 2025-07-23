"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "../components/dashboard/dashboard-header"
import { PortfolioOverview } from "../components/dashboard/portfolio-overview"
import { TradingStrategies } from "../components/dashboard/trading-strategies"
import { RecentTrades } from "../components/dashboard/recent-trades"
import { PerformanceChart } from "../components/dashboard/performance-chart"
import { useAuth } from "../context/AuthContext"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user!} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Trading Dashboard</h1>
          <p className="text-gray-600">Bybit API 기반 자동매매 현황을 확인하세요</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">포트폴리오</TabsTrigger>
            <TabsTrigger value="strategies">AI 전략</TabsTrigger>
            <TabsTrigger value="trades">거래 내역</TabsTrigger>
            <TabsTrigger value="performance">수익률 분석</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PortfolioOverview />
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            <TradingStrategies />
          </TabsContent>

          <TabsContent value="trades" className="space-y-6">
            <RecentTrades />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceChart />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
