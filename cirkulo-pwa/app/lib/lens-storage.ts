/**
 * Lens Storage Upload Utility
 *
 * Uploads files to Grove Storage (Lens Protocol's storage solution) and returns lens:// URIs.
 *
 * @see https://docs.lens.xyz/docs/protocol/storage
 */

import { storageClient } from "./grove-storage";

/**
 * Upload a file to Lens Storage
 *
 * @param file - The file to upload (image, video, etc.)
 * @returns Promise resolving to a lens:// URI
 * @throws Error if upload fails
 *
 * @example
 * const profilePhoto = document.querySelector('input[type="file"]').files[0];
 * const lensUri = await uploadToLensStorage(profilePhoto);
 * // Returns: "lens://4f91cab87ab5e4f5066f878b72..."
 */
export async function uploadToLensStorage(
	fileOrJson: File | string,
	walletClient?: any
): Promise<string> {
	// Handle JSON string (for metadata)
	if (typeof fileOrJson === "string") {
		try {
			const { uri: metadataUri } = await storageClient.uploadAsJson(fileOrJson);
			return metadataUri;
		} catch (error) {
			console.error("[Lens Storage] Upload failed:", error);
			throw new Error(`Failed to upload metadata to Grove Storage: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	// Handle File object (for images, etc.)
	try {
		const { uri: fileUri } = await storageClient.uploadFile(fileOrJson);
		return fileUri;
	} catch (error) {
		console.error("[Lens Storage] File upload failed:", error);
		throw new Error(`Failed to upload file to Grove Storage: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
}

/**
 * Upload a file to Lens Storage with progress tracking
 *
 * @param file - The file to upload
 * @param onProgress - Callback for upload progress (0-100)
 * @returns Promise resolving to a lens:// URI
 */
export async function uploadToLensStorageWithProgress(
	file: File,
	onProgress?: (progress: number) => void,
): Promise<string> {
	// TODO: Implement with progress tracking

	// Simulate progress for now
	if (onProgress) {
		onProgress(0);
		await new Promise((resolve) => setTimeout(resolve, 100));
		onProgress(50);
		await new Promise((resolve) => setTimeout(resolve, 100));
		onProgress(100);
	}

	return uploadToLensStorage(file);
}

/**
 * Validate file before upload
 *
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateFileForLensStorage(
	file: File,
	options?: {
		maxSizeMB?: number;
		allowedTypes?: string[];
	},
): { valid: boolean; error?: string } {
	const maxSize = (options?.maxSizeMB || 5) * 1024 * 1024;
	const allowedTypes = options?.allowedTypes || [
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/avif",
	];

	if (file.size > maxSize) {
		return {
			valid: false,
			error: `File size exceeds ${options?.maxSizeMB || 5}MB limit`,
		};
	}

	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: `File type ${file.type} is not supported`,
		};
	}

	return { valid: true };
}

/**
 * Production Implementation Notes:
 *
 * To implement actual Lens Storage upload:
 *
 * 1. Install Lens Storage SDK (if available) or use HTTP API
 * 2. Get API credentials/keys for Lens Storage Node
 * 3. Implement upload function:
 *
 * ```typescript
 * import { LensStorageClient } from '@lens-protocol/storage'; // hypothetical
 *
 * const storageClient = new LensStorageClient({
 *   apiKey: process.env.LENS_STORAGE_API_KEY,
 * });
 *
 * export async function uploadToLensStorage(file: File): Promise<string> {
 *   const formData = new FormData();
 *   formData.append('file', file);
 *
 *   const response = await storageClient.upload(formData);
 *   return response.uri; // lens://...
 * }
 * ```
 *
 * 4. Handle errors, retries, and timeouts
 * 5. Add progress tracking using XMLHttpRequest or fetch with ReadableStream
 *
 * Alternative: Use IPFS
 * If Lens Storage is not available, you can use IPFS:
 * - web3.storage: https://web3.storage
 * - Pinata: https://pinata.cloud
 * - NFT.Storage: https://nft.storage
 *
 * Then convert IPFS CID to lens:// URI (if Lens supports IPFS URIs)
 */
