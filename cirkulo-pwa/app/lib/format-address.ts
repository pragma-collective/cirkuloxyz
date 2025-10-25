/**
 * Truncates Ethereum/Citrea address to format: 0x1A2b...9F3c
 *
 * @param address - Full wallet address (0x...)
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Truncated address string
 *
 * @example
 * formatAddress("0x1A2b3C4d5E6f7G8h9I0j") // "0x1A2b...9I0j"
 * formatAddress("0x1A2b3C4d5E6f7G8h9I0j", 6) // "0x1A2b3C...8h9I0j"
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2 + 2) {
    return address;
  }

  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
