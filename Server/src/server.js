require('dotenv').config();
const express = require('express');
//const cors = require('cors');
const { RestClientV5 } = require('bybit-api');
const axios = require('axios');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mysql = require('mysql2/promise');

const app = express();
//app.use(cors());

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // 정확한 origin 명시
  credentials: true               // 쿠키 허용
}));

app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM users WHERE google_id = ?',
          [profile.id]
        );
        if (rows.length > 0) {
          return done(null, rows[0]);
        }
        const [result] = await pool.query(
          'INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)',
          [profile.id, profile.displayName, profile.emails[0].value]
        );
        const user = {
          id: result.insertId,
          google_id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        };
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

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
      start,
      end,
    } = req.query;
    const result = await restClient.getKline({
      category,
      symbol,
      interval: interval.toString(),
      limit: parseInt(limit, 10),
      ...(start ? { start: parseInt(start, 10) } : {}),
      ...(end ? { end: parseInt(end, 10) } : {}),
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

app.get('/api/ticker', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', category = 'linear' } = req.query;
    const result = await restClient.getTickers({ category, symbol });
    res.json(result);
  } catch (err) {
    console.error('Error fetching ticker:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orderbook', async (req, res) => {
  try {
    const { symbol = 'BTCUSDT', category = 'linear', limit = 25 } = req.query;
    const result = await restClient.getOrderbook({
      category,
      symbol,
      limit: parseInt(limit, 10),
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching orderbook:', err);
    res.status(500).json({ error: err.message });
  }
});

// Validate API credentials by attempting a private request
// app.post('/api/validate', async (req, res) => {
//   const { apiKey, apiSecret, testnet = false } = req.body;
//   console.log("Sent to server:", { apiKey, apiSecret, testnet });

//   const client = new RestClientV5({ key: apiKey, secret: apiSecret, testnet });
//   try {
//     await client.getWalletBalance({ accountType: 'UNIFIED' });
//     console.log("Calling:", `${SERVER_URL}/api/validate`)

//     console.log('API credentials validated successfully');
//     res.json({ valid: true });
//   } catch (err) {
//     console.log('API credential validation failed:', err.message);
//     res.status(400).json({ valid: false, error: err.message });
//   }
// });
app.post('/api/validate', async (req, res) => {
  const { apiKey, apiSecret, testnet } = req.body;
  const isTestnet = testnet === true || testnet === 'true';

  console.log('Received validate request:', { apiKey, testnet, isTestnet });

  const client = new RestClientV5({
    key: apiKey,
    secret: apiSecret,
    testnet: isTestnet,
  });

  try {
    await client.getWalletBalance({ accountType: 'UNIFIED' });
    console.log('API credentials validated successfully');
    res.json({ valid: true });
  } catch (err) {
    console.log('API credential validation failed:', err.message);
    res.status(400).json({ valid: false, error: err.message });
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

app.post('/api/gpt', async (req, res) => {
  try {
    const coinInfo = req.body;
    const prompt =
      '당신은 고도로 숙련된 트레이더이자 차트 분석 전문가입니다.\n\n' +
      `${JSON.stringify(coinInfo)}\n\n` +
      '모두 RSI 지표, 볼린저밴드, 캔들 패턴이 포함되어 있습니다.\n\n' +
      '### 분석 요청 사항:\n' +
      '1. 현재 시점에서의 최적 포지션을 선택해주세요:\n   - 매수 (Long) / 매도 (Short) / 보류 (No Trade)\n' +
      '2. 선택한 포지션이 적절한 이유를 RSI, 볼린저밴드, 캔들 패턴 기반으로 설명해주세요.\n' +
      '3. 적절한 레버리지 (1x ~ 50x) 를 제안해주세요.\n' +
      '4. 진입 시점 기준:\n   - **익절가와 예상 수익률(%)**\n   - **손절가와 예상 손실률(%)**\n\n' +
      '### 응답 형식 (꼭 아래 구조를 따라주세요):\n---\n📈 **포지션 추천:** 매수 / 매도 / 보류\n🔁 **추천 레버리지:** X배\n🎯 **익절가 및 예상 수익률:** $XX / +XX%\n🛑 **손절가 및 예상 손실률:** $XX / -XX%\n📊 **분석 근거:**\n- RSI 상태 (과매수/과매도 여부)\n- 볼린저밴드 위치 (상단 돌파 / 하단 이탈 등)\n- 캔들 패턴 해석 (반전/지속 가능성)\n- 1분, 5분, 15분봉 간 흐름 일치 여부\n\n모든 수치는 전략적 트레이딩 의사결정 보조용입니다. 정확한 근거 기반 판단만 제시해주세요.';

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        temperature: 0.3,
        messages: [
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const text = response.data.choices?.[0]?.message?.content || '';
    console.log('GPT Response:', text);
    res.json({ text });
  } catch (err) {
    console.error('Error fetching GPT analysis:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch GPT analysis' });
  }
});

// Google OAuth routes
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  }
);

app.get('/auth/logout', (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect(process.env.CLIENT_URL || '/');
  });
});

app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
