"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Chrome, Github, Mail } from "lucide-react"

interface LoginFormProps {
  onLogin: (user: { name: string; email: string }) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleOAuthLogin = (provider: string) => {
    // OAuth 로그인 시뮬레이션
    const mockUser = {
      name: provider === "google" ? "Google User" : "GitHub User",
      email: `user@${provider}.com`,
    }
    onLogin(mockUser)
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      onLogin({ name: "Email User", email })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Trading Bot
          </CardTitle>
          <CardDescription>Bybit API 기반 자동매매 서비스에 로그인하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth 로그인 버튼들 */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full bg-transparent" onClick={() => handleOAuthLogin("google")}>
              <Chrome className="mr-2 h-4 w-4" />
              Google로 계속하기
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={() => handleOAuthLogin("github")}>
              <Github className="mr-2 h-4 w-4" />
              GitHub로 계속하기
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              이메일로 로그인
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            계정이 없으신가요?{" "}
            <Button variant="link" className="p-0 h-auto font-normal">
              회원가입
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
