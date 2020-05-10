import { PSTFile } from 'pst-extractor'
import { EmailDoc } from './index'
import { walkFolder } from "./walkFolder"

// Processes a PST, storing emails in list.
export function walkPST(filename: string): EmailDoc[] {
  const emails: EmailDoc[] = []
  const pstFile = new PSTFile(filename)
  walkFolder(emails, pstFile.getRootFolder())
  return emails
}
