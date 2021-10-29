import { Custodian } from './types';
export declare function addCustodiansInteraction(fromCustodian: string, toCustodians: string[]): void;
export declare function incSenderTotal(fromCustodian: string): void;
export declare function incReceiverTotal(toCustodian: string): void;
export declare function processCustodians(insertCustodians: (words: Array<Custodian>) => void, log?: (msg: string) => void): Promise<void>;
