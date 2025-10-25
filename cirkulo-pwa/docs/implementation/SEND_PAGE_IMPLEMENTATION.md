# Send Transaction Page Implementation

## Overview

The `/wallet/send` page is now fully implemented with a complete user flow for sending CBTC or CUSD tokens. The implementation follows the design specification with 5 distinct states and includes all required components, hooks, and validation.

## Architecture

### File Structure

```
cirkulo-pwa/
├── app/
│   ├── routes/
│   │   └── wallet.send.tsx                          # Main route (5 states)
│   ├── components/wallet/
│   │   ├── token-selector.tsx                       # CBTC/CUSD toggle
│   │   ├── recipient-input.tsx                      # Address input with validation
│   │   ├── amount-input.tsx                         # Amount with MAX button
│   │   ├── fee-estimator.tsx                        # Network fee display
│   │   ├── transaction-summary.tsx                  # Review card
│   │   └── transaction-status-modal.tsx             # Processing/Success/Error modals
│   ├── hooks/
│   │   ├── use-token-price.ts                       # USD conversion (mock)
│   │   ├── use-fee-estimator.ts                     # Gas fee estimation (mock)
│   │   ├── use-ens-resolver.ts                      # ENS name resolution (mock)
│   │   └── use-send-transaction.ts                  # Transaction logic (mock)
│   └── schemas/
│       └── send-transaction-schema.ts                # Zod validation
```

## User Flow (5 States)

### State 1: Form Entry
**Location:** `wallet.send.tsx` lines 186-234

**Features:**
- Token selector (CBTC/CUSD) - sticky below header
- Available balance display
- Recipient address input with validation
- Amount input with MAX button
- Fee estimator (shows when amount > 0)
- Total summary (shows when amount > 0)
- "Review Transaction" button (disabled until valid)

**Validation:**
- Recipient: Must be valid 0x address or .eth name
- Amount: Must be > 0, ≤ balance - fee, max 18 decimals

### State 2: Review
**Location:** `wallet.send.tsx` lines 237-249

**Features:**
- Transaction summary card with all details
- Displays ENS name if available
- Shows token icon (Bitcoin/Dollar)
- Total including fees
- "Confirm & Send" button

**Navigation:**
- Back button returns to form entry
- Preserves all form values

### State 3: Processing
**Location:** `transaction-status-modal.tsx` lines 57-76

**Features:**
- Full-screen modal with backdrop blur
- Animated spinner
- Warning: "Do not close this window"
- Cannot be dismissed (no escape key, no backdrop click)

### State 4A: Success
**Location:** `transaction-status-modal.tsx` lines 78-133

**Features:**
- Green checkmark icon
- Transaction hash display
- Copy to clipboard button
- "View on Explorer" link (Citrea testnet)
- "Done" button → navigates to /wallet

**Post-Success:**
- Automatically returns to wallet page
- Transaction appears in history (future feature)

### State 4B: Error
**Location:** `transaction-status-modal.tsx` lines 135-183

**Features:**
- Red X icon
- Error message display
- "Try Again" button → returns to review screen
- "Cancel" button → stays on send page

**Error Handling:**
- Displays specific error message
- Allows retry without re-entering data

## Components

### 1. TokenSelector
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/components/wallet/token-selector.tsx`

**Props:**
```typescript
{
  selected: "CBTC" | "CUSD",
  onSelect: (token: "CBTC" | "CUSD") => void
}
```

**Design:**
- Two equal-width radio buttons
- Active state shows token-specific colors
- CBTC: Orange theme (oklch 45° hue)
- CUSD: Purple theme (oklch 290° hue)
- Sticky positioning below header
- Touch-friendly (44x44px minimum)

### 2. RecipientInput
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/components/wallet/recipient-input.tsx`

**Props:**
```typescript
{
  value: string,
  onChange: (value: string) => void,
  error?: string,
  isValid?: boolean
}
```

**Features:**
- Validates 0x addresses and .eth names
- Visual validation states (green border when valid, red when error)
- QR code scanner button (placeholder - TODO)
- Real-time validation feedback

