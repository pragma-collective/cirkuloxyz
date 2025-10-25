import { useState, useEffect } from "react";

/**
 * Hook to fetch ENS name for a wallet address
 * Currently uses mock data. Future: integrate with ENS SDK or wagmi's useEnsName
 *
 * @param address - Wallet address to look up
 * @returns ENS name (or null if not found), loading state
 *
 * @example
 * const { ensName, isLoading } = useEnsName("0x1234...");
 * // ensName: "vitalik.eth" or null
 */
export function useEnsName(address: string | null | undefined) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setEnsName(null);
      setIsLoading(false);
      return;
    }

    async function fetchEnsName() {
      try {
        setIsLoading(true);

        // TODO: Replace with actual ENS lookup
        // Option 1: Use wagmi's useEnsName hook
        // const { data: ensName } = useEnsName({ address: address as `0x${string}` })
        //
        // Option 2: Use ENS SDK directly
        // const provider = new ethers.providers.JsonRpcProvider(MAINNET_RPC);
        // const name = await provider.lookupAddress(address);
        //
        // Note: ENS is on Ethereum mainnet, but we're on Citrea (Bitcoin L2)
        // May need to decide: cross-chain ENS lookup or Citrea-native naming?

        // Mock data for now - derive from address for demo
        await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate network delay

        // Simple mock logic: Generate ENS-like name from address
        const shortAddress = address.slice(2, 6).toLowerCase();
        const mockEnsName = `user-${shortAddress}.eth`;

        // You can also have a mock mapping for specific addresses
        const mockEnsMap: Record<string, string> = {
          "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045": "vitalik.eth",
          "0x5A384227B65FA093DEC03Ec34e111Db80A040615": "alice.eth",
          "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb": "bob.eth",
        };

        setEnsName(mockEnsMap[address] || mockEnsName);
      } catch (err) {
        console.error("[useEnsName] Error:", err);
        setEnsName(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEnsName();
  }, [address]);

  return { ensName, isLoading };
}
