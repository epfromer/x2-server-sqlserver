import { PSTMessage } from 'pst-extractor'

// Process sender
export function processFrom(email: PSTMessage): string {
  let from = email.senderName
  if (
    from !== email.senderEmailAddress &&
    email.senderEmailAddress.indexOf('IMCEANOTES') < 0
  ) {
    from += ' (' + email.senderEmailAddress + ')'
  }
  return from
}
