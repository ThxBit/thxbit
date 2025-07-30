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
```

Install packages and start server:

```
npm install
npm run dev
```

The React dashboard will fetch klines and balance from the local Express server and allows simple leveraged market orders.

### MySQL setup

The auto trading service requires a MySQL database. Initialize it with:

```bash
mysql -u root -p < Server/db/init.sql
```

Configure `DB_HOST`, `DB_USER`, `DB_PASS` and `DB_NAME` in `.env` so `src/auto-trader.js` can connect.
