"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Pause, Play, Settings } from "lucide-react"

const strategies = [
  {
    id: 1,
    name: "BTC 트렌드 추종",
    status: "active",
    accuracy: 87.5,
    profit: 2340.5,
    trades: 156,
    description: "BTC의 장기 트렌드를 분석하여 매수/매도 신호 생성",
  },
  {
    id: 2,
    name: "ETH 변동성 거래",
    status: "active",
    accuracy: 72.3,
    profit: 1890.2,
    trades: 203,
    description: "ETH의 단기 변동성을 활용한 스캘핑 전략",
  },
  {
    id: 3,
    name: "SOL 모멘텀 전략",
    status: "paused",
    accuracy: 65.8,
    profit: -234.1,
    trades: 89,
    description: "SOL의 모멘텀 지표를 기반으로 한 중기 투자 전략",
  },
]

export function TradingStrategies() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">거래 전략</h2>
          <p className="text-muted-foreground">AI가 추천하는 거래 전략을 관리하세요</p>
        </div>
        <Button>새 전략 추가</Button>
      </div>

      <div className="grid gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {strategy.name}
                    <Badge variant={strategy.status === "active" ? "default" : "secondary"}>
                      {strategy.status === "active" ? "실행중" : "일시정지"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{strategy.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    {strategy.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">정확도</p>
                  <div className="flex items-center gap-2">
                    <Progress value={strategy.accuracy} className="flex-1" />
                    <span className="text-sm font-medium">{strategy.accuracy}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">수익</p>
                  <div className="flex items-center gap-1">
                    {strategy.profit > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-medium ${strategy.profit > 0 ? "text-green-600" : "text-red-600"}`}>
                      ${Math.abs(strategy.profit).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">총 거래</p>
                  <p className="font-medium">{strategy.trades}회</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">상태</p>
                  <p className="font-medium">{strategy.status === "active" ? "활성" : "비활성"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
