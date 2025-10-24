# Cirkulo Internal Tool - Lens Sponsorship Manager

Internal tool for managing Lens Protocol app sponsorships. Use this to set up gas-free transactions for your app and manage sponsorship funding.

## Setup

```bash
cd cirkulo-internal-pwa
pnpm install
pnpm dev
```

Open http://localhost:5173

## Features

### 1. Set App Sponsorship (One-Time Setup)
Link your Lens app with its sponsorship contract to enable gas-free transactions.

**Steps:**
1. **Connect Wallet** - Connect your Builder wallet (the wallet that created the app)
2. **Enter Addresses**
   - App Address: Get from Lens dashboard (your app contract)
   - Sponsorship Address: Get from Lens dashboard (your sponsorship contract)
3. **Authenticate as Builder** - Sign message with your wallet
4. **Set Sponsorship** - Confirm transaction to link app with sponsorship

### 2. Fund Sponsorship
Add GRASS tokens to your sponsorship contract to pay for user transactions.

**Steps:**
1. **Enter Sponsorship Address** - Contract address from Lens dashboard
2. **View Current Balance** - Balance displays automatically
3. **Enter Amount** - How much GRASS to send (e.g., 1, 10, 100)
4. **Fund** - Confirm transaction in MetaMask
5. **Balance Updates** - New balance shows after transaction confirms

**Cost Estimates:**
- Each transaction: ~0.001-0.01 GRASS
- 1 GRASS ≈ 100-1000 transactions
- Start with 1-10 GRASS for testing

## What This Does

**Set App Sponsorship:**
Calls `setAppSponsorship` on Lens Protocol to link your app with sponsorship. After this, your app automatically sponsors gas fees for logged-in users.

**Fund Sponsorship:**
Sends GRASS tokens to the sponsorship contract. The contract uses these funds to pay gas fees for your users' transactions.

## Network

Currently configured for **Lens Testnet** (Chain ID: 37111).

**To use mainnet:**
1. Edit `src/main.tsx` - Change chain definition to Lens mainnet
2. Edit `src/App.tsx` - Change `testnet` to `production` for Lens client
3. Use GHO tokens instead of GRASS for funding

## Important Notes

- **Builder wallet required** - Must be the wallet that created the app in Lens dashboard
- **Set sponsorship once** - Only needs to be done one time per app
- **Monitor balance** - Check Lens dashboard regularly and top up as needed
- **Disconnect wallet** - Click "Disconnect" in top right when done

## Troubleshooting

**"Please connect your wallet first"**
- Install MetaMask or compatible Web3 wallet
- Click "Connect Wallet" button
- Approve connection in wallet popup

**"Authentication failed"**
- Use the wallet that created the app (Builder wallet)
- Check you're on Lens Testnet (Chain ID: 37111)
- Try refreshing and reconnecting

**"Transaction failed"**
- Verify addresses are correct (0x format)
- Ensure you're the owner/admin of both contracts
- Check you have enough GRASS for gas fees

**Balance not showing**
- Verify sponsorship address is correct
- Wait a few seconds for balance to load
- Check console for errors (F12)

## After Setup

1. **Monitor usage** - Track transaction volume in Lens dashboard
2. **Top up funds** - Use Section 2 to add more GRASS as needed
3. **Test app** - Verify users have gasless transactions
4. **Keep tool** - Unlike one-time tools, keep this for managing funding

## Reference

- [Lens Sponsorship Docs](https://lens.xyz/docs/protocol/sponsorships/sponsoring-transactions)
- [Lens Dashboard](https://developer.lens.xyz/)
- [Lens Explorer (Testnet)](https://block-explorer.testnet.lens.dev)
