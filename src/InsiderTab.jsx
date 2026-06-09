export default function InsiderTab({ data, loading, error }) {
  if (loading) return <div className="loading-msg">Fetching SEC Form 4 filings & parsing transactions...</div>
  if (error) return <div className="error-msg">Error: {error}</div>

  const transactions = data?.transactions || []
  const isFallback = data?.fallback

  if (transactions.length === 0) return <div className="loading-msg">No buy/sell transactions found in recent filings.</div>

  const buys = transactions.filter(t => t.signal === 'buy')
  const sells = transactions.filter(t => t.signal === 'sell')

  function fmt(n) { if (!n) return '—'; return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 }) }
  function fmtShares(n) { if (!n) return '—'; return n.toLocaleString() }
  function fmtTotal(n) { if (!n) return '—'; if (n >= 1000000) return '$' + (n/1000000).toFixed(2) + 'M'; if (n >= 1000) return '$' + (n/1000).toFixed(0) + 'K'; return '$' + n.toLocaleString() }

  return (
    <div>
      <div className="info-bar">
        <span>SEC Form 4 — Open market buys (P) and sells (S) only · Last 3 days</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99 }}>🐂 {buys.length} buys</span>
          <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99 }}>🐻 {sells.length} sells</span>
          {isFallback && <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99 }}>Sample data</span>}
        </div>
      </div>
      {isFallback && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', fontSize: 13, marginBottom: '1rem' }}>
          ⚠️ Using sample data — SEC EDGAR XML parsing may have timed out. Real data pulls live from EDGAR Form 4 filings.
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Signal</th>
              <th>Ticker</th>
              <th>Company</th>
              <th>Insider</th>
              <th>Role</th>
              <th>Shares</th>
              <th>Price</th>
              <th>Total Value</th>
              <th>Date</th>
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
                    {!isBuy && !isSell && <span style={{ color: 'var(--muted)', fontSize: 12 }}>{t.transactionCode || '—'}</span>}
                  </td>
                  <td><span style={{ fontWeight: 700, fontSize: 14, color: isBuy ? '#4ade80' : isSell ? '#f87171' : 'var(--text)' }}>{t.ticker || '—'}</span></td>
                  <td style={{ fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.company || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{t.insider || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{t.role || '—'}</td>
                  <td style={{ fontSize: 13, textAlign: 'right' }}>{fmtShares(t.shares)}</td>
                  <td style={{ fontSize: 13, textAlign: 'right' }}>{fmt(t.price)}</td>
                  <td style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', color: isBuy ? '#4ade80' : isSell ? '#f87171' : 'var(--text)' }}>{fmtTotal(t.totalValue)}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{t.date || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: '1rem' }}>
        P = open market purchase · S = open market sale · Source: SEC EDGAR Form 4 ·{' '}
        <a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=4&dateb=&owner=include&count=40" target="_blank" rel="noreferrer">View on EDGAR →</a>
      </p>
    </div>
  )
}
