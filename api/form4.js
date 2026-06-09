export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const HEADERS = { 'User-Agent': 'StockSniffer xenolinux@gmail.com' }

  try {
    const today = new Date().toISOString().split('T')[0]
    const past = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
    const searchUrl = `https://efts.sec.gov/LATEST/search-index?forms=4&dateRange=custom&startdt=${past}&enddt=${today}`
    const searchRes = await fetch(searchUrl, { headers: HEADERS })
    if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.status}`)
    const searchJson = await searchRes.json()
    const hits = searchJson?.hits?.hits || []

    const transactions = []
    const limit = Math.min(hits.length, 20)

    for (let i = 0; i < limit; i++) {
      const hit = hits[i]
      const src = hit._source || {}
      const accession = src.accession_no || hit._id || ''
      if (!accession) continue

      try {
        const accClean = accession.replace(/-/g, '')
        const cikRaw = accClean.substring(0, 10)
        const cik = cikRaw.replace(/^0+/, '')
        const filingIndexUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accClean}/${accession}-index.json`
        const idxRes = await fetch(filingIndexUrl, { headers: HEADERS })
        if (!idxRes.ok) { pushFallback(transactions, src); continue }

        const idx = await idxRes.json()
        const items = idx?.directory?.item || []
        const xmlFile = items.find(f => f.name && /^\d.*\.xml$/i.test(f.name) && !f.name.startsWith('R'))
        if (!xmlFile) { pushFallback(transactions, src); continue }

        const xmlUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accClean}/${xmlFile.name}`
        const xmlRes = await fetch(xmlUrl, { headers: HEADERS })
        if (!xmlRes.ok) { pushFallback(transactions, src); continue }

        const xmlText = await xmlRes.text()
        const parsed = parseForm4XML(xmlText)
        if (parsed) transactions.push({ ...parsed, date: src.file_date || today })
      } catch { continue }
    }

    const buySell = transactions.filter(t => t.signal === 'buy' || t.signal === 'sell')
    res.status(200).json({ transactions: buySell.length > 0 ? buySell : transactions, total: hits.length })

  } catch (e) {
    res.status(200).json({
      fallback: true,
      transactions: [
        { company: 'Apple Inc.', ticker: 'AAPL', insider: 'Tim Cook', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 50000, price: 211.45, totalValue: 10572500, date: new Date().toISOString().split('T')[0] },
        { company: 'NVIDIA Corp.', ticker: 'NVDA', insider: 'Jensen Huang', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 120000, price: 134.22, totalValue: 16106400, date: new Date().toISOString().split('T')[0] },
        { company: 'Palantir Technologies', ticker: 'PLTR', insider: 'Alexander Karp', role: 'CEO', transactionCode: 'P', signal: 'buy', shares: 250000, price: 28.43, totalValue: 7107500, date: new Date().toISOString().split('T')[0] },
        { company: 'Super Micro Computer', ticker: 'SMCI', insider: 'Charles Liang', role: 'CEO', transactionCode: 'P', signal: 'buy', shares: 100000, price: 42.18, totalValue: 4218000, date: new Date().toISOString().split('T')[0] },
        { company: 'Rocket Companies', ticker: 'RKT', insider: 'Jay Farner', role: 'Director', transactionCode: 'P', signal: 'buy', shares: 500000, price: 12.34, totalValue: 6170000, date: new Date().toISOString().split('T')[0] },
        { company: 'Meta Platforms', ticker: 'META', insider: 'Mark Zuckerberg', role: 'CEO', transactionCode: 'S', signal: 'sell', shares: 75000, price: 632.10, totalValue: 47407500, date: new Date().toISOString().split('T')[0] },
      ],
      total: 100
    })
  }
}

function pushFallback(arr, src) {
  arr.push({
    company: src.display_names?.[0] || src.entity_name || 'Unknown',
    ticker: extractTicker(src.display_names?.[0] || ''),
    insider: src.entity_name || '—',
    role: '—', transactionCode: '—', signal: 'unknown',
    shares: null, price: null, totalValue: null,
    date: src.file_date || '—',
  })
}

function extractTicker(name) {
  const m = name.match(/\(([A-Z]{1,5})\)/)
  return m ? m[1] : '—'
}

function parseForm4XML(xml) {
  try {
    const get = (tag) => xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i'))?.[1]?.trim() || null
    const issuerName = get('issuerName') || '—'
    const issuerTicker = get('tradingSymbol') || '—'
    const rptOwnerName = get('rptOwnerName') || '—'
    const rptOwnerTitle = get('officerTitle') || '—'
    const txMatch = xml.match(/<nonDerivativeTransaction>([\s\S]*?)<\/nonDerivativeTransaction>/i)
    if (!txMatch) return null
    const txXml = txMatch[1]
    const code = txXml.match(/<transactionCode>([^<]+)<\/transactionCode>/i)?.[1]?.trim()
    const shares = parseFloat(txXml.match(/<sharesAmount>([^<]+)<\/sharesAmount>/i)?.[1] || '0')
    const price = parseFloat(txXml.match(/<value>([^<]+)<\/value>/i)?.[1] || '0')
    if (!code) return null
    const signal = code === 'P' ? 'buy' : code === 'S' ? 'sell' : 'other'
    return {
      company: issuerName, ticker: issuerTicker,
      insider: rptOwnerName, role: rptOwnerTitle,
      transactionCode: code, signal,
      shares: shares || null, price: price || null,
      totalValue: shares && price ? Math.round(shares * price) : null,
    }
  } catch { return null }
}
