// api/oracle.js
// Fetches BCH/USD price from General Protocols oracle relay (same as BCHBULL / oracles.cash)
// Falls back to CoinPaprika if the oracle relay is unreachable.

const ORACLE_PUBKEY = '02d09db08af1ff4e8453919cc866a4be427d7bfe18f2c05e5444c196fcf6fd2818';
const ORACLE_URL = `https://oracles.generalprotocols.com/api/v1/oracleLatestDatapoints?publicKey=${ORACLE_PUBKEY}`;
const FALLBACK_URL = 'https://api.coinpaprika.com/v1/tickers/bch-bitcoin-cash?quotes=USD';

// The oracle returns price as integer "attestation units per standard asset unit = 100"
// meaning the raw value is USD cents per BCH (e.g. 47500 = $475.00)
function decodeOraclePrice(datapoints) {
  if (!datapoints || datapoints.length === 0) return null;
  // Most recent datapoint is first
  const latest = datapoints[0];
  // message is hex: first 4 bytes = blockheight (little-endian), next 4 bytes = price in cents
  const msg = latest.message;
  if (!msg || msg.length < 16) return null;
  // Decode price: bytes 4-7 (little-endian uint32), value = USD cents
  const priceCents =
    parseInt(msg.slice(8, 10), 16) +
    parseInt(msg.slice(10, 12), 16) * 256 +
    parseInt(msg.slice(12, 14), 16) * 65536 +
    parseInt(msg.slice(14, 16), 16) * 16777216;
  return priceCents / 100;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  let source = 'oracle';
  let price = null;

  // 1. Try General Protocols oracle relay
  try {
    const oracleRes = await fetch(ORACLE_URL, { signal: AbortSignal.timeout(5000) });
    if (oracleRes.ok) {
      const data = await oracleRes.json();
      price = decodeOraclePrice(data.datapoints || data);
    }
  } catch (_) {}

  // 2. Fallback: CoinPaprika
  if (!price) {
    source = 'coinpaprika';
    try {
      const fallbackRes = await fetch(FALLBACK_URL, { signal: AbortSignal.timeout(5000) });
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        price = data?.quotes?.USD?.price ?? null;
      }
    } catch (_) {}
  }

  if (!price) {
    return res.status(502).json({ error: 'All price sources unavailable', source: 'none' });
  }

  return res.status(200).json({
    price: parseFloat(price.toFixed(2)),
    source,
    timestamp: Date.now(),
  });
}
