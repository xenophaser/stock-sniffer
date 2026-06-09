import { useState, useEffect } from 'react'

const API_KEY = 'ysEDLZnfWfumXeBVa91YMtV2UWtY5e4T6IJyvnZV'
const WATCHLIST = ['AAPL', 'NVDA', 'META', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'PLTR', 'SMCI', 'JPM']

const SAMPLE = [
  { company: 'Apple Inc.', ticker: 'AAPL', insider: 'Tim Cook', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 50000, price: 211.45, totalValue: 10572500, date: '2026-06-06' },
  { company: 'NVIDIA Corp.', ticker: 'NVDA', insider: 'Jensen Huang', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 120000, price: 134.22, totalValue: 16106400, date: '2026-06-06' },
  { company: 'Palantir Technologies', ticker: 'PLTR', insider: 'Alexander Karp', role: 'CEO', transactionCode: 'P', signal: 'buy', shares: 250000, price: 28.43, totalValue: 7107500, date: '2026-06-05' },
  { company: 'Super Micro Computer', ticker: 'SMCI', insider: 'Charles Liang', role: 'CEO', transactionCode: 'P', signal: 'buy', shares: 100000, price: 42.18, totalValue: 4218000, date: '2026-06-05' },
  { company: 'Rocket Companies', ticker: 'RKT', insider: 'Jay Farner', role: 'Director', transactionCode: 'P', signal: 'buy', shares: 500000, price: 12.34, totalValue: 6170000, date: '2026-06-04' },
  { company: 'Meta Platforms', ticker: 'META', insider: 'Mark Zuckerberg', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 75000, price: 632.10, totalValue: 47407500, date: '2026-06-04' },
]

export default function InsiderTab() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.all(WATCHLIST.map(async ticker => {
          const [r1, r2] = await Promise.all([
            fetch(`https://api.api-ninjas.com/v1/insidertrading?ticker=${ticker}&transaction_code=P&limit=2`, { headers: { 'X-Api-Key': API_KEY } }),
            fetch(`https://api.api-ninjas.com/v1/insidertrading?ticker=${ticker}&transaction_code=S&limit=2`, { headers: { 'X-Api-Key': API_KEY } }),
          ])
          const buys = r1.ok ? await r1.json() : []
          const sells = r2.ok ? await r2.json() : []
          return [...buys, ...sells].map(t => ({
            company: t.company_name || ticker,
            ticker: t.ticker || ticker,
            insider: t.name || '—',
            role: t.position || '—',
            transactionCode: t.transaction_code || '—',
            signal: t.transaction_code === 'P' ? 'buy' : 'sell',
            shares: t.shares || null,
            price: t.price || null,
            totalValue: t.total_value || null,
            date: t.transaction_date || '—',
          }))
        }))

        const flat = results.flat().filter(t => t.signal === 'buy' || t.signal === 'sell')
        flat.sort((a, b) => b.date.localeCompare(a.date))

        if (flat.length === 0) throw new Error('No data')
        setTransactions(flat.slice(0, 20))
      } catch {
        setFallback(true)
        setTransactions(SAMPLE)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="loading-msg">Fetching live insider trades from SEC Form 4...</div>

  const buys = transactions.filter(t => t.signal === 'buy')
  const sells = transactions.filter(t => t.signal === 'sell')

  function fmt(n) { if (!n) return '—'; return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }) }
  function fmtShares(n) { if (!n) return '—'; return Number(n).toLocaleString() }
  function fmtTotal(n) { if (!n) return '—'; if (n >= 1000000) return '$' + (n/1000000).toFixed(2) + 'M'; if (n >= 1000) return '$' + (n/1000).toFixed(0) + 'K'; return '$' + Number(n).toLocaleString() }

  return (
    <div>
      <div className="info-bar">
        <span>SEC Form 4 — Open market buys (P) and sells (S) · Watchlist: top 10 stocks</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99 }}>🐂 {buys.length} buys</span>
          <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99 }}>🐻 {sells.length} sells</span>
          {fallback && <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99 }}>Sample data</span>}
        </div>
      </div>
      {fallback && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', fontSize: 13, marginBottom: '1rem' }}>
          ⚠️ Using sample data — API request failed.
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Signal</th><th>Ticker</th><th>Company</th><th>Insider</th><th>Role</th><th>Shares</th><th>Price</th><th>Total Value</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => {
              const isBuy = t.signal === 'buy'
              const isSell = t.signal === 'sell'
              return (
                <tr key={i}>
                  <td>
                    {isBuy && <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>▲ BUY</span>}
                    {isSell && <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>▼ SELL</span>}
                  </td>
                  <td><span style={{ fontWeight: 700, fontSize: 14, color: isBuy ? '#4ade80' : '#f87171' }}>{t.ticker}</span></td>
                  <td style={{ fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.company}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{t.insider}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{t.role}</td>
                  <td style={{ fontSize: 13, textAlign: 'right' }}>{fmtShares(t.shares)}</td>
                  <td style={{ fontSize: 13, textAlign: 'right' }}>{fmt(t.price)}</td>
                  <td style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', color: isBuy ? '#4ade80' : '#f87171' }}>{fmtTotal(t.totalValue)}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{t.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: '1rem' }}>
        P = open market purchase · S = open market sale · Source: API Ninjas / SEC EDGAR
      </p>
    </div>
  )
}
