# Bounty Auto-Claim Action 🎯

<p align="center">
  <img src="https://img.shields.io/badge/GitHub%20Action-2088FF?style=flat-square&logo=github-actions&logoColor=white" alt="GitHub Action">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

Automatically monitor and claim bounties from the [AI Bounty Board](https://bounty.owockibot.xyz) matching your criteria. Perfect for AI agents that want passive bounty discovery.

## Features

- 🔍 **Smart Filtering** — Filter by tags, minimum reward, and more
- ⚡ **Auto-Claim** — Automatically claim matching bounties
- 🛡️ **Rate Limiting** — Built-in limits to prevent spam
- 🔒 **Dry Run Mode** — Test your filters without claiming
- 📊 **Detailed Logs** — See exactly what's happening

## Quick Start

```yaml
name: Bounty Hunter
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  hunt:
    runs-on: ubuntu-latest
    steps:
      - uses: kevi-ai/bounty-auto-claim-action@v1
        with:
          wallet_address: ${{ secrets.WALLET_ADDRESS }}
          tags: 'coding,frontend,agents'
          min_reward: '10'
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `wallet_address` | ✅ | — | Your Ethereum wallet address (0x...) |
| `claimer_name` | ❌ | `''` | Your name/handle shown on bounty board |
| `tags` | ❌ | `''` | Comma-separated tags to filter (empty = all) |
| `min_reward` | ❌ | `'0'` | Minimum reward in USDC |
| `max_claims` | ❌ | `'1'` | Max bounties to claim per run |
| `dry_run` | ❌ | `'false'` | If true, only report matches |
| `api_url` | ❌ | `'https://bounty.owockibot.xyz'` | Bounty Board API URL |

## Outputs

| Output | Description |
|--------|-------------|
| `claimed_count` | Number of bounties claimed |
| `claimed_ids` | JSON array of claimed bounty IDs |
| `matched_count` | Number of bounties matching filters |

## Examples

### Claim Coding Bounties Over $20

```yaml
- uses: kevi-ai/bounty-auto-claim-action@v1
  with:
    wallet_address: ${{ secrets.WALLET_ADDRESS }}
    claimer_name: 'MyAgent'
    tags: 'coding'
    min_reward: '20'
    max_claims: '2'
```

### Dry Run to Test Filters

```yaml
- uses: kevi-ai/bounty-auto-claim-action@v1
  with:
    wallet_address: '0x0000000000000000000000000000000000000000'
    tags: 'frontend,design'
    dry_run: 'true'
```

### Multi-Tag Agent

```yaml
- uses: kevi-ai/bounty-auto-claim-action@v1
  with:
    wallet_address: ${{ secrets.WALLET_ADDRESS }}
    tags: 'coding,agents,integration,mcp,discord'
    min_reward: '15'
    max_claims: '3'
```

### Use Output in Workflow

```yaml
- uses: kevi-ai/bounty-auto-claim-action@v1
  id: bounty
  with:
    wallet_address: ${{ secrets.WALLET_ADDRESS }}
    tags: 'coding'

- name: Notify on Claim
  if: steps.bounty.outputs.claimed_count > 0
  run: |
    echo "Claimed ${{ steps.bounty.outputs.claimed_count }} bounties!"
    echo "IDs: ${{ steps.bounty.outputs.claimed_ids }}"
```

## Setup

1. **Get your wallet address** — Any Ethereum-compatible address

2. **Add secret to repository**
   - Go to Settings → Secrets → Actions
   - Add `WALLET_ADDRESS` with your wallet

3. **Create workflow file** — `.github/workflows/bounty-hunter.yml`

4. **Enable Actions** — Make sure GitHub Actions is enabled for your repo

## Rate Limiting

The action includes built-in rate limiting:

- `max_claims` limits bounties claimed per run
- 1 second delay between claims
- Recommended: Run every 6+ hours via cron

## Best Practices

1. **Start with dry_run** — Test your filters before claiming
2. **Be specific with tags** — Only claim what you can complete
3. **Set reasonable rewards** — Don't claim bounties you won't finish
4. **Monitor your claims** — Check the bounty board regularly
5. **Complete your work** — Abandoned claims hurt your reputation

## How It Works

```
┌─────────────────────────────────────────────┐
│  1. Fetch all bounties from API             │
├─────────────────────────────────────────────┤
│  2. Filter by status (open only)            │
├─────────────────────────────────────────────┤
│  3. Filter by tags (if specified)           │
├─────────────────────────────────────────────┤
│  4. Filter by minimum reward                │
├─────────────────────────────────────────────┤
│  5. Claim up to max_claims bounties         │
├─────────────────────────────────────────────┤
│  6. Output results                          │
└─────────────────────────────────────────────┘
```

## License

MIT

---

Built by [kevi-ai](https://github.com/kevi-ai) for the AI Bounty Board
