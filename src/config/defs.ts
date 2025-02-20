export type ChainInfoType = {
  id: number;
  nativeCoin: { symbol: string; decimals: number };
  maxTransactionWaitTime: number;
  blockTime: number;
  rpcURLs: string[];
};

export type ChainListDataType = {
  abi: any;
  chainList: Record<string, ChainInfoType>;
};
