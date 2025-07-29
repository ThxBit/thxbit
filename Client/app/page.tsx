"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_TRADING_SERVER || ''
        const res = await fetch(`${base}/api/user`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setUser({ name: data.name, email: data.email })
          setIsLoggedIn(true)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchUser()
  }, [])

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_TRADING_SERVER || ''
      await fetch(`${base}/auth/logout`, { credentials: 'include' })
    } finally {
      setUser(null)
      setIsLoggedIn(false)
    }
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