### 3. AmountInput
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/components/wallet/amount-input.tsx`

**Props:**
```typescript
{
  value: string,
  onChange: (value: string) => void,
  token: "CBTC" | "CUSD",
  balance: number,
  estimatedFee: number,
  error?: string
}
```

**Features:**
- Numeric input with decimal support
- MAX button (sets to balance - estimated fee)
- Real-time USD conversion
- Balance display
- Input mode: decimal (mobile keyboard)

### 4. FeeEstimator
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/components/wallet/fee-estimator.tsx`

**Props:**
```typescript
{
  token: "CBTC" | "CUSD",
  estimatedFee: number
}
```

**Design:**
- Amber-themed info card
- Shows fee in token + USD equivalent
- Explains "Citrea network" context

### 5. TransactionSummary
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/components/wallet/transaction-summary.tsx`

**Props:**
```typescript
{
  token: "CBTC" | "CUSD",
  amount: string,
  recipient: string,
  fee: number,
  total: number,
  ensName?: string | null
}
```

**Sections:**
1. Sending: Token icon + amount + USD
2. To: Avatar + ENS name (if available) + truncated address
3. Network Fee: Amount + USD
4. Total: Bold amount + USD

**Styling:**
- Rounded 3xl card with shadow
- Sections separated by dividers
- Token-specific icon colors

### 6. TransactionStatusModal
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/components/wallet/transaction-status-modal.tsx`

**Props:**
```typescript
{
  status: "processing" | "success" | "error",
  txHash?: string | null,
  error?: string | null,
  onClose: () => void,
  onRetry?: () => void
}
```

**Features:**
- Full-screen overlay with backdrop blur
- Prevents body scroll when open
- Keyboard navigation (Escape to close, except during processing)
- Focus management for accessibility
- Auto-dismisses on success navigation

## Business Logic Hooks

### 1. useTokenPrice
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/hooks/use-token-price.ts`

**Mock Prices:**
- CBTC: $80,645.23
- CUSD: $1.00

**Returns:**
```typescript
{
  price: number,
  convertToUSD: (amount: string | number) => number,
  formatUSD: (amount: string | number) => string
}
```

**TODO:** Replace with real-time price feed from API/oracle

### 2. useFeeEstimator
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/hooks/use-fee-estimator.ts`

**Mock Fees:**
- CBTC: 0.0002 (~$16)
- CUSD: 16.00

**Returns:**
```typescript
{
  estimatedFee: number,
  isLoading: boolean
}
```

**TODO:** Replace with real gas estimation from Citrea RPC

### 3. useEnsResolver
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/hooks/use-ens-resolver.ts`

**Mock Mappings:**
- 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 → vitalik.eth
- 0x5A384227B65FA093DEC03Ec34e111Db80A040615 → alice.eth
- 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1 → bob.eth

**Returns:**
```typescript
{
  ensName: string | null,
  isLoading: boolean
}
```

**TODO:** Replace with real ENS resolution via ethers.js or viem

### 4. useSendTransaction
**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/hooks/use-send-transaction.ts`

**Mock Behavior:**
- 2 second delay (simulates network)
- 90% success rate (10% random error)
- Generates mock transaction hash

**Returns:**
```typescript
{
  sendTransaction: (data: SendTransactionFormData) => Promise<void>,
  status: "idle" | "processing" | "success" | "error",
  txHash: string | null,
  error: string | null,
  reset: () => void
}
```

**TODO:** Replace with real blockchain transaction via wagmi/viem

## Validation Schema

**File:** `/home/discovery/Code/pragma-collective/cirkulo/cirkulo-pwa/app/schemas/send-transaction-schema.ts`

```typescript
{
  token: "CBTC" | "CUSD",           // Required
  recipient: string,                 // 0x address or .eth name
  amount: string                     // > 0, max 18 decimals
}
```

**Validation Rules:**
1. Token: Must be CBTC or CUSD
2. Recipient: Must match regex for 0x address OR .eth name
3. Amount: Must be positive number with max 18 decimals
4. Additional: Must not exceed balance - fee (validated in route)

## Design System

### Colors (OKLCH)

