import { PSTMessage } from 'pst-extractor';
import { WordCloudTag } from './types';
export declare function addToWordCloud(email: PSTMessage, fromCustodian: string, toCustodians: string): void;
export declare function processWordCloud(insertWordCloud: (words: Array<WordCloudTag>) => void, log?: (msg: string) => void): Promise<void>;
