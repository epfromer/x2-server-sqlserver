import {
  aliasMap,
  Email,
  filteredSenders,
  ONLY_PROCESS_NAMED_CONTACTS,
  possibleHits,
} from '@klonzo/common'
import { PSTMessage } from 'pst-extractor'
import { v4 as uuidv4 } from 'uuid'
import { hash, hashMap } from './hash'
import { hasKeyTerms } from './keyTerms'
import {
  addToContactsInteraction,
  incReceiverTotal,
  incSenderTotal,
} from './processContacts'
import { addToEmailSent } from './processEmailSent'
import { addToWordCloud } from './processWordCloud'

export const ignoredContacts = new Set()
export const possibleContacts = new Set()

// Processes individual email and stores in list.
export function processEmail(email: PSTMessage, emails: Email[]): void {
  // dedupe
  const h = hash(email.body)
  if (hashMap.has(h)) return

  // filter out funky stuff that isn't hot
  const isValidEmail = (email: PSTMessage): boolean | null =>
    email.messageClass === 'IPM.Note' &&
    email.clientSubmitTime !== null &&
    email.clientSubmitTime > new Date(1999, 0, 1) &&
    email.clientSubmitTime < new Date(2002, 3, 1) &&
    (email.senderName.trim() !== '' ||
      email.senderEmailAddress.trim() !== '') &&
    filteredSenders.indexOf(email.senderName.trim()) < 0
  if (!isValidEmail(email)) return

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

  // check if the doc has any key terms / fraudulent project names
  const hotDoc = hasKeyTerms(email)

  // load only email involving contacts?
  if (!hotDoc && ONLY_PROCESS_NAMED_CONTACTS && !fromContact && !toContact) {
    return
  }

  // if (config.get('verbose')) {
  //   console.log(`${sent} From: ${from}, To: ${to}, Subject: ${subject}`)
  // }

  // add to db
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sent = email.clientSubmitTime!
  const id = uuidv4()
  if (fromContact && toContact) {
    addToContactsInteraction(fromContact, toContact, id, sent)
  }
  if (fromContact) incSenderTotal(fromContact)
  if (toContact) incReceiverTotal(toContact)
  addToEmailSent(sent, id)
  addToWordCloud(email)

  const prettifyAddress = (address: string): string => {
    return address.split('@').join(' @')
  }

  // add to list to be inserted later
  emails.push({
    id,
    sent,
    from: prettifyAddress(email.senderName),
    fromContact,
    to: prettifyAddress(email.displayTo),
    toContact,
    cc: email.displayCC,
    bcc: email.displayBCC,
    subject: email.subject,
    body: email.body,
  })

  // add to dedupe map
  hashMap.set(h, email.body)
}
