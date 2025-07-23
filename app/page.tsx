"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PortfolioOverview } from "@/components/dashboard/portfolio-overview"
import { TradingStrategies } from "@/components/dashboard/trading-strategies"
import { RecentTrades } from "@/components/dashboard/recent-trades"
import { PerformanceChart } from "@/components/dashboard/performance-chart"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 실제 구현에서는 OAuth 토큰 확인
    const checkAuth = async () => {
      try {
        // 임시 사용자 데이터
        setUser({
          name: "John Doe",
          email: "john@example.com",
          avatar: "/placeholder.svg?height=40&width=40",
        })
      } catch (error) {
        // 로그인 페이지로 리다이렉트
        window.location.href = "/login"
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    window.location.href = "/login"
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

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
