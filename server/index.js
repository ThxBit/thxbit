const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = 'https://api.bybit.com';
const apiKey = process.env.BYBIT_API_KEY || 'asd';
const apiSecret = process.env.BYBIT_API_SECRET || 'secret';

function getSignature(params) {
  const ordered = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHmac('sha256', apiSecret).update(ordered).digest('hex');
}

async function privateRequest(method, path, params = {}) {
  const timestamp = Date.now();
  const recvWindow = 5000;
  const signParams = { ...params, apiKey, recvWindow, timestamp };
  const sign = getSignature(signParams);
  const query = Object.keys(signParams)
    .map((k) => `${k}=${signParams[k]}`)
    .join('&');
  const url = `${BASE_URL}${path}?${query}&sign=${sign}`;
  const res = await axios({ method, url });
  return res.data;
}

app.get('/api/klines', async (req, res) => {
  try {
    const { interval = '1', limit = 200 } = req.query;
    const url = `${BASE_URL}/v5/market/kline?symbol=BTCUSDT&interval=${interval}&limit=${limit}`;
    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/balance', async (req, res) => {
  try {
    const data = await privateRequest('GET', '/v5/account/wallet-balance');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    const { qty, leverage } = req.body;
    const side = leverage > 0 ? 'Buy' : 'Sell';
    const absLev = Math.abs(leverage);
    const params = {
      category: 'linear',
      symbol: 'BTCUSDT',
      side,
      orderType: 'Market',
      qty,
      leverage: absLev,
    };
    const data = await privateRequest('POST', '/v5/order/create', params);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
