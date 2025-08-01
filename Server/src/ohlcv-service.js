const axios = require('axios');
const { WebsocketClient } = require('bybit-api');
const { redis } = require('./redis-client');

class OhlcvService {
  constructor(symbol) {
    if (!symbol) {
      throw new Error('symbol is required');
    }
    this.symbol = symbol;
    this.ws = null;
    this.minuteKey = `ohlcv:${symbol}:1m`;
    this.hourKey = `ohlcv:${symbol}:1h`;
  }

  async init() {
    await this.loadHistorical();
    this.startWebsocket();
  }

  async loadHistorical(limit = 1000) {
    const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${this.symbol}&interval=1&limit=${limit}`;
    const { data } = await axios.get(url);
    const list = (data?.result?.list || []).sort(
      (a, b) => Number(a.start || a.t || a[0]) - Number(b.start || b.t || b[0]),
    );

    let last = null;
    for (const kline of list) {
      const candle = this.mapKline(kline);
      await redis.rPush(this.minuteKey, JSON.stringify(candle));
      last = candle;
    }
    // ensure list size
    await redis.lTrim(this.minuteKey, -10000, -1);
    if (last) {
      await redis.set(`price:${this.symbol}`, last.c.toString());
    }
  }

  mapKline(k) {
    return {
      t: Number(k.start || k.t || k[0]),
      o: Number(k.open || k.o || k[1]),
      h: Number(k.high || k.h || k[2]),
      l: Number(k.low || k.l || k[3]),
      c: Number(k.close || k.c || k[4]),
      v: Number(k.volume || k.v || k[5]),
    };
  }

  startWebsocket() {
    this.ws = new WebsocketClient({});
    this.ws.on('update', (data) => this.handleWs(data));
    this.ws.subscribeV5(`kline.1.${this.symbol}`, 'linear');
  }

  async handleWs(data) {
    if (!data?.topic?.startsWith('kline.1.')) return;
    const kline = data.data[0];
    const candle = this.mapKline(kline);
    const lastStr = await redis.lIndex(this.minuteKey, -1);
    if (lastStr) {
      const last = JSON.parse(lastStr);
      if (last.t === candle.t) {
        await redis.lSet(this.minuteKey, -1, JSON.stringify(candle));
      } else {
        await redis.rPush(this.minuteKey, JSON.stringify(candle));
        await redis.lTrim(this.minuteKey, -10000, -1);
        await this.compressHour();
      }
    } else {
      await redis.rPush(this.minuteKey, JSON.stringify(candle));
      await this.compressHour();
    }
    await redis.set(`price:${this.symbol}`, candle.c.toString());
  }

  async compressHour() {
    const candles = await redis.lRange(this.minuteKey, -60, -1);
    if (candles.length < 60) return;
    const parsed = candles.map((c) => JSON.parse(c));
    const first = parsed[0];
    const last = parsed[parsed.length - 1];
    const hour = {
      t: first.t,
      o: first.o,
      h: Math.max(...parsed.map((c) => c.h)),
      l: Math.min(...parsed.map((c) => c.l)),
      c: last.c,
      v: parsed.reduce((acc, c) => acc + c.v, 0),
    };
    const lastHourStr = await redis.lIndex(this.hourKey, -1);
    if (lastHourStr) {
      const lastHour = JSON.parse(lastHourStr);
      if (lastHour.t === hour.t) {
        await redis.lSet(this.hourKey, -1, JSON.stringify(hour));
        return;
      }
    }
    await redis.rPush(this.hourKey, JSON.stringify(hour));
    await redis.lTrim(this.hourKey, -10000, -1);
  }

  async getOhlcv(interval = '1m', limit = 200) {
    const key = interval === '1h' ? this.hourKey : this.minuteKey;
    const data = await redis.lRange(key, -limit, -1);
    return data.map((d) => JSON.parse(d));
  }
}

module.exports = { OhlcvService };
