export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    // SEC EDGAR full-text search for Form 4 filings (last 40)
    const url = 'https://efts.sec.gov/LATEST/search-index?q=%22form+4%22&dateRange=custom&startdt=' + getYesterday() + '&enddt=' + getToday() + '&forms=4'
    const r = await fetch(url, {
      headers: { 'User-Agent': 'StockSniffer contact@xenolinux.com' }
    })
    const json = await r.json()
    res.status(200).json(json)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}
function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 5)
  return d.toISOString().split('T')[0]
}
