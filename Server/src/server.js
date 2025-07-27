require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { RestClientV5 } = require('bybit-api');

const app = express();
app.use(cors());
app.use(express.json());

const restClient = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
  testnet: process.env.BYBIT_TESTNET === 'true',
});

app.get('/api/klines', async (req, res) => {
  try {
    const {
      symbol = 'BTCUSDT',
      interval = '1',
      limit = '200',
      category = 'linear',
    } = req.query;
    const result = await restClient.getKline({
      category,
      symbol,
      interval: interval.toString(),
      limit: parseInt(limit, 10),
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching klines:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/balance', async (req, res) => {
  try {
    const result = await restClient.getWalletBalance({ accountType: 'UNIFIED' });
    res.json(result);
  } catch (err) {
    console.error('Error fetching balance:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/positions', async (req, res) => {
  try {
    const result = await restClient.getPositionInfo({ category: 'linear' });
    res.json(result);
  } catch (err) {
    console.error('Error fetching positions:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    const { symbol, side, orderType = 'Market', qty, price, leverage, positionIdx } = req.body;

    if (leverage) {
      await restClient.setLeverage({
        category: 'linear',
        symbol,
        buyLeverage: leverage.toString(),
        sellLeverage: leverage.toString(),
      });
    }

    const result = await restClient.submitOrder({
      category: 'linear',
      symbol,
      side,
      orderType,
      qty: qty.toString(),
      price,
      positionIdx: positionIdx ?? 0,
    });
    res.json(result);
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
