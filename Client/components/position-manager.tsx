"use client"

import { useState } from "react"
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
import { TrendingUp, TrendingDown, Edit } from "lucide-react"

interface Position {
  id: string
  symbol: string
  side: "long" | "short"
  size: number
  entryPrice: number
  currentPrice: number
  leverage: number
  pnl: number
  pnlPercent: number
  margin: number
}

const mockPositions: Position[] = [
  {
    id: "1",
    symbol: "BTCUSDT",
    side: "long",
    size: 0.5,
    entryPrice: 43100,
    currentPrice: 43250,
    leverage: 10,
    pnl: 750,
    pnlPercent: 3.48,
    margin: 2155,
  },
  {
    id: "2",
    symbol: "ETHUSDT",
    side: "short",
    size: 2.0,
    entryPrice: 2590,
    currentPrice: 2580,
    leverage: 5,
    pnl: 100,
    pnlPercent: 0.77,
    margin: 1036,
  },
]

export function PositionManager() {
  const [positions, setPositions] = useState<Position[]>(mockPositions)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [newStopLoss, setNewStopLoss] = useState("")
  const [newTakeProfit, setNewTakeProfit] = useState("")

  const handleClosePosition = (positionId: string) => {
    setPositions((prev) => prev.filter((p) => p.id !== positionId))
  }

  const handleMarketClose = (positionId: string) => {
    // 시장가로 즉시 청산
    handleClosePosition(positionId)
  }

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position)
    setNewStopLoss("")
    setNewTakeProfit("")
  }

  const handleUpdatePosition = () => {
    if (editingPosition) {
      // 포지션 업데이트 로직
      console.log("포지션 업데이트:", {
        id: editingPosition.id,
        stopLoss: newStopLoss,
        takeProfit: newTakeProfit,
      })
      setEditingPosition(null)
    }
  }

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0)
  const totalMargin = positions.reduce((sum, pos) => sum + pos.margin, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>보유 포지션</CardTitle>
            <CardDescription>현재 보유 중인 포지션을 관리하세요</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">총 손익</div>
            <div className={`text-lg font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {positions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">보유 중인 포지션이 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {/* 요약 정보 */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">총 포지션</div>
                <div className="font-semibold">{positions.length}개</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">사용 마진</div>
                <div className="font-semibold">${totalMargin.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">총 손익률</div>
                <div className={`font-semibold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {((totalPnL / totalMargin) * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* 포지션 테이블 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>심볼</TableHead>
                  <TableHead>방향</TableHead>
                  <TableHead>수량</TableHead>
                  <TableHead>진입가</TableHead>
                  <TableHead>현재가</TableHead>
                  <TableHead>레버리지</TableHead>
                  <TableHead>손익</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.id}>
                    <TableCell className="font-medium">{position.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={position.side === "long" ? "default" : "destructive"}>
                        {position.side === "long" ? "롱" : "숏"}
                      </Badge>
                    </TableCell>
                    <TableCell>{position.size}</TableCell>
                    <TableCell>${position.entryPrice.toFixed(2)}</TableCell>
                    <TableCell>${position.currentPrice.toFixed(2)}</TableCell>
                    <TableCell>{position.leverage}x</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {position.pnl >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <div className={position.pnl >= 0 ? "text-green-600" : "text-red-600"}>
                          <div className="font-medium">
                            {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                          </div>
                          <div className="text-xs">
                            ({position.pnlPercent >= 0 ? "+" : ""}
                            {position.pnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="destructive" onClick={() => handleMarketClose(position.id)}>
                          즉시매도
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
                                {position.symbol} {position.side === "long" ? "롱" : "숏"} 포지션
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
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
                              <div className="flex gap-2">
                                <Button onClick={handleUpdatePosition} className="flex-1">
                                  수정
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleClosePosition(position.id)}
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
