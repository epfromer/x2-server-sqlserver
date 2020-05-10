import { PSTFolder, PSTMessage } from 'pst-extractor'
import { processEmail } from './processEmail'
import { EmailDoc } from './index'

// Walk the folder tree recursively and process emails, storing in email list.
export function walkFolder(emails: EmailDoc[], folder: PSTFolder): void {
  if (folder.hasSubfolders) {
    const childFolders: PSTFolder[] = folder.getSubFolders()
    for (const childFolder of childFolders) {
      walkFolder(emails, childFolder)
    }
  }
  if (folder.contentCount > 0) {
    let email: PSTMessage = folder.getNextChild()
    while (email != null) {
      processEmail(email, emails)
      email = folder.getNextChild()
    }
  }
}
