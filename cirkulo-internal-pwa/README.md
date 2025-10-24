# Cirkulo Internal Tool - Set App Sponsorship

**One-time use only.** This is a proper React app to connect your Lens app with its sponsorship contract.

## Setup

```bash
cd cirkulo-internal-pwa
pnpm install
pnpm dev
```

Open http://localhost:5173

## Usage

1. **Connect your Builder wallet** - Click "Connect Wallet" (MetaMask will popup)

2. **Enter your addresses:**
   - App Address: Get from Lens dashboard (the app you created)
   - Sponsorship Address: Get from Lens dashboard (the sponsorship you created)

3. **Authenticate as Builder** - Click "Authenticate with Lens" and sign the message in MetaMask

4. **Set Sponsorship** - Click "Set Sponsorship" and confirm the transaction

5. **Done!** - Once successful, delete this folder

## What This Does

Calls `setAppSponsorship` on Lens Protocol to link your app with your sponsorship contract. After this:
- Your app will automatically sponsor gas fees for logged-in users
- Users won't pay gas for transactions in your app
- Make sure your sponsorship contract has sufficient funds (GHO/GRASS)

## Network

Currently configured for **Lens Testnet**.

To use mainnet, edit `src/main.tsx` and `src/App.tsx`:
- Change `lensTestnet` to `lens` in wagmi config
- Change `testnet` to `production` in Lens client

## Troubleshooting

**"Please connect your wallet first"**
- Make sure MetaMask is installed
- Click "Connect Wallet" button

**"Authentication failed"**
- Ensure you're using the wallet that created the app
- Check you're on the correct network (Lens Testnet)

**"Transaction failed"**
- Verify both addresses are correct (0x format)
- Ensure sponsorship contract has funds
- Check you're the owner/admin of both contracts

## After Success

1. Transaction will confirm on-chain
2. Your app will now sponsor transactions
3. Monitor funds in Lens dashboard
4. **Delete this folder** - it's a one-time tool

## Reference

- [Lens Docs](https://lens.xyz/docs/protocol/sponsorships/sponsoring-transactions)
- [Lens Dashboard](https://developer.lens.xyz/)
