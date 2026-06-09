export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    // Use SEC EDGAR full text search API for recent Form 4 filings
    const today = new Date().toISOString().split('T')[0]
    const past = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
    const url = `https://efts.sec.gov/LATEST/search-index?forms=4&dateRange=custom&startdt=${past}&enddt=${today}&_source=period_of_report,display_names,file_date,entity_name,file_num`
    const r = await fetch(url, {
      headers: { 'User-Agent': 'StockSniffer xenolinux@gmail.com' }
    })
    const json = await r.json()
    res.status(200).json(json)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
