/**
 * XershaFactory Contract ABI and Configuration
 *
 * This file contains the ABI for the XershaFactory contract which manages
 * the creation of different pool types (ROSCA, Savings, Donation).
 */

// XershaFactory ABI - Auto-generated from compiled Solidity contract
export const xershaFactoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "circleId",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "poolAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum XershaFactory.PoolType",
        name: "poolType",
        type: "uint8",
      },
    ],
    name: "PoolCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "allPools",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "circleToPool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "circleId",
        type: "address",
      },
      {
        internalType: "string",
        name: "circleName",
        type: "string",
      },
      {
        internalType: "address",
        name: "beneficiary",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "goalAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isNativeToken",
        type: "bool",
      },
    ],
    name: "createDonationPool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "circleId",
        type: "address",
      },
      {
        internalType: "string",
        name: "circleName",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "contributionAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isNativeToken",
        type: "bool",
      },
    ],
    name: "createROSCA",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "circleId",
        type: "address",
      },
      {
        internalType: "string",
        name: "circleName",
        type: "string",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isNativeToken",
        type: "bool",
      },
    ],
    name: "createSavingsPool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPools",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "circleId",
        type: "address",
      },
    ],
    name: "getCirclePool",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "poolAddress",
        type: "address",
      },
    ],
    name: "getPoolType",
    outputs: [
      {
        internalType: "enum XershaFactory.PoolType",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalPools",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isValidPool",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "poolTypes",
    outputs: [
      {
        internalType: "enum XershaFactory.PoolType",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/**
 * PoolType enum matching the Solidity contract
 */
export enum PoolType {
  ROSCA = 0,
  SAVINGS = 1,
  DONATION = 2,
}

/**
 * Get XershaFactory contract address from environment variable
 *
 * For local development: Set VITE_XERSHA_FACTORY_ADDRESS to the deployed contract address
 * For production: Set in .env for each environment
 */
export function getXershaFactoryAddress(): `0x${string}` {
  const address = import.meta.env.VITE_XERSHA_FACTORY_ADDRESS;

  if (!address) {
    throw new Error("VITE_XERSHA_FACTORY_ADDRESS not set in environment variables");
  }

  return address as `0x${string}`;
}

/**
 * Get MockCUSD token contract address from environment variable
 *
 * For local development: Set VITE_MOCK_CUSD_ADDRESS to the deployed MockCUSD contract address
 * For production: Replace with actual CUSD stablecoin address on Citrea
 */
export function getMockCUSDAddress(): `0x${string}` {
  const address = import.meta.env.VITE_MOCK_CUSD_ADDRESS;

  if (!address) {
    throw new Error("VITE_MOCK_CUSD_ADDRESS not set in environment variables");
  }

  return address as `0x${string}`;
}
