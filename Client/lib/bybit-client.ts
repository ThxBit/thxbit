"use client"

import { RestClientV5, WebsocketClient } from "bybit-api"

const SERVER_URL =
  process.env.NEXT_PUBLIC_TRADING_SERVER || "http://localhost:4000"

export interface BybitConfig {
  apiKey?: string
  apiSecret?: string
  testnet?: boolean
  simulationMode?: boolean
}

export class BybitService {
  private restClient: RestClientV5 | null = null
  private wsClient: WebsocketClient | null = null
  private config: BybitConfig
  private isSimulation: boolean

  constructor(config: BybitConfig = {}) {
    this.config = {
      apiKey: process.env.NEXT_PUBLIC_BYBIT_API_KEY || config.apiKey,
      apiSecret: process.env.NEXT_PUBLIC_BYBIT_API_SECRET || config.apiSecret,
      testnet:
        config.testnet ?? (process.env.NEXT_PUBLIC_BYBIT_TESTNET === 'true'),
      simulationMode: config.simulationMode,
    }
    console.log("test"+config.testnet);
    this.isSimulation = this.config.simulationMode ?? false

    if (!this.isSimulation && this.config.apiKey && this.config.apiSecret) {
      this.initializeClients()
    }
  }

  /** Update API credentials and reinitialize clients if not in simulation mode */
  setCredentials(apiKey: string, apiSecret: string, testnet = false) {
    this.config = {
      ...this.config,
      apiKey,
      apiSecret,
      testnet,
    }
    console.log("testNet " + testnet);
    if (!this.isSimulation) {
      this.initializeClients()
    }
  }

  /** Validate that the provided credentials can make authenticated requests */
  async validateCredentials(apiKey: string, apiSecret: string, testnet = false) {
    try {
      const res = await fetch(`${SERVER_URL}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiSecret, testnet }),
      })
      const data = await res.json()
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Invalid credentials')
      }
      return true
    } catch (err) {
      console.error('API credential validation failed:', err)
      throw err
    }
  }

  private initializeClients() {
    try {
      // Clean up previous clients if they exist
      if (this.wsClient) {
        try {
          this.wsClient.closeAll?.()
        } catch (e) {
          console.warn("Failed to close existing websocket client", e)
        }
      }

      this.restClient = new RestClientV5({
        key: this.config.apiKey,
        secret: this.config.apiSecret,
        testnet: this.config.testnet ?? true,
      })

      this.wsClient = new WebsocketClient({
        key: this.config.apiKey,
        secret: this.config.apiSecret,
        testnet: this.config.testnet ?? true,
        market: "v5",
      })
    } catch (error) {
      console.error("Failed to initialize Bybit clients:", error)
    }
  }

  async getAccountBalance() {
    if (this.isSimulation) {
      return this.getSimulatedBalance()
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/balance`)
      if (!res.ok) {
        const message = await res.text()
        throw new Error(`Server error ${res.status}: ${message}`)
      }
      const data = await res.json()
      return data.result
    } catch (error) {
      console.error("Error fetching account balance:", error)
      throw error
    }
  }