**CBTC (Orange):**
- Primary: `oklch(0.75_0.15_45)` - #ea7c3f
- Light background: `oklch(0.98_0.02_45)`
- Text: `oklch(0.55_0.15_45)`

**CUSD (Purple):**
- Primary: `oklch(0.70_0.18_290)`
- Light background: `oklch(0.98_0.02_290)`
- Text: `oklch(0.50_0.18_290)`

**Validation States:**
- Valid: `oklch(0.70_0.15_160)` - Teal
- Error: `oklch(0.65_0.20_25)` - Red

**Fee Warning:**
- Background: `bg-amber-50`
- Border: `border-amber-200`
- Text: `text-amber-900`

### Typography

**Headers:**
- Page title: `text-xl font-bold`
- Section title: `text-lg font-semibold`
- Card title: `text-2xl font-bold`

**Body:**
- Input text: `text-base`
- Amount: `text-2xl font-semibold`
- Labels: `text-sm font-medium`
- Helper text: `text-xs`

### Spacing

**Touch Targets:**
- Minimum: 44x44px (WCAG AAA)
- Buttons: 48-56px height

**Layout:**
- Max width: `max-w-md` (448px)
- Padding: `px-4 py-6`
- Gap: `space-y-6` for sections

### Borders & Shadows

**Cards:**
- Border: `border-2 border-neutral-200`
- Radius: `rounded-xl` (inputs), `rounded-3xl` (cards)
- Shadow: `shadow-xl`

**Modal:**
- Backdrop: `bg-black/60 backdrop-blur-sm`
- Card shadow: `shadow-2xl`

## Accessibility Features

### Keyboard Navigation
- ✅ All interactive elements focusable
- ✅ Tab order follows visual flow
- ✅ Escape key dismisses modal (except during processing)
- ✅ Enter key submits forms

### Screen Reader Support
- ✅ Semantic HTML (`<header>`, `<button>`, `<label>`)
- ✅ ARIA labels on icon buttons
- ✅ ARIA roles on custom controls (`role="radio"`, `role="dialog"`)
- ✅ ARIA live regions for dynamic updates
- ✅ Error messages linked via `aria-describedby`

### Visual Accessibility
- ✅ 4.5:1 contrast ratio (WCAG AA)
- ✅ Focus indicators on all interactive elements
- ✅ Visual validation states (color + icons)
- ✅ Clear error messages
- ✅ Loading states with descriptive text

### Mobile Accessibility
- ✅ Touch targets minimum 44x44px
- ✅ `inputMode="decimal"` for numeric keyboard
- ✅ Sticky header for context
- ✅ Fixed footer for primary action
- ✅ Safe area handling

## Integration Points

### Current Integrations
1. **React Hook Form** - Form state management
2. **Zod** - Runtime validation
3. **React Router** - Navigation
4. **Lucide React** - Icons
5. **Tailwind CSS** - Styling

### Future Integrations (TODOs)

1. **Wallet Balances:**
   ```typescript
   // Replace MOCK_BALANCES with:
   const { balances } = useWalletBalances();
   ```

2. **Gas Estimation:**
   ```typescript
   // In use-fee-estimator.ts:
   const { data: gasEstimate } = useEstimateGas({
     to: recipient,
     value: parseEther(amount),
   });
   ```

3. **ENS Resolution:**
   ```typescript
   // In use-ens-resolver.ts:
   const { data: ensName } = useEnsName({ address });
   ```

4. **Transaction Execution:**
   ```typescript
   // In use-send-transaction.ts:
   const { writeContractAsync } = useScaffoldWriteContract({
     contractName: "TokenContract",
   });
   ```

5. **QR Code Scanner:**
   ```typescript
   // In recipient-input.tsx:
   import { QRScanner } from "~/components/qr-scanner";
   // Implement camera-based address scanning
   ```

## Testing

### Manual Testing Checklist

**Form Entry State:**
- [ ] Can switch between CBTC and CUSD
- [ ] Amount resets when switching tokens
- [ ] Recipient input validates addresses
- [ ] Recipient input validates ENS names
- [ ] Amount input only allows numbers and decimals
- [ ] MAX button calculates correctly (balance - fee)
- [ ] Fee estimator appears when amount > 0
- [ ] USD conversion updates in real-time
- [ ] Review button disabled until form valid
- [ ] Validation errors show inline

