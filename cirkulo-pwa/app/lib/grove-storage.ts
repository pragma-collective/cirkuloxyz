/**
 * Grove Storage Client
 *
 * Official Lens Protocol storage solution for uploading files and metadata.
 * Grove provides decentralized, secure storage with onchain-controlled access.
 *
 * @see https://docs.lens.xyz/docs/storage
 */

import { StorageClient, production } from "@lens-chain/storage-client";

/**
 * Shared Grove storage client instance
 *
 * Configured for Lens production environment.
 * This works with both testnet and mainnet Lens accounts.
 */
export const storageClient = StorageClient.create(production);
