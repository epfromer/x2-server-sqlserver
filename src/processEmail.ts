import { PSTMessage } from 'pst-extractor'
import { v4 as uuidv4 } from 'uuid'
import { aliasMap, possibleHits } from './contacts'
import { hash, hashMap } from './hash'
import { EmailDoc } from './index'
import { addToStatsContacts } from './statsContacts'
import { addToStatsEmailSent } from './statsEmailSent'
import { addToStatsWordCloud } from './statsWordCloud'
import * as config from 'config'

export const ignoredContacts = new Set()
export const possibleContacts = new Set()

// Processes individual email and stores in list.
export function processEmail(email: PSTMessage, emails: EmailDoc[]): void {
  const isValidEmail = (email: PSTMessage): boolean | null =>
    email.messageClass === 'IPM.Note' &&
    email.clientSubmitTime !== null &&
    email.clientSubmitTime > new Date(1990, 0, 1) &&
    (email.senderName.trim() !== '' || email.senderEmailAddress.trim() !== '')
  if (!isValidEmail(email)) return

  // dedupe
  const h = hash(email.body)
  if (hashMap.has(h)) return
  hashMap.set(h, email.body)

  // check for key contacts
  const getContacts = (s: string): string[] => {
    let potentialContacts = s.toLowerCase().trim().split(';')
    potentialContacts = potentialContacts.map((contact) => contact.trim())
    potentialContacts = potentialContacts.filter((contact) => contact !== '')
    const foundContacts: string[] = []
    potentialContacts.forEach((contact) => {
      if (aliasMap.has(contact)) {
        foundContacts.push(aliasMap.get(contact))
      } else {
        ignoredContacts.add(contact)
        possibleHits.forEach((h) => {
          if (contact.indexOf(h) >= 0) possibleContacts.add(contact)
        })
      }
    })
    return foundContacts
  }

  // get contacts for to/from fields
  const senderNameContacts = getContacts(email.senderName)
  const senderEmailAddressContacts = getContacts(email.senderEmailAddress)
  const displayToContacts = getContacts(email.displayTo)
  const displayCCContacts = getContacts(email.displayCC)
  const displayBCCContacts = getContacts(email.displayBCC)

  // combine into strings
  let fromContact = ''
  if (senderNameContacts.length) {
    fromContact = senderNameContacts[0]
  } else if (senderEmailAddressContacts.length) {
    fromContact = senderEmailAddressContacts[0]
  }
  const toContact = displayToContacts
    .concat(displayCCContacts, displayBCCContacts)
    .join('; ')

  // load only email involving contacts?
  if (config.get('onlyContacts') && !fromContact && !toContact) return

  // if (config.get('verbose')) {
  //   log.info(`${sent} From: ${from}, To: ${to}, Subject: ${subject}`)
  // }

  // add to stats
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sent = email.clientSubmitTime!
  const id = uuidv4()
  if (fromContact && toContact) {
    addToStatsContacts(fromContact, toContact, id, sent)
  }
  addToStatsEmailSent(sent, id)
  addToStatsWordCloud(email)

  // add to list to be inserted later
  emails.push({
    id,
    sent,
    from: email.senderName,
    fromContact,
    to: email.displayTo,
    toContact,
    cc: email.displayCC,
    bcc: email.displayBCC,
    subject: email.subject,
    body: email.body,
  })
}