**Review State:**
- [ ] All transaction details display correctly
- [ ] ENS name shows if available
- [ ] Token icon matches selected token
- [ ] Total includes fee
- [ ] Back button returns to form (data preserved)
- [ ] Confirm button triggers transaction

**Processing State:**
- [ ] Modal appears immediately
- [ ] Spinner animates
- [ ] Cannot dismiss modal
- [ ] Warning text visible

**Success State:**
- [ ] Green checkmark appears
- [ ] Transaction hash displays
- [ ] Copy button works
- [ ] "Copied!" feedback appears
- [ ] Explorer link has correct URL
- [ ] Done button navigates to wallet

**Error State:**
- [ ] Red X appears
- [ ] Error message displays
- [ ] Try Again returns to review
- [ ] Cancel stays on page
- [ ] Can edit form after cancel

**Accessibility:**
- [ ] Can navigate entire flow with keyboard only
- [ ] Screen reader announces all states
- [ ] Focus management works in modal
- [ ] All errors announced to screen reader
- [ ] Touch targets meet minimum size

### Automated Testing (Future)

```typescript
// Example test structure
describe("SendPage", () => {
  it("validates recipient address format", () => {});
  it("calculates MAX amount correctly", () => {});
  it("shows appropriate error messages", () => {});
  it("navigates through states correctly", () => {});
  it("handles transaction success", () => {});
  it("handles transaction error with retry", () => {});
});
```

## Performance Considerations

1. **Form Validation:**
   - Debounced ENS resolution (300ms)
   - Client-side validation before submission
   - Async validation only when needed

2. **State Management:**
   - React Hook Form minimizes re-renders
   - Memoized calculations (useMemo, useCallback)
   - Only watched fields trigger updates

3. **Bundle Size:**
   - Components lazy-loaded via React Router
   - Icons tree-shaken (only used icons imported)
   - No large external dependencies

4. **Rendering:**
   - Conditional rendering reduces DOM nodes
   - Fixed footer prevents layout shift
   - Smooth transitions between states

## Known Limitations & TODOs

### High Priority
- [ ] Replace mock wallet balances with real data
- [ ] Implement real gas estimation
- [ ] Integrate blockchain transaction execution
- [ ] Add real-time price feeds

### Medium Priority
- [ ] Implement QR code scanner
- [ ] Add ENS resolution
- [ ] Support token decimals configuration
- [ ] Add transaction history integration

### Low Priority
- [ ] Add address book / recent recipients
- [ ] Implement contact name resolution
- [ ] Add multiple recipient support (batch send)
- [ ] Add scheduling/delayed transactions

## Troubleshooting

### Common Issues

**Issue:** "Review Transaction" button stays disabled
- **Check:** Recipient must be valid 0x address or .eth name
- **Check:** Amount must be greater than 0
- **Check:** Amount must not exceed balance

**Issue:** Amount input not accepting decimals
- **Solution:** Only valid decimal format accepted (no letters, no multiple dots)

**Issue:** Modal doesn't close after success
- **Expected:** Modal auto-closes and navigates to /wallet

**Issue:** QR scanner button doesn't work
- **Expected:** Feature not yet implemented (TODO)

## Deployment Notes

1. No environment variables needed for mock version
2. All dependencies already in package.json
3. No database migrations required
4. No API endpoints needed (all client-side)

## Future Enhancements

1. **Multi-Asset Support:**
   - Add more token types beyond CBTC/CUSD
   - Dynamic token list from smart contracts

2. **Advanced Features:**
   - Transaction memo/notes
   - Recurring payments
   - Split payments to multiple recipients

3. **Social Features:**
   - Send to Lens Protocol usernames
   - Integration with circle members
   - Payment requests

4. **Analytics:**
   - Track transaction success rate
   - Monitor average fees
   - User behavior analytics

---

**Implementation Date:** 2025-10-25
**Status:** ✅ Complete (Mock Version)
**Next Steps:** Integrate with blockchain layer
