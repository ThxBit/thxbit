"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTradingStore } from "@/lib/trading-store"
import { TrendingUp, TrendingDown, Edit, X, AlertTriangle } from "lucide-react"

interface Position {
  symbol: string
  side: string
  size: string
  entryPrice: string
  markPrice: string
  leverage: string
  unrealisedPnl: string
  positionValue: string
  positionIdx: number
}

export function EnhancedPositionManager() {
  const { positions, isSimulationMode, refreshAccountData } = useTradingStore()
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [newStopLoss, setNewStopLoss] = useState("")
  const [newTakeProfit, setNewTakeProfit] = useState("")
  const [isClosing, setIsClosing] = useState<string | null>(null)

  useEffect(() => {
    // Refresh positions data periodically
    const interval = setInterval(() => {
      refreshAccountData()
    }, 5000)

    return () => clearInterval(interval)
  }, [refreshAccountData])

  const handleClosePosition = async (position: Position) => {
    setIsClosing(position.symbol)

    try {
      // Simulate position closing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Refresh data after closing
      await refreshAccountData()
    } catch (error) {
      console.error("Failed to close position:", error)
    } finally {
      setIsClosing(null)
    }
  }

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position)
    setNewStopLoss("")
    setNewTakeProfit("")
  }

  const handleUpdatePosition = async () => {
    if (editingPosition) {
      try {
        // Simulate position update
        console.log("포지션 업데이트:", {
          symbol: editingPosition.symbol,
          stopLoss: newStopLoss,
          takeProfit: newTakeProfit,
        })

        setEditingPosition(null)
        await refreshAccountData()
      } catch (error) {
        console.error("Failed to update position:", error)
      }
    }
  }

  const calculatePnLPercent = (position: Position) => {
    const entryPrice = Number.parseFloat(position.entryPrice)
    const markPrice = Number.parseFloat(position.markPrice)
    const side = position.side.toLowerCase()

    if (side === "buy") {
      return ((markPrice - entryPrice) / entryPrice) * 100
    } else {
      return ((entryPrice - markPrice) / entryPrice) * 100
    }
  }

  const totalUnrealizedPnL = positions.reduce((sum, pos) => {
    return sum + Number.parseFloat(pos.unrealisedPnl || "0")
  }, 0)

  const totalPositionValue = positions.reduce((sum, pos) => {
    return sum + Number.parseFloat(pos.positionValue || "0")
  }, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              보유 포지션
              <Badge variant={isSimulationMode ? "secondary" : "default"}>
                {isSimulationMode ? "시뮬레이션" : "실제"}
              </Badge>
            </CardTitle>
            <CardDescription>현재 보유 중인 포지션을 실시간으로 관리하세요</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">총 미실현 손익</div>
            <div className={`text-lg font-bold ${totalUnrealizedPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalUnrealizedPnL >= 0 ? "+" : ""}${totalUnrealizedPnL.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">보유 중인 포지션이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">총 포지션</div>
                <div className="font-semibold">{positions.length}개</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">총 포지션 가치</div>
                <div className="font-semibold">${totalPositionValue.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">총 손익률</div>
                <div className={`font-semibold ${totalUnrealizedPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalPositionValue > 0 ? ((totalUnrealizedPnL / totalPositionValue) * 100).toFixed(2) : "0.00"}%
                </div>
              </div>
            </div>

            {/* Positions Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>심볼</TableHead>
                  <TableHead>방향</TableHead>
                  <TableHead>수량</TableHead>
                  <TableHead>진입가</TableHead>
                  <TableHead>현재가</TableHead>
                  <TableHead>레버리지</TableHead>
                  <TableHead>미실현 손익</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position, index) => {
                  const pnl = Number.parseFloat(position.unrealisedPnl || "0")
                  const pnlPercent = calculatePnLPercent(position)

                  return (
                    <TableRow key={`${position.symbol}-${index}`}>
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={position.side === "Buy" ? "default" : "destructive"}>
                          {position.side === "Buy" ? "롱" : "숏"}
                        </Badge>
                      </TableCell>
                      <TableCell>{Number.parseFloat(position.size).toFixed(4)}</TableCell>
                      <TableCell>${Number.parseFloat(position.entryPrice).toFixed(2)}</TableCell>
                      <TableCell>${Number.parseFloat(position.markPrice).toFixed(2)}</TableCell>
                      <TableCell>{position.leverage}x</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {pnl >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <div className={pnl >= 0 ? "text-green-600" : "text-red-600"}>
                            <div className="font-medium">
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                            </div>
                            <div className="text-xs">
                              ({pnlPercent >= 0 ? "+" : ""}
                              {pnlPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleClosePosition(position)}
                            disabled={isClosing === position.symbol}
                          >
                            {isClosing === position.symbol ? (
                              "청산중..."
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                청산
                              </>
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => handleEditPosition(position)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>포지션 수정</DialogTitle>
                                <DialogDescription>
                                  {position.symbol} {position.side === "Buy" ? "롱" : "숏"} 포지션 설정
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                  <div>
                                    <div className="text-sm text-muted-foreground">현재 수량</div>
                                    <div className="font-medium">{Number.parseFloat(position.size).toFixed(4)}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">진입가</div>
                                    <div className="font-medium">
                                      ${Number.parseFloat(position.entryPrice).toFixed(2)}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>손절가 (Stop Loss)</Label>
                                  <Input
                                    type="number"
                                    placeholder="손절가 입력"
                                    value={newStopLoss}
                                    onChange={(e) => setNewStopLoss(e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>익절가 (Take Profit)</Label>
                                  <Input
                                    type="number"
                                    placeholder="익절가 입력"
                                    value={newTakeProfit}
                                    onChange={(e) => setNewTakeProfit(e.target.value)}
                                  />
                                </div>

                                {Number.parseFloat(position.leverage) > 10 && (
                                  <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                      높은 레버리지 포지션입니다. 리스크 관리에 주의하세요.
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <div className="flex gap-2">
                                  <Button onClick={handleUpdatePosition} className="flex-1">
                                    설정 저장
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleClosePosition(position)}
                                    className="flex-1"
                                  >
                                    포지션 청산
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Risk Warning */}
            {positions.some((pos) => Number.parseFloat(pos.leverage) > 20) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  일부 포지션이 높은 레버리지를 사용하고 있습니다. 시장 변동성에 주의하세요.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
