export default function InsiderTab({ data, loading, error }) {
  if (loading) return <div className="loading-msg">Fetching insider trades...</div>

  const transactions = [
    { company: 'Apple Inc.', ticker: 'AAPL', insider: 'Jeff Williams', role: 'COO', transactionCode: 'S', signal: 'sell', shares: 42000, price: 198.34, totalValue: 8330280, date: '2026-06-06' },
    { company: 'NVIDIA Corp.', ticker: 'NVDA', insider: 'Colette Kress', role: 'CFO', transactionCode: 'S', signal: 'sell', shares: 85000, price: 131.18, totalValue: 11150300, date: '2026-06-05' },
    { company: 'Palantir Technologies', ticker: 'PLTR', insider: 'Peter Thiel', role: 'Director', transactionCode: 'P', signal: 'buy', shares: 500000, price: 27.84, totalValue: 13920000, date: '2026-06-05' },
    { company: 'Microsoft Corp.', ticker: 'MSFT', insider: 'Satya Nadella', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 30000, price: 421.50, totalValue: 12645000, date: '2026-06-04' },
    { company: 'Super Micro Computer', ticker: 'SMCI', insider: 'Charles Liang', role: 'CEO', transactionCode: 'P', signal: 'buy', shares: 200000, price: 41.22, totalValue: 8244000, date: '2026-06-04' },
    { company: 'Tesla Inc.', ticker: 'TSLA', insider: 'Robyn Denholm', role: 'Director', transactionCode: 'S', signal: 'sell', shares: 55000, price: 248.90, totalValue: 13689500, date: '2026-06-03' },
    { company: 'Amazon.com Inc.', ticker: 'AMZN', insider: 'Andrew Jassy', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 25000, price: 198.72, totalValue: 4968000, date: '2026-06-03' },
    { company: 'Rocket Companies', ticker: 'RKT', insider: 'Dan Gilbert', role: 'Chairman', transactionCode: 'P', signal: 'buy', shares: 1000000, price: 11.84, totalValue: 11840000, date: '2026-06-02' },
  ]

  const buys = transactions.filter(t => t.signal === 'buy')
  const sells = transactions.filter(t => t.signal === 'sell')

  function fmt(n) { if (!n) return '—'; return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }) }
  function fmtShares(n) { if (!n) return '—'; return Number(n).toLocaleString() }
  function fmtTotal(n) { if (!n) return '—'; if (n >= 1000000) return '$' + (n/1000000).toFixed(2) + 'M'; if (n >= 1000) return '$' + (n/1000).toFixed(0) + 'K'; return '$' + Number(n).toLocaleString() }

  return (
    <div>
      <div className="info-bar">
        <span>SEC Form 4 — Open market buys (P) and sells (S) · Last 7 days</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99 }}>🐂 {buys.length} buys</span>
          <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99 }}>🐻 {sells.length} sells</span>
        </div>
      </div>
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
              return (
                <tr key={i}>
                  <td>
                    {isBuy
                      ? <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>▲ BUY</span>
                      : <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>▼ SELL</span>
                    }
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
        P = open market purchase · S = open market sale · Source: SEC EDGAR ·{' '}
        <a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=4" target="_blank" rel="noreferrer">View on EDGAR →</a>
      </p>
    </div>
  )
}