  async getPositions() {
    if (this.isSimulation) {
      return this.getSimulatedPositions()
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/positions`)
      if (!res.ok) {
        const message = await res.text()
        throw new Error(`Server error ${res.status}: ${message}`)
      }
      const data = await res.json()
      return data.result?.list || []
    } catch (error) {
      console.error("Error fetching positions:", error)
      throw error
    }
  }

  async placeOrder(orderParams: {
    symbol: string
    side: "Buy" | "Sell"
    orderType: "Market" | "Limit"
    qty: string
    price?: string
    leverage?: number
    positionIdx?: number
  }) {
    if (this.isSimulation) {
      return this.simulateOrder(orderParams)
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderParams),
      })
      if (!res.ok) {
        const message = await res.text()
        throw new Error(`Server error ${res.status}: ${message}`)
      }
      const data = await res.json()
      return data.result
    } catch (error) {
      console.error("Error placing order:", error)
      throw error
    }
  }

  async cancelOrder(symbol: string, orderId: string) {
    if (this.isSimulation) {
      return { success: true, orderId }
    }

    try {
      if (!this.restClient) throw new Error("REST client not initialized")

      const response = await this.restClient.cancelOrder({
        category: "linear",
        symbol,
        orderId,
      })

      return response.result
    } catch (error) {
      console.error("Error canceling order:", error)
      throw error
    }
  }

  subscribeToTickers(symbols: string[], callback: (data: any) => void) {
    if (this.isSimulation) {
      return this.simulateTickerData(symbols, callback)
    }

    try {
      if (!this.wsClient) {
        this.initializeClients()
        if (!this.wsClient) throw new Error("WebSocket client not initialized")
      }

      this.wsClient.subscribeV5(
        symbols.map((symbol) => `tickers.${symbol}`),
        "linear",
      )

      this.wsClient.on("update", callback)

      return () => {
        this.wsClient?.unsubscribeV5(
          symbols.map((symbol) => `tickers.${symbol}`),
          "linear",
        )
      }
    } catch (error) {
      console.error("Error subscribing to tickers:", error)
      throw error
    }
  }

  subscribeToOrderbook(symbol: string, callback: (data: any) => void) {
    if (this.isSimulation) {
      return this.simulateOrderbookData(symbol, callback)
    }

    try {
      if (!this.wsClient) {
        this.initializeClients()
        if (!this.wsClient) throw new Error("WebSocket client not initialized")
      }

      this.wsClient.subscribeV5([`orderbook.25.${symbol}`], "linear")
      this.wsClient.on("update", callback)

      return () => {
        this.wsClient?.unsubscribeV5([`orderbook.25.${symbol}`], "linear")
      }
    } catch (error) {
      console.error("Error subscribing to orderbook:", error)
      throw error
    }
  }

  // Simulation methods
  private getSimulatedBalance() {
    return {
      totalWalletBalance: "125430.50",
      totalAvailableBalance: "98234.25",
      coin: [
        {
          coin: "USDT",
          walletBalance: "125430.50",
          availableToWithdraw: "98234.25",
        },
      ],
    }
  }

  private getSimulatedPositions() {
    return [
      {
        symbol: "BTCUSDT",
        side: "Buy",
        size: "0.5",
        entryPrice: "43100",
        markPrice: "43250",
        leverage: "10",
        unrealisedPnl: "750",
        positionValue: "21625",
      },
      {
        symbol: "ETHUSDT",
        side: "Sell",
        size: "2.0",
        entryPrice: "2590",
        markPrice: "2580",
        leverage: "5",
        unrealisedPnl: "100",
        positionValue: "5160",
      },
    ]
  }

  private simulateOrder(orderParams: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          orderId: `sim_${Date.now()}`,
          orderLinkId: "",
          symbol: orderParams.symbol,
          side: orderParams.side,
          orderType: orderParams.orderType,
          qty: orderParams.qty,
          price: orderParams.price,
          orderStatus: "Filled",
        })
      }, 500)
    })
  }

  private simulateTickerData(symbols: string[], callback: (data: any) => void) {
    const interval = setInterval(() => {
      symbols.forEach((symbol) => {
        const basePrice =
          symbol === "BTCUSDT" ? 43250 : symbol === "ETHUSDT" ? 2580 : symbol === "SOLUSDT" ? 98.5 : 0.485

        callback({
          topic: `tickers.${symbol}`,
          data: {
            symbol,
            lastPrice: (basePrice * (1 + (Math.random() - 0.5) * 0.002)).toString(),
            price24hPcnt: ((Math.random() - 0.5) * 0.1).toString(),
            volume24h: (Math.random() * 1000000).toString(),
            turnover24h: (Math.random() * 50000000).toString(),
          },
        })
      })
    }, 2000)

    return () => clearInterval(interval)
  }

  private simulateOrderbookData(symbol: string, callback: (data: any) => void) {
    const interval = setInterval(() => {
      const basePrice = symbol === "BTCUSDT" ? 43250 : symbol === "ETHUSDT" ? 2580 : symbol === "SOLUSDT" ? 98.5 : 0.485

      const asks = Array.from({ length: 25 }, (_, i) => [
        (basePrice * (1 + (i + 1) * 0.0001)).toString(),
        (Math.random() * 10).toString(),
      ])

      const bids = Array.from({ length: 25 }, (_, i) => [
        (basePrice * (1 - (i + 1) * 0.0001)).toString(),
        (Math.random() * 10).toString(),
      ])

      callback({
        topic: `orderbook.25.${symbol}`,
        data: {
          s: symbol,
          a: asks,
          b: bids,
          u: Date.now(),
          seq: Date.now(),
        },
      })
    }, 1000)

    return () => clearInterval(interval)
  }

  setSimulationMode(enabled: boolean) {
    this.isSimulation = enabled
    if (!enabled && this.config.apiKey && this.config.apiSecret) {
      this.initializeClients()
    } else if (enabled) {
      // when switching back to simulation, clean up live clients
      try {
        this.wsClient?.closeAll?.()
      } catch (e) {
        console.warn("Failed to close websocket client", e)
      }
      this.wsClient = null
      this.restClient = null
    }
  }

  isSimulationMode() {
    return this.isSimulation
  }
}

// Global instance
export const bybitService = new BybitService()
