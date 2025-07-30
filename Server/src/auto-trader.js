const Database = require('better-sqlite3');
const { RestClientV5 } = require('bybit-api');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const db = new Database('auto-trading.db');

db.prepare(`CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apiKey TEXT NOT NULL,
  apiSecret TEXT NOT NULL,
  testnet INTEGER DEFAULT 1
)` ).run();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/users', (req,res)=>{
  const { apiKey, apiSecret, testnet } = req.body;
  if(!apiKey || !apiSecret) return res.status(400).json({error:'apiKey and apiSecret required'});
  db.prepare('INSERT INTO users(apiKey,apiSecret,testnet) VALUES(?,?,?)').run(apiKey, apiSecret, testnet?1:0);
  res.json({success:true});
});

app.get('/users', (req,res)=>{
  const rows = db.prepare('SELECT id, apiKey, testnet FROM users').all();
  res.json(rows);
});

const openAIApiKey = process.env.OPENAI_API_KEY;
if(!openAIApiKey) console.warn('OPENAI_API_KEY not set. GPT analysis will fail');

async function analyzeMarket(ticker){
  const prompt = `추천 포지션을 매수/매도/보류 중 하나로만 답해주세요. 현재 가격은 ${ticker.lastPrice}.`;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      temperature: 0.3,
      messages:[{ role:'user', content: prompt }]
    }, { headers:{ 'Authorization': `Bearer ${openAIApiKey}`,'Content-Type':'application/json'} });
    return response.data.choices?.[0]?.message?.content || '';
  } catch(err){
    console.error('GPT call failed', err.response?.data || err.message);
    return '';
  }
}

async function processUser(user){
  const client = new RestClientV5({ key:user.apiKey, secret:user.apiSecret, testnet:!!user.testnet });
  try {
    const tickerRes = await client.getTickers({ category:'linear', symbol:'BTCUSDT' });
    const ticker = tickerRes.result.list[0];
    const advice = await analyzeMarket(ticker);
    if(!/매수|buy/i.test(advice)) return; // skip if not buy
    const balanceRes = await client.getWalletBalance({ accountType:'UNIFIED' });
    const avail = parseFloat(balanceRes.result.list[0].totalWalletBalance);
    const qty = ((avail * 0.3) / parseFloat(ticker.lastPrice)).toFixed(6);
    await client.submitOrder({ category:'linear', symbol:'BTCUSDT', side:'Buy', orderType:'Market', qty });
    console.log(`User ${user.id}: bought ${qty} BTCUSDT`);
  } catch(err){
    console.error(`Auto trade failed for user ${user.id}`, err.message);
  }
}

function runAutoTrade(){
  const users = db.prepare('SELECT * FROM users').all();
  users.forEach(u=> processUser(u));
}

setInterval(runAutoTrade, 60_000);

const PORT = process.env.AUTO_PORT || 5000;
app.listen(PORT, ()=> console.log(`Auto trading server running on ${PORT}`));
