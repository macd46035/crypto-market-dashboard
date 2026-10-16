
export const dynamic = 'force-dynamic'
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'btc' // btc, eth, fng, kimchi, coinbase
  const days = searchParams.get('days') || '30'

  try {
    if (type === 'fng') {
      const res = await fetch(`https://api.alternative.me/fng/?limit=${days}&format=json`, { cache: 'no-store' })
      const data = await res.json()
      const chart = (data.data || []).reverse().map(d => ({ date: new Date(parseInt(d.timestamp)*1000).toLocaleDateString('ko-KR'), value: parseInt(d.value), label: d.value_classification }))
      return Response.json({ type, chart })
    }

    if (type === 'btc' || type === 'eth') {
      const coin = type === 'btc' ? 'bitcoin' : 'ethereum'
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`, { cache: 'no-store' })
      const data = await res.json()
      const chart = (data.prices || []).map(p => ({ date: new Date(p[0]).toLocaleDateString('ko-KR'), value: p[1] }))
      return Response.json({ type, chart })
    }

    if (type === 'kimchi') {
      // Upbit daily candles + Binance klines
      const [upbitRes, binanceRes, fxRes] = await Promise.allSettled([
        fetch(`https://api.upbit.com/v1/candles/days?market=KRW-BTC&count=${days}`, { cache: 'no-store' }).then(r=>r.json()),
        fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=${days}`, { cache: 'no-store' }).then(r=>r.json()),
        fetch('https://open.er-api.com/v6/latest/USD').then(r=>r.json())
      ])
      const usdkrw = fxRes.status==='fulfilled' ? (fxRes.value?.rates?.KRW || 1350) : 1350
      const upbit = upbitRes.status==='fulfilled' && Array.isArray(upbitRes.value) ? upbitRes.value.reverse() : []
      const binance = binanceRes.status==='fulfilled' && Array.isArray(binanceRes.value) ? binanceRes.value : []

      const chart = upbit.map((u, i) => {
        const binClose = binance[i] ? parseFloat(binance[i][4]) : 0
        const upClose = u.trade_price
        let premium = 0
        if (binClose && usdkrw) premium = (upClose / (binClose * usdkrw) - 1) * 100
        return { date: new Date(u.candle_date_time_kst).toLocaleDateString('ko-KR'), value: parseFloat(premium.toFixed(2)), upbit: upClose, binance: binClose }
      })
      return Response.json({ type, chart, usdkrw })
    }

    if (type === 'coinbase') {
      const [binanceRes, coinbaseHistRes] = await Promise.allSettled([
        fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=${days}`, { cache: 'no-store' }).then(r=>r.json()),
        fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`, { cache: 'no-store' }).then(r=>r.json())
      ])
      // approximate coinbase premium history using coingecko as proxy for coinbase, but better use daily close diff
      const binance = binanceRes.status==='fulfilled' && Array.isArray(binanceRes.value) ? binanceRes.value : []
      const cg = coinbaseHistRes.status==='fulfilled' ? coinbaseHistRes.value?.prices || [] : []
      const chart = binance.map((b, i) => {
        const binClose = parseFloat(b[4])
        const cgClose = cg[i] ? cg[i][1] : binClose
        // assume cg ~ coinbase, compute premium
        const premium = binClose ? ((cgClose - binClose)/binClose)*100 : 0
        return { date: new Date(b[0]).toLocaleDateString('ko-KR'), value: parseFloat(premium.toFixed(3)) }
      })
      return Response.json({ type, chart })
    }

    return Response.json({ type, chart: [] })
  } catch (e) {
    return Response.json({ error: e.message, type, chart: [] }, { status: 500 })
  }
}
