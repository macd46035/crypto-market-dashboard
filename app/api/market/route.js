
export const dynamic = 'force-dynamic'
export async function GET() {
  const results = { timestamp: new Date().toISOString() }
  try {
    const [fngRes, cgRes, binanceRes, coinbaseBtcRes, coinbaseEthRes, upbitRes, fxRes] = await Promise.allSettled([
      fetch('https://api.alternative.me/fng/?limit=1', { cache: 'no-store' }).then(r=>r.json()),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,krw&include_24hr_change=true', { cache: 'no-store' }).then(r=>r.json()),
      fetch('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT"]', { cache: 'no-store' }).then(r=>r.json()),
      fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot').then(r=>r.json()),
      fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot').then(r=>r.json()),
      fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC,KRW-ETH').then(r=>r.json()),
      fetch('https://open.er-api.com/v6/latest/USD').then(r=>r.json()),
    ])

    if (fngRes.status==='fulfilled') results.fng = fngRes.value.data?.[0] || null
    if (cgRes.status==='fulfilled') results.coingecko = cgRes.value
    if (binanceRes.status==='fulfilled') {
      const arr = Array.isArray(binanceRes.value) ? binanceRes.value : []
      results.binance = {
        BTC: parseFloat(arr.find(x=>x.symbol==='BTCUSDT')?.price || '0'),
        ETH: parseFloat(arr.find(x=>x.symbol==='ETHUSDT')?.price || '0')
      }
    }
    if (coinbaseBtcRes.status==='fulfilled') results.coinbaseBTC = parseFloat(coinbaseBtcRes.value?.data?.amount || '0')
    if (coinbaseEthRes.status==='fulfilled') results.coinbaseETH = parseFloat(coinbaseEthRes.value?.data?.amount || '0')
    if (upbitRes.status==='fulfilled' && Array.isArray(upbitRes.value)) {
      results.upbit = {
        BTC: upbitRes.value.find(x=>x.market==='KRW-BTC')?.trade_price || 0,
        ETH: upbitRes.value.find(x=>x.market==='KRW-ETH')?.trade_price || 0
      }
    }
    if (fxRes.status==='fulfilled') results.usdkrw = fxRes.value?.rates?.KRW || 1350
    else results.usdkrw = 1350

    const binanceBtc = results.binance?.BTC || results.coingecko?.bitcoin?.usd || 0
    const upbitBtc = results.upbit?.BTC || results.coingecko?.bitcoin?.krw || 0
    const coinbaseBtc = results.coinbaseBTC || binanceBtc

    if (binanceBtc && results.usdkrw) {
      if (upbitBtc) results.kimchiPremium = (upbitBtc / (binanceBtc * results.usdkrw) - 1) * 100
      results.coinbasePremium = (coinbaseBtc - binanceBtc) / binanceBtc * 100
    }

    return Response.json(results, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    return Response.json({ error: e.message, ...results }, { status: 500 })
  }
}
