import { EmailSentByDay } from './types';
export declare const emailSentByDay: Map<any, any>;
export declare function incEmailSentByDay(sent: Date): void;
export declare function processEmailSentByDay(insertEmailSentByDay: (words: Array<EmailSentByDay>) => void, log?: (msg: string) => void): Promise<void>;
