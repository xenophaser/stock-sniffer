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

  const WATCHLIST = ['AAPL', 'NVDA', 'META', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'PLTR', 'SMCI', 'JPM']
  const API_KEY = 'ysEDLZnfWfumXeBVa91YMtV2UWtY5e4T6IJyvnZV'

  try {
    const transactions = []

    await Promise.all(WATCHLIST.map(async ticker => {
      try {
        const r = await fetch(`https://api.api-ninjas.com/v1/insidertrading?ticker=${ticker}&transaction_code=P&limit=3`, {
          headers: { 'X-Api-Key': API_KEY }
        })
        if (!r.ok) return
        const buys = await r.json()

        const r2 = await fetch(`https://api.api-ninjas.com/v1/insidertrading?ticker=${ticker}&transaction_code=S&limit=3`, {
          headers: { 'X-Api-Key': API_KEY }
        })
        const sells = r2.ok ? await r2.json() : []

        ;[...buys, ...sells].forEach(t => {
          transactions.push({
            company: t.company_name || ticker,
            ticker: t.ticker || ticker,
            insider: t.name || '—',
            role: t.position || '—',
            transactionCode: t.transaction_code || '—',
            signal: t.transaction_code === 'P' ? 'buy' : t.transaction_code === 'S' ? 'sell' : 'other',
            shares: t.shares || null,
            price: t.price || null,
            totalValue: t.total_value || null,
            date: t.transaction_date || '—',
          })
        })
      } catch { /* skip */ }
    }))

    const buySell = transactions.filter(t => t.signal === 'buy' || t.signal === 'sell')
    if (buySell.length === 0) throw new Error('No data')

    // Sort by date descending
    buySell.sort((a, b) => b.date.localeCompare(a.date))
    res.status(200).json({ transactions: buySell.slice(0, 20), total: buySell.length })

  } catch (e) {
    res.status(200).json({ fallback: true, transactions: SAMPLE, total: SAMPLE.length })
  }
}
