# web-gpt-autotrading

Example trading dashboard using Bybit API.

## Setup

Create `.env` in the project root with API keys for both the server and the client.
The client configuration reads this file automatically:

```
BYBIT_API_KEY=apikey
BYBIT_API_SECRET=secret
NEXT_PUBLIC_BYBIT_API_KEY=apikey
NEXT_PUBLIC_BYBIT_API_SECRET=secret
# Set to "true" to use Bybit testnet, otherwise "false" for mainnet
NEXT_PUBLIC_BYBIT_TESTNET=false
```

Install packages and start server:

```
npm install
npm run dev
```

The React dashboard will fetch klines and balance from the local Express server and allows simple leveraged market orders.
