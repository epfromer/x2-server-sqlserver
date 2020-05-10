import * as config from 'config'
import { PSTMessage } from 'pst-extractor'
import { v4 as uuidv4 } from 'uuid'
import { hash, hashMap } from './hash'
import { EmailDoc } from './index'
import { addToStatsContacts, ContactsInteraction } from './statsContacts'
import { addToStatsEmailSent } from './statsEmailSent'
import { addToStatsWordCloud } from './statsWordCloud'

// let i = 0
// Processes individual email and stores in list.
export function processEmail(email: PSTMessage, emails: EmailDoc[]): void {
  // if (email.messageClass !== 'IPM.Note') return
  // console.log('--------------')
  // console.log('senderName', email.senderName)
  // console.log('senderEmailAddress', email.senderEmailAddress)
  // console.log('displayTo', email.displayTo)
  // if (++i > 15) throw 'foo'
  const massageFrom = (email: PSTMessage): string => {
    let from = email.senderName
    if (
      from !== email.senderEmailAddress &&
      email.senderEmailAddress.indexOf('IMCEANOTES') < 0
    ) {
      from += ' (' + email.senderEmailAddress + ')'
    }
    return from
  }

  const isValidEmail = (email: PSTMessage): boolean | null =>
    email.messageClass === 'IPM.Note' &&
    email.clientSubmitTime != null &&
    email.clientSubmitTime > new Date(1990, 0, 1) &&
    email.senderName.trim() != '' &&
    email.displayTo.trim() != ''

  if (!isValidEmail(email)) return

  // dedupe
  const h = hash(email.body)
  if (hashMap.has(h)) return
  hashMap.set(h, email.body)

  const id = uuidv4()
  const bcc = email.displayBCC
  const cc = email.displayCC
  const subject = email.subject
  const body = email.body

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sent = email.clientSubmitTime!
  const to = email.displayTo
  const from = massageFrom(email)

  if (config.get('verbose')) {
    console.log(`${sent} From: ${from}, To: ${to}, Subject: ${subject}`)
  }

  // add to contacts
  const contactsInteraction = addToStatsContacts(from, to, id, sent)
  let fromContact = ''
  let toContact: string[] = []
  if (contactsInteraction) {
    fromContact = contactsInteraction.fromContact
    toContact = contactsInteraction.toContact
  }

  // add to stats
  addToStatsEmailSent(sent, id)
  addToStatsWordCloud(body)

  // add to list to be inserted later
  emails.push({
    id,
    sent,
    from,
    fromContact,
    to,
    toContact,
    cc,
    bcc,
    subject,
    body,
  })
}
