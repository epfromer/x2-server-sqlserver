import { EmailSentByDay } from './types'

export const emailSentByDay = new Map()

// Add to emails sent map
export function addToEmailSentByDay(sent: Date, id: string): void {
  const day = sent.toISOString().slice(0, 10)
  if (emailSentByDay.has(day)) {
    emailSentByDay.get(day).push(id)
  } else {
    emailSentByDay.set(day, [id])
  }
}

// Process list for email sent and store in db.
export async function processEmailSentByDay(
  insertEmailSentByDay: (words: Array<EmailSentByDay>) => void,
  log?: (msg: string) => void
): Promise<void> {
  const email: EmailSentByDay[] = []
  emailSentByDay.forEach((value, key) =>
    email.push({ sent: key, emailIds: value })
  )
  email.sort((a, b) => new Date(a.sent).getTime() - new Date(b.sent).getTime())
  if (log) log('processEmailSentByDay: ' + email.length + ' records')
  await insertEmailSentByDay(email)
}
