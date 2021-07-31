import { Account } from '../../services/wallet/wallet';
import { Template } from 'kukai-embed';
export interface PrepareRequest {
  account: Account;
  tokenTransfer: string;
  symbol: string;
}
export interface TemplateRequest {
  template: Template;
  ops?: FullyPreparedTransaction[];
  partialOps?: PartiallyPreparedTransaction[];
  fee?: TemplateFee;
}
export interface TemplateFee {
  network: string;
  storage: string;
  total: string;
}

export interface ConfirmRequest {
  account: Account;
  tokenTransfer: string;
  transactions: FullyPreparedTransaction[];
  externalReq: boolean
}
export interface PartiallyPreparedTransaction {
  kind: 'transaction';
  amount: string;
  destination: string;
  parameters?: any;
  meta?: {
    alias: string;
    verifier: string;
    twitterId?: string;
  };
  gasRecommendation?: string;
  storageRecommendation?: string;
}
export interface FullyPreparedTransaction extends PartiallyPreparedTransaction {
  fee: string;
  gasLimit: string;
  storageLimit: string;
}
