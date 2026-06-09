export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const SAMPLE = [
    { company: 'Apple Inc.', ticker: 'AAPL', insider: 'Tim Cook', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 50000, price: 211.45, totalValue: 10572500, date: '2026-06-06' },
    { company: 'NVIDIA Corp.', ticker: 'NVDA', insider: 'Jensen Huang', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 120000, price: 134.22, totalValue: 16106400, date: '2026-06-06' },
    { company: 'Palantir Technologies', ticker: 'PLTR', insider: 'Alexander Karp', role: 'CEO', transactionCode: 'P', signal: 'buy', shares: 250000, price: 28.43, totalValue: 7107500, date: '2026-06-05' },
    { company: 'Super Micro Computer', ticker: 'SMCI', insider: 'Charles Liang', role: 'CEO', transactionCode: 'P', signal: 'buy', shares: 100000, price: 42.18, totalValue: 4218000, date: '2026-06-05' },
    { company: 'Rocket Companies', ticker: 'RKT', insider: 'Jay Farner', role: 'Director', transactionCode: 'P', signal: 'buy', shares: 500000, price: 12.34, totalValue: 6170000, date: '2026-06-04' },
    { company: 'Meta Platforms', ticker: 'META', insider: 'Mark Zuckerberg', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 75000, price: 632.10, totalValue: 47407500, date: '2026-06-04' },
  ]

  const tickers = ['AAPL', 'NVDA', 'META', 'PLTR', 'MSFT', 'TSLA']
  const transactions = []

  try {
    for (const ticker of tickers) {
      try {
        const r = await fetch(`https://securitiesdb.com/api/v1/stocks/${ticker}/insider-activity`, {
          headers: { 'User-Agent': 'StockSniffer xenolinux@gmail.com' }
        })
        if (!r.ok) continue
        const json = await r.json()
        const recent = json?.data?.insider_transactions?.recent || []
        for (const t of recent.slice(0, 3)) {
          const signal = t.transaction_type === 'P' ? 'buy' : t.transaction_type === 'S' ? 'sell' : null
          if (!signal) continue
          transactions.push({
            company: t.company_name || ticker,
            ticker,
            insider: t.insider_name || '—',
            role: t.insider_title || '—',
            transactionCode: t.transaction_type,
            signal,
            shares: t.shares || null,
            price: t.price || null,
            totalValue: t.shares && t.price ? Math.round(t.shares * t.price) : null,
            date: t.transaction_date || '—',
          })
        }
      } catch { continue }
    }

    if (transactions.length === 0) throw new Error('No data')
    res.status(200).json({ transactions, total: transactions.length })
  } catch (e) {
    res.status(200).json({ fallback: true, transactions: SAMPLE, total: SAMPLE.length })
  }
}
