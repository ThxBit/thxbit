const mysql = require('mysql2/promise');
const { RestClientV5 } = require('bybit-api');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'autotrade'
});

async function initDb(){
  await pool.query(`CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    userNumber INT NOT NULL,
    googleToken VARCHAR(255) NOT NULL,
    apiKey VARCHAR(255) NOT NULL,
    apiSecret VARCHAR(255) NOT NULL,
    testnet TINYINT DEFAULT 1
  )`);
}
initDb();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/users', async (req,res)=>{
  const { userNumber, googleToken, apiKey, apiSecret, testnet } = req.body;
  if(!userNumber || !googleToken || !apiKey || !apiSecret){
    return res.status(400).json({error:'userNumber, googleToken, apiKey and apiSecret required'});
  }
  await pool.query(
    'INSERT INTO users(userNumber, googleToken, apiKey, apiSecret, testnet) VALUES (?,?,?,?,?)',
    [userNumber, googleToken, apiKey, apiSecret, testnet?1:0]
  );
  res.json({success:true});
});

app.get('/users', async (req,res)=>{
  const [rows] = await pool.query('SELECT id, userNumber, googleToken, apiKey, testnet FROM users');
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

async function runAutoTrade(){
  const [users] = await pool.query('SELECT * FROM users');
  users.forEach(u=> processUser(u));
}

setInterval(runAutoTrade, 60_000);

const PORT = process.env.AUTO_PORT || 5000;
app.listen(PORT, ()=> console.log(`Auto trading server running on ${PORT}`));
