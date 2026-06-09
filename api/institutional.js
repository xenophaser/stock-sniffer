export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const past = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    const url = `https://efts.sec.gov/LATEST/search-index?forms=13F-HR&dateRange=custom&startdt=${past}&enddt=${today}&_source=display_names,file_date,entity_name,period_of_report`
    const r = await fetch(url, {
      headers: { 'User-Agent': 'StockSniffer xenolinux@gmail.com' }
    })
    const json = await r.json()
    res.status(200).json(json)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
