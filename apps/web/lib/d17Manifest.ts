import mainnetDeployment from "@/deployments/mainnet.json";
import sepoliaDeployment from "@/deployments/sepolia.json";
import { CHAIN_ID } from "@/lib/d17Api";

export type PublicDeployment = {
  chainId: number;
  network: "mainnet" | "sepolia";
  startBlock: number;
  contracts: {
    d17Factory: string;
    tokenFactory: string;
    launchFactory: string;
    liquidityVaultFactory: string;
    lockerFactory: string;
  };
  weth: string;
  router: string;
};

export const DEPLOYMENTS: Record<number, PublicDeployment> = {
  11155111: sepoliaDeployment as PublicDeployment,
  1: mainnetDeployment as PublicDeployment,
};

export const PUBLIC_DEPLOYMENT = DEPLOYMENTS[CHAIN_ID];

if (!PUBLIC_DEPLOYMENT) {
  throw new Error(`D17 has no bundled deployment for chain ${CHAIN_ID}`);
}

export const LOCAL_DEPLOYER_SCHEMA = {
  profile: PUBLIC_DEPLOYMENT.network,
  chainId: CHAIN_ID,
  contractVersion: "D17_CURRENT",
  contracts: PUBLIC_DEPLOYMENT.contracts,
  manualDistribution: {
    supportedByCurrentContract: true,
    configField: "manualDistributionTokens",
    recipient: "launch creator / msg.sender",
    maxBpsOfSupply: 1000,
  },
  validation: {
    roundCount: 5,
    refundStageCount: 4,
    tokenNameBytes: { min: 1, max: 64 },
    tokenSymbolBytes: { min: 1, max: 16 },
    descriptionBytes: { max: 512 },
    links: {
      max: 8,
      linkTypeBytes: { max: 32, pattern: "^[a-z0-9-]+$" },
      urlBytes: { max: 128 },
    },
    refundPenaltyBps: { min: 0, max: 5000 },
    treasuryBps: { min: 0, max: 2000 },
    roundSeconds: { length: 5, min: 60, max: 7776000 },
  },
  knownContractGaps: [],
} as const;
