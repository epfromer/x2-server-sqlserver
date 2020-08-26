import { Email } from '@klonzo/common'
import { PSTFile } from 'pst-extractor'
import { walkFolder } from './walkFolder'

// Processes a PST, storing emails in list.
export function walkPST(filename: string): Email[] {
  const emails: Email[] = []
  const pstFile = new PSTFile(filename)
  walkFolder(emails, pstFile.getRootFolder())
  return emails
}
