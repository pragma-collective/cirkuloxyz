import { PublicClient, testnet } from "@lens-protocol/client";

// Create and export Lens client configured for testnet
export const lensClient = PublicClient.create({
  environment: testnet,
});
