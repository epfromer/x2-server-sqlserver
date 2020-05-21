/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { keyContacts } from './keyContacts'
import { db } from './index'

export const contactsMap = new Map()

// walk to and from and store in contacts
export function addToContactsInteraction(
  fromContact: string,
  toContact: string,
  id: string,
  sent: Date
): void {
  const receivers = toContact.split(';').map((i) => i.trim())

  // for the sender, add EmailSent
  const i = keyContacts.findIndex((c) => c.name === fromContact)
  keyContacts[i].asSender.push({ id, to: receivers, sent })

  // for each receiver, add EmailReceived
  receivers.forEach((r) => {
    const j = keyContacts.findIndex((c) => c.name === r)
    keyContacts[j].asReceiver.push({ id, from: fromContact, sent })
  })
}

// add to totals for named contacts
export function incSenderTotal(fromContact: string): void {
  const i = keyContacts.findIndex((c) => c.name === fromContact)
  keyContacts[i].senderTotal++
}
export function incReceiverTotal(toContact: string): void {
  const receivers = toContact.split(';').map((i) => i.trim())
  receivers.forEach((r) => {
    const i = keyContacts.findIndex((c) => c.name === r)
    keyContacts[i].receiverTotal++
  })
}

// Process list for word cloud and store in db.
export async function processContacts(): Promise<any> {
  console.log('processContacts: ' + keyContacts.length + ' contacts')
  await db
    .collection(config.get('dbContactsCollection'))
    .insertMany(keyContacts)
}
