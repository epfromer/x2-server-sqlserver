import { aliasMap, filteredSenders, possibleHits } from './custodians'
import { Email } from './types'
import { namedCustodiansOnly } from './constants'
import { PSTMessage } from 'pst-extractor'
import { v4 as uuidv4 } from 'uuid'
import { hash, hashMap } from './hash'
import { hasTerms } from './terms'
import {
  addToCustodiansInteraction,
  incReceiverTotal,
  incSenderTotal,
} from './processCustodians'
import { addToEmailSent } from './processEmailSent'
import { addToWordCloud } from './processWordCloud'

export const ignoredCustodians = new Set()
export const possibleCustodians = new Set()

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

  // check for key Custodians
  const getCustodians = (s: string): string[] => {
    let potentialCustodians = s.toLowerCase().trim().split(';')
    potentialCustodians = potentialCustodians.map((Custodian) =>
      Custodian.trim()
    )
    potentialCustodians = potentialCustodians.filter(
      (Custodian) => Custodian !== ''
    )
    const foundCustodians: string[] = []
    potentialCustodians.forEach((Custodian) => {
      if (aliasMap.has(Custodian)) {
        foundCustodians.push(aliasMap.get(Custodian))
      } else {
        ignoredCustodians.add(Custodian)
        possibleHits.forEach((h) => {
          if (Custodian.indexOf(h) >= 0) possibleCustodians.add(Custodian)
        })
      }
    })
    return foundCustodians
  }

  // get Custodians for to/from fields
  const senderNameCustodians = getCustodians(email.senderName)
  const senderEmailAddressCustodians = getCustodians(email.senderEmailAddress)
  const displayToCustodians = getCustodians(email.displayTo)
  const displayCCCustodians = getCustodians(email.displayCC)
  const displayBCCCustodians = getCustodians(email.displayBCC)

  // combine into strings
  let fromCustodian = ''
  if (senderNameCustodians.length) {
    fromCustodian = senderNameCustodians[0]
  } else if (senderEmailAddressCustodians.length) {
    fromCustodian = senderEmailAddressCustodians[0]
  }
  const toCustodian = displayToCustodians
    .concat(displayCCCustodians, displayBCCCustodians)
    .join('; ')

  // check if the doc has any key terms / fraudulent project names
  const hotDoc = hasTerms(email)

  // load only email involving Custodians?
  if (!hotDoc && namedCustodiansOnly && !fromCustodian && !toCustodian) {
    return
  }

  // if (config.get('verbose')) {
  //   console.log(`${sent} From: ${from}, To: ${to}, Subject: ${subject}`)
  // }

  // add to db
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const sent = email.clientSubmitTime!
  const id = uuidv4()
  if (fromCustodian && toCustodian) {
    addToCustodiansInteraction(fromCustodian, toCustodian, id, sent)
  }
  if (fromCustodian) incSenderTotal(fromCustodian)
  if (toCustodian) incReceiverTotal(toCustodian)
  addToEmailSent(sent, id)
  addToWordCloud(email)

  const prettifyAddress = (address: string): string => {
    return address.split('@').join(' @')
  }

  // add to list to be inserted later
  emails.push({
    id,
    sent,
    sentShort: new Date(sent).toISOString().substring(0, 10),
    from: prettifyAddress(email.senderName),
    fromCustodian,
    to: prettifyAddress(email.displayTo),
    toCustodian,
    cc: email.displayCC,
    bcc: email.displayBCC,
    subject: email.subject,
    body: email.body,
  })

  // add to dedupe map
  hashMap.set(h, email.body)
}
