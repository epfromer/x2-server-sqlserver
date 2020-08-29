import { EmailSentREMOVE } from './types'

export const emailSent = new Map()

// Add to emails sent map
export function addToEmailSent(sent: Date, id: string): void {
  const day = sent.toISOString().slice(0, 10)
  if (emailSent.has(day)) {
    emailSent.get(day).push(id)
  } else {
    emailSent.set(day, [id])
  }
}

// Process list for email sent and store in db.
export async function processEmailSent(
  insertEmailSent: (words: Array<EmailSentREMOVE>) => void
): Promise<void> {
  const email: EmailSentREMOVE[] = []
  emailSent.forEach((value, key) => email.push({ sent: key, ids: value }))
  console.log('processEmailSent: ' + email.length + ' records')
  await insertEmailSent(email)
}
