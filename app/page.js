
'use client'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid } from 'recharts'

export default function Page() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState('')
  const [selected, setSelected] = useState(null) // {type, title}
  const [chartData, setChartData] = useState(null)
  const [chartLoading, setChartLoading] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/market', { cache: 'no-store' })
      const json = await res.json()
      setData(json)
      setLastUpdate(new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30000)
    return () => clearInterval(id)
  }, [])

  const openChart = async (type, title) => {
    setSelected({ type, title })
    setChartLoading(true)
    setChartData(null)
    try {
      const res = await fetch(`/api/history?type=${type}&days=30`, { cache: 'no-store' })
      const json = await res.json()
      setChartData(json.chart)
    } catch (e) { console.error(e) }
    setChartLoading(false)
  }

  const fng = data?.fng
  const cg = data?.coingecko
  const kimchi = data?.kimchiPremium
  const coinbasePrem = data?.coinbasePremium

  return (
    <main className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Market Data Dashboard <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded ml-2">LIVE</span></h1>
        <div className="text-xs text-gray-400 mono">{lastUpdate} KST {loading ? '• 갱신중...' : '• 30초 갱신'}</div>
      </div>

      <div className="text-xs text-gray-400 mb-3">💡 카드를 클릭하면 차트가 나와요</div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div onClick={()=>openChart('fng','공포탐욕지수 30일')} className="bg-[#151a24] rounded-xl p-4 border border-white/5 cursor-pointer hover:border-green-400/30 hover:bg-[#1a2030] transition group">
          <div className="flex justify-between"><div className="text-xs text-gray-400 mb-1">공포탐욕지수</div><div className="text-xs opacity-0 group-hover:opacity-100 text-green-400">📈 차트</div></div>
          <div className="text-3xl font-bold mono">{fng?.value ?? '--'}</div>
          <div className="text-sm mt-1">{fng?.value_classification ?? 'loading...'}</div>
          <div className="w-full h-2 bg-white/10 rounded mt-3"><div className="h-2 bg-gradient-to-r from-red-500 to-green-500 rounded" style={{width: `${fng?.value ?? 50}%`}} /></div>
        </div>

        <div onClick={()=>openChart('btc','BTC 30일 차트')} className="bg-[#151a24] rounded-xl p-4 border border-white/5 cursor-pointer hover:border-yellow-400/30 hover:bg-[#1a2030] transition group">
          <div className="flex justify-between"><div className="text-xs text-gray-400 mb-1">BTC / USD</div><div className="text-xs opacity-0 group-hover:opacity-100 text-yellow-400">📈 차트</div></div>
          <div className="text-2xl font-bold mono">${cg?.bitcoin?.usd?.toLocaleString() ?? data?.binance?.BTC?.toLocaleString() ?? '--'}</div>
          <div className={`text-xs mt-1 ${ (cg?.bitcoin?.usd_24h_change ?? 0) >=0 ? 'text-green-400' : 'text-red-400'}`}>{cg?.bitcoin?.usd_24h_change?.toFixed(2) ?? '--'}% 24h</div>
          <div className="text-[11px] text-gray-500 mt-2 mono">Binance: ${data?.binance?.BTC?.toLocaleString()}<br/>Coinbase: ${data?.coinbaseBTC?.toLocaleString()}</div>
        </div>

        <div onClick={()=>openChart('kimchi','김치프리미엄 30일')} className="bg-[#151a24] rounded-xl p-4 border border-white/5 cursor-pointer hover:border-purple-400/30 hover:bg-[#1a2030] transition group">
          <div className="flex justify-between"><div className="text-xs text-gray-400 mb-1">김치 프리미엄</div><div className="text-xs opacity-0 group-hover:opacity-100 text-purple-400">📈 차트</div></div>
          <div className={`text-2xl font-bold mono ${ (kimchi ?? 0) >=0 ? 'text-green-400' : 'text-red-400'}`}>{kimchi != null ? `${kimchi.toFixed(2)}%` : '--'}</div>
          <div className="text-[11px] text-gray-500 mt-2 mono">Upbit: {data?.upbit?.BTC?.toLocaleString()} KRW<br/>FX: {data?.usdkrw?.toLocaleString()} KRW/USD</div>
        </div>

        <div onClick={()=>openChart('coinbase','코인베이스 프리미엄 30일')} className="bg-[#151a24] rounded-xl p-4 border border-white/5 cursor-pointer hover:border-blue-400/30 hover:bg-[#1a2030] transition group">
          <div className="flex justify-between"><div className="text-xs text-gray-400 mb-1">코인베이스 프리미엄</div><div className="text-xs opacity-0 group-hover:opacity-100 text-blue-400">📈 차트</div></div>
          <div className={`text-2xl font-bold mono ${ (coinbasePrem ?? 0) >=0 ? 'text-green-400' : 'text-red-400'}`}>{coinbasePrem != null ? `${coinbasePrem.toFixed(3)}%` : '--'}</div>
          <div className="text-[11px] text-gray-500 mt-2">클릭하면 30일 추이</div>
        </div>

        <div onClick={()=>openChart('eth','ETH 30일 차트')} className="bg-[#151a24] rounded-xl p-4 border border-white/5 cursor-pointer hover:border-cyan-400/30 hover:bg-[#1a2030] transition group">
          <div className="flex justify-between"><div className="text-xs text-gray-400 mb-1">ETH / USD</div><div className="text-xs opacity-0 group-hover:opacity-100 text-cyan-400">📈 차트</div></div>
          <div className="text-2xl font-bold mono">${cg?.ethereum?.usd?.toLocaleString() ?? data?.binance?.ETH?.toLocaleString() ?? '--'}</div>
          <div className={`text-xs mt-1 ${ (cg?.ethereum?.usd_24h_change ?? 0) >=0 ? 'text-green-400' : 'text-red-400'}`}>{cg?.ethereum?.usd_24h_change?.toFixed(2) ?? '--'}% 24h</div>
        </div>

        <div className="bg-[#151a24] rounded-xl p-4 border border-white/5">
          <div className="text-xs text-gray-400 mb-1">API 상태</div>
          <div className="text-[11px] mono space-y-1">
            <div>✓ FNG: {fng ? 'LIVE' : '대기'}</div>
            <div>✓ CG: {cg ? 'LIVE' : '대기'}</div>
            <div>✓ Binance: {data?.binance?.BTC ? 'LIVE' : '대기'}</div>
            <div>✓ Upbit: {data?.upbit?.BTC ? 'LIVE' : 'Fallback'}</div>
            <div>✓ Coinbase: {data?.coinbaseBTC ? 'LIVE' : '대기'}</div>
          </div>
        </div>
      </div>

      {/* Chart Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={()=>setSelected(null)}>
          <div className="bg-[#11151f] border border-white/10 rounded-2xl w-full max-w-3xl p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{selected.title}</h2>
              <button onClick={()=>setSelected(null)} className="text-gray-400 hover:text-white text-xl">✕</button>
            </div>
            
            {chartLoading ? (
              <div className="h-[320px] flex items-center justify-center text-gray-400">차트 불러오는 중...</div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {selected.type === 'fng' ? (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2636" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={10} domain={[0,100]} />
                      <Tooltip contentStyle={{background:'#0a0e14', border:'1px solid #1e2636', fontSize:12}} />
                      <Area type="monotone" dataKey="value" stroke="#22c55e" fill="#22c55e33" strokeWidth={2} />
                    </AreaChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2636" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={10} domain={['auto','auto']} tickFormatter={v=> selected.type.includes('kimchi')||selected.type.includes('coinbase') ? `${v}%` : `$${v.toLocaleString()}`} />
                      <Tooltip contentStyle={{background:'#0a0e14', border:'1px solid #1e2636', fontSize:12}} formatter={(v)=> selected.type.includes('kimchi')||selected.type.includes('coinbase') ? [`${v}%`,'Premium'] : [`$${Number(v).toLocaleString()}`, 'Price']} />
                      <Line type="monotone" dataKey="value" stroke={selected.type==='kimchi' ? '#a855f7' : selected.type==='coinbase' ? '#3b82f6' : selected.type==='btc' ? '#facc15' : '#22d3ee'} dot={false} strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 text-[11px] text-gray-500 mono">
              {selected.type === 'fng' && '0=극공포, 100=극탐욕. 30일 추이'}
              {selected.type === 'btc' && 'CoinGecko 30일 BTC 가격'}
              {selected.type === 'eth' && 'CoinGecko 30일 ETH 가격'}
              {selected.type === 'kimchi' && '업비트 - 바이낸스*환율 프리미엄 30일 추이'}
              {selected.type === 'coinbase' && '코인베이스 - 바이낸스 프리미엄 추이'}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-[#151a24] rounded-xl p-4 border border-white/5">
        <div className="text-xs text-gray-400 mb-2">실시간 로그</div>
        <pre className="text-[11px] mono text-gray-300 whitespace-pre-wrap">{JSON.stringify(data, null, 2)?.slice(0, 1500) ?? 'loading...'}</pre>
      </div>
    </main>
  )
}
