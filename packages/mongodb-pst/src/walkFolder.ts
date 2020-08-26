import { Email } from '@klonzo/common'
import { PSTFolder, PSTMessage } from 'pst-extractor'
import { processEmail } from './processEmail'

// let i = 0
// const maxNum = 200

// Walk the folder tree recursively and process emails, storing in email list.
export function walkFolder(emails: Email[], folder: PSTFolder): void {
  if (folder.hasSubfolders) {
    const childFolders: PSTFolder[] = folder.getSubFolders()
    for (const childFolder of childFolders) {
      walkFolder(emails, childFolder)
    }
  }
  if (folder.contentCount > 0) {
    let email: PSTMessage = folder.getNextChild()
    while (email != null) {
      // while (email != null && i++ < maxNum) {
      processEmail(email, emails)
      email = folder.getNextChild()
    }
  }
}
