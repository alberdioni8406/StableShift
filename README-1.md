# StableShift

**Convert BCH to decentralized stablecoins. No CEX. No custody.**

StableShift is an open-source, single-file web tool that helps users hedge BCH volatility by calculating conversion rates to [MUSD](https://moria.money) (Moria Protocol) and [PUSD](https://paryonusd.com) (ParyonUSD) — the two decentralized stablecoins native to Bitcoin Cash.

Live price is fetched from the **General Protocols oracle relay** — the same cryptographically-signed feed used by [BCHBULL](https://bchbull.com) and the broader BCH DeFi ecosystem.

→ Part of the [CashCompass](https://cashcompass.space) ecosystem.

---

## Features

- **Live BCH/USD price** via General Protocols oracle (`oracles.generalprotocols.com`)
- **Automatic fallback** to CoinPaprika if the oracle relay is unavailable
- **Rate calculator** — enter BCH or USD, get max mintable MUSD and PUSD instantly
- **Side-by-side comparison** of MUSD (150% collateral) vs PUSD (110% collateral)
- **Direct links** to Moria, ParyonUSD, and Cauldron DEX
- No build step, no dependencies, no tracking

---

## Project Structure

```
index.html       — entire frontend (single auditable file)
api/oracle.js    — Vercel serverless proxy for the price oracle
vercel.json      — routing config
```

---

## Deploy to Vercel

1. Fork or clone this repo
2. Import into [Vercel](https://vercel.com) — it auto-detects the `api/` serverless function
3. Deploy — no environment variables or build configuration needed

---

## How the Oracle Works

StableShift queries the General Protocols relay for the USD/BCH oracle:

- **Public key:** `02d09db08af1ff4e8453919cc866a4be427d7bfe18f2c05e5444c196fcf6fd2818`
- **Relay:** `oracles.generalprotocols.com`
- **Spec:** [oracles.cash](https://oracles.cash)

The signed price message is a hex-encoded 8-byte sequence: the first 4 bytes are the BCH block height and the next 4 bytes are the USD price in cents (little-endian). The proxy decodes this and returns clean JSON. If the relay is unreachable, CoinPaprika is used as a fallback.

---

## Stablecoins Supported

| | MUSD | PUSD |
|---|---|---|
| Protocol | Moria | ParyonUSD |
| Min. collateral | 150% | 110% |
| Oracle | General Protocols | General Protocols |
| Audited | Hashlock ✓ | Yes ✓ |
| Swap on DEX | Cauldron ✓ | Cauldron ✓ |

---

## Contributing

PRs welcome. Keep changes minimal and surgical — this tool is intentionally simple and self-hostable.

BCH donations: `bitcoincash:qrtv37u522gz8a5lezfqk5vukly93cu7gc8tn09040`

---

*StableShift is a read-only informational tool. It does not execute transactions or hold funds. Always verify token IDs and contract addresses before interacting with any DeFi protocol.*
