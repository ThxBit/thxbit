# web-gpt-autotrading

Example trading dashboard using Bybit API.

## Setup

Create `.env` with API keys for both the server and the client:

```
BYBIT_API_KEY=apikey
BYBIT_API_SECRET=secret
NEXT_PUBLIC_BYBIT_API_KEY=apikey
NEXT_PUBLIC_BYBIT_API_SECRET=secret
NEXT_PUBLIC_BYBIT_TESTNET=true
REDIS_URL=redis://localhost:6379
SYMBOLS=BTCUSDT,ETHUSDT,SOLUSDT,ADAUSDT
```

The `SYMBOLS` variable configures a comma-separated list of market
symbols that the server will seed at startup and keep updated in Redis.

Install packages and start server:

```
npm install
npm run dev
```

The React dashboard will fetch klines and balance from the local Express server and allows simple leveraged market orders.

The server now caches market data in Redis. On startup it seeds recent 1 minute candles from Bybit, streams live updates via WebSocket and exposes `GET /api/ohlcv` and `GET /api/price` endpoints for the client to consume.
