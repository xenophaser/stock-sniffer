import { useState, useEffect, useCallback } from 'react'
import './App.css'

const TABS = ['Insider Trades', 'Short Squeeze', 'Institutional']

function Badge({ color, text }) {
  const colors = {
    green: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
    red: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
    amber: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    blue: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
    purple: { bg: 'rgba(167,139,250,0.15)', color: '#c4b5fd' },
  }
  const s = colors[color] || colors.blue
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 500, padding: '2px 8px',
      borderRadius: 99, whiteSpace: 'nowrap'
    }}>{text}</span>
  )
}

function Card({ children, style }) {
  return <div className="card" style={style}>{children}</div>
}

function SectionTitle({ children }) {
  return <p className="section-title">{children}</p>
}

function InsiderTab({ data, loading, error }) {
  if (loading) return <div className="loading-msg">Fetching SEC Form 4 filings...</div>
  if (error) return <div className="error-msg">Error: {error}</div>

  const hits = data?.hits?.hits || []

  if (hits.length === 0) return <div className="loading-msg">No recent Form 4 filings found.</div>

  return (
    <div>
      <div className="info-bar">
        <span>Recent insider transactions from SEC EDGAR · Form 4 filings · Last 7 days</span>
        <Badge color="blue" text={`${hits.length} filings`} />
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Filed</th>
              <th>Period</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            {hits.map((h, i) => {
              const src = h._source || {}
              const name = src.display_names?.[0] || src.entity_name || 'Unknown'
              const filed = src.file_date || '—'
              const period = src.period_of_report || '—'
              return (
                <tr key={i}>
                  <td className="company-cell">{name}</td>
                  <td className="muted-cell">{filed}</td>
                  <td className="muted-cell">{period}</td>
                  <td><Badge color="amber" text="Form 4" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="footnote">Source: SEC EDGAR · <a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=4&dateb=&owner=include&count=40" target="_blank" rel="noreferrer">View on EDGAR →</a></p>
    </div>
  )
}

function ShortTab({ data, loading, error }) {
  if (loading) return <div className="loading-msg">Fetching short interest data...</div>
  if (error) return <div className="error-msg">Error: {error}</div>

  const isFallback = data?.fallback
  const items = data?.data || []

  // If FINRA returned real data
  const finraItems = Array.isArray(data) ? data : []
  const displayItems = finraItems.length > 0 ? finraItems : items

  return (
    <div>
      <div className="info-bar">
        <span>High short interest stocks — potential squeeze candidates</span>
        {isFallback && <Badge color="amber" text="Sample data" />}
        {!isFallback && <Badge color="green" text="FINRA live" />}
      </div>

      {isFallback && (
        <div className="alert-box amber">
          ⚠️ FINRA API returned no data — showing sample stocks. Real short interest data updates twice monthly from FINRA.
        </div>
      )}

      <div className="squeeze-grid">
        {displayItems.map((item, i) => {
          const symbol = item.symbol || item.issueSymbolIdentifier || item.ticker || '—'
          const si = item.shortInterest || item.shortParQuantity || 0
          const float = item.float || '—'
          const siPct = typeof item.shortInterest === 'number' ? item.shortInterest : null

          return (
            <div key={i} className="squeeze-card">
              <div className="squeeze-top">
                <span className="squeeze-symbol">{symbol}</span>
                {siPct && <Badge color={siPct > 30 ? 'red' : siPct > 20 ? 'amber' : 'blue'} text={`${siPct}% short`} />}
              </div>
              <div className="squeeze-stat">
                <span className="muted">Short interest</span>
                <span style={{ color: 'var(--red)', fontWeight: 500 }}>{si.toLocaleString()}</span>
              </div>
              {float !== '—' && (
                <div className="squeeze-stat">
                  <span className="muted">Float (M)</span>
                  <span>{float}</span>
                </div>
              )}
              <div className="squeeze-signals">
                {siPct > 30 && <Badge color="red" text="🔥 High squeeze risk" />}
                {siPct > 20 && siPct <= 30 && <Badge color="amber" text="⚡ Elevated short interest" />}
              </div>
            </div>
          )
        })}
      </div>
      <p className="footnote">Source: FINRA · Short interest updates twice monthly · <a href="https://www.finra.org/investors/learn-to-invest/advanced-investing/short-selling" target="_blank" rel="noreferrer">Learn more →</a></p>
    </div>
  )
}

function InstitutionalTab({ data, loading, error }) {
  if (loading) return <div className="loading-msg">Fetching 13F institutional filings...</div>
  if (error) return <div className="error-msg">Error: {error}</div>

  const hits = data?.hits?.hits || []

  if (hits.length === 0) return <div className="loading-msg">No recent 13F filings found.</div>

  return (
    <div>
      <div className="info-bar">
        <span>Institutional holdings disclosures · SEC Form 13F · Last 90 days</span>
        <Badge color="purple" text={`${hits.length} filings`} />
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Institution</th>
              <th>Filed</th>
              <th>Period</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {hits.map((h, i) => {
              const src = h._source || {}
              const name = src.display_names?.[0] || src.entity_name || 'Unknown'
              const filed = src.file_date || '—'
              const period = src.period_of_report || '—'
              return (
                <tr key={i}>
                  <td className="company-cell">{name}</td>
                  <td className="muted-cell">{filed}</td>
                  <td className="muted-cell">{period}</td>
                  <td><Badge color="purple" text="13F-HR" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="footnote">Source: SEC EDGAR · 13F filings due 45 days after quarter end · <a href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=13F&dateb=&owner=include&count=40" target="_blank" rel="noreferrer">View on EDGAR →</a></p>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(null)

  const [insiderData, setInsiderData] = useState(null)
  const [insiderLoading, setInsiderLoading] = useState(true)
  const [insiderError, setInsiderError] = useState(null)

  const [shortData, setShortData] = useState(null)
  const [shortLoading, setShortLoading] = useState(true)
  const [shortError, setShortError] = useState(null)

  const [instData, setInstData] = useState(null)
  const [instLoading, setInstLoading] = useState(true)
  const [instError, setInstError] = useState(null)

  const loadAll = useCallback(async () => {
    setInsiderLoading(true)
    setShortLoading(true)
    setInstLoading(true)

    // Insider
    fetch('/api/form4')
      .then(r => r.json())
      .then(d => { setInsiderData(d); setInsiderLoading(false) })
      .catch(e => { setInsiderError(e.message); setInsiderLoading(false) })

    // Short interest
    fetch('/api/shortinterest')
      .then(r => r.json())
      .then(d => { setShortData(d); setShortLoading(false) })
      .catch(e => { setShortError(e.message); setShortLoading(false) })

    // Institutional
    fetch('/api/institutional')
      .then(r => r.json())
      .then(d => { setInstData(d); setInstLoading(false) })
      .catch(e => { setInstError(e.message); setInstLoading(false) })

    setLastUpdate(new Date())
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const insiderCount = insiderData?.hits?.hits?.length || 0
  const instCount = instData?.hits?.hits?.length || 0

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo">🔍</span>
          <div>
            <h1>Stock Sniffer</h1>
            <p className="subtitle">SEC Insider Trades · Short Squeeze · Institutional Accumulation</p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn" onClick={loadAll}>↻ Refresh</button>
          {lastUpdate && <span className="muted">{lastUpdate.toLocaleTimeString()}</span>}
        </div>
      </header>

      {/* Summary strip */}
      <div className="summary-strip">
        <div className="summary-item">
          <span className="summary-label">Form 4 filings</span>
          <span className="summary-value" style={{ color: 'var(--amber)' }}>{insiderLoading ? '…' : insiderCount}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Short candidates</span>
          <span className="summary-value" style={{ color: 'var(--red)' }}>{shortLoading ? '…' : (shortData?.data?.length || 0)}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">13F filings</span>
          <span className="summary-value" style={{ color: 'var(--purple)' }}>{instLoading ? '…' : instCount}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-item">
          <span className="summary-label">Data sources</span>
          <span className="summary-value" style={{ color: 'var(--green)', fontSize: 12 }}>SEC · FINRA</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`tab ${activeTab === i ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {i === 0 && '📋 '}{i === 1 && '🔥 '}{i === 2 && '🏦 '}{t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 0 && <InsiderTab data={insiderData} loading={insiderLoading} error={insiderError} />}
        {activeTab === 1 && <ShortTab data={shortData} loading={shortLoading} error={shortError} />}
        {activeTab === 2 && <InstitutionalTab data={instData} loading={instLoading} error={instError} />}
      </div>

      <footer className="footer">
        <p>Not financial advice. Data: SEC EDGAR public API · FINRA · For educational purposes only.</p>
      </footer>
    </div>
  )
}
