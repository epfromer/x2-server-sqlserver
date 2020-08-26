import { EmailSentREMOVE, EMAIL_SENT_COLLECTION } from '@klonzo/common'
import { db } from './index'

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
export async function processEmailSent(): Promise<any> {
  const arr: EmailSentREMOVE[] = []
  emailSent.forEach((value, key) => arr.push({ sent: key, ids: value }))
  console.log('processEmailSent: ' + arr.length + ' records')
  await db.collection(EMAIL_SENT_COLLECTION).insertMany(arr)
}
