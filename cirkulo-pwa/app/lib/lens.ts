import { PublicClient, testnet } from "@lens-protocol/client";
import { InMemoryStorageProvider } from "@lens-protocol/storage";

// Create storage provider - use localStorage in browser, in-memory otherwise
const storage = typeof window !== "undefined" && window.localStorage
  ? window.localStorage
  : new InMemoryStorageProvider();

// Create and export Lens client configured for testnet
export const lensClient = PublicClient.create({
  environment: testnet,
  storage,
});
