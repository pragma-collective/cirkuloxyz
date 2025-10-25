import { useState, useEffect } from "react";

/**
 * Hook for resolving ENS names to addresses and vice versa
 * TODO: Replace with real ENS resolution via ethers.js or viem
 */
export function useEnsResolver(address: string) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setEnsName(null);
      return;
    }

    // Mock ENS mapping (well-known addresses)
    const mockEnsMap: Record<string, string> = {
      "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045": "satoshi.xersha.eth",
      "0x5A384227B65FA093DEC03Ec34e111Db80A040615": "alice.eth",
      "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1": "bob.eth",
    };

    setIsLoading(true);

    // Simulate async lookup
    setTimeout(() => {
      if (address.endsWith(".eth")) {
        // Already an ENS name
        setEnsName(address);
      } else if (mockEnsMap[address]) {
        setEnsName(mockEnsMap[address]);
      } else {
        setEnsName(null);
      }
      setIsLoading(false);
    }, 300);
  }, [address]);

  return { ensName, isLoading };
}
