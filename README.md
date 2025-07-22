# web-gpt-autotrading

Example trading dashboard using Bybit API.

## Setup

Create `.env` with API keys:

```
BYBIT_API_KEY=apikey
BYBIT_API_SECRET=secret
```

Install packages and start server:

```
npm install
npm run dev
```

The React dashboard will fetch klines and balance from the local Express server and allows simple leveraged market orders.
