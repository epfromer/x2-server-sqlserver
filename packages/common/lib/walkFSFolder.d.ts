import { Email } from './types';
export declare function walkFSfolder(fsFolder: string, insertEmails: (emails: Email[]) => void, log?: (msg: string) => void): Promise<number>;
export declare function getNumPSTs(fsFolder: string): number;
