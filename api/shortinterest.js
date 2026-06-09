export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    // FINRA short interest data - top shorted stocks
    const url = 'https://regsho.finra.org/regsho-Index.html'
    // FINRA provides daily short sale files - use their API
    // Get latest threshold securities list
    const apiUrl = 'https://api.finra.org/data/group/OTCMarket/name/thresholdSecurities?limit=50&offset=0'
    const r = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'StockSniffer xenolinux@gmail.com'
      }
    })
    if (!r.ok) throw new Error(`FINRA API: ${r.status}`)
    const json = await r.json()
    res.status(200).json(json)
  } catch (e) {
    // Fallback to known high short interest stocks for demo
    res.status(200).json({
      fallback: true,
      data: [
        { symbol: 'GME', shortInterest: 22.4, float: 304 },
        { symbol: 'BBBY', shortInterest: 45.1, float: 117 },
        { symbol: 'AMC', shortInterest: 18.7, float: 520 },
        { symbol: 'CVNA', shortInterest: 31.2, float: 189 },
        { symbol: 'BYND', shortInterest: 38.9, float: 61 },
      ]
    })
  }
}
