/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { db } from './index'

export const emailSent = new Map()

interface EmailSentDoc {
  sent: string
  ids: string[]
}

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
  const arr: EmailSentDoc[] = []
  emailSent.forEach((value, key) => arr.push({ sent: key, ids: value }))
  console.log('processEmailSent: ' + arr.length + ' records')
  await db.collection(config.get('dbEmailSentCollection')).insertMany(arr)
}
