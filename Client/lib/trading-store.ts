"use client"

import { create } from "zustand"
import { bybitService } from "./bybit-client"

interface TradingState {
  // API Configuration
  apiKey: string
  apiSecret: string
  isTestnet: boolean
  isSimulationMode: boolean

  // Market Data
  tickers: Record<string, any>
  orderbooks: Record<string, any>

  // Account Data
  balance: any
  positions: any[]
  orders: any[]

  // UI State
  selectedSymbol: string
  isConnected: boolean
  error: string | null

  // Actions
  setApiCredentials: (apiKey: string, apiSecret: string) => void
  toggleSimulationMode: () => void
  setSelectedSymbol: (symbol: string) => void
  updateTicker: (symbol: string, data: any) => void
  updateOrderbook: (symbol: string, data: any) => void
  refreshAccountData: () => Promise<void>
  placeOrder: (orderParams: any) => Promise<any>
  setError: (error: string | null) => void
}

export const useTradingStore = create<TradingState>((set, get) => ({
  // Initial state
  apiKey: "",
  apiSecret: "",
  isTestnet: true,
  isSimulationMode: true,
  tickers: {},
  orderbooks: {},
  balance: null,
  positions: [],
  orders: [],
  selectedSymbol: "BTCUSDT",
  isConnected: false,
  error: null,

  // Actions
  setApiCredentials: (apiKey: string, apiSecret: string) => {
    set({ apiKey, apiSecret })
    bybitService.setCredentials(apiKey, apiSecret, get().isTestnet)
  },

  toggleSimulationMode: () => {
    const newMode = !get().isSimulationMode
    set({ isSimulationMode: newMode })
    bybitService.setSimulationMode(newMode)
  },

  setSelectedSymbol: (symbol: string) => {
    set({ selectedSymbol: symbol })
  },

  updateTicker: (symbol: string, data: any) => {
    set((state) => ({
      tickers: { ...state.tickers, [symbol]: data },
    }))
  },

  updateOrderbook: (symbol: string, data: any) => {
    set((state) => ({
      orderbooks: { ...state.orderbooks, [symbol]: data },
    }))
  },

  refreshAccountData: async () => {
    try {
      const [balance, positions] = await Promise.all([bybitService.getAccountBalance(), bybitService.getPositions()])

      set({ balance, positions, error: null })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  },

  placeOrder: async (orderParams: any) => {
    try {
      const result = await bybitService.placeOrder(orderParams)
      get().refreshAccountData() // Refresh after order
      return result
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Order failed" })
      throw error
    }
  },

  setError: (error: string | null) => {
    set({ error })
  },
}))
