/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { aliasMap, contacts } from './contacts'
import { db, log } from './index'

export const contactsMap = new Map()

// walk to and from and store in contacts
export function addToStatsContacts(
  fromContact: string,
  toContact: string,
  id: string,
  sent: Date
): void {
  const receivers = toContact.split(';').map((i) => i.trim())

  // for the sender, add EmailSent
  const i = contacts.findIndex((c) => c.name === fromContact)
  contacts[i].asSender.push({ id, to: receivers, sent })

  // for each receiver, add EmailReceived
  receivers.forEach((r) => {
    const j = contacts.findIndex((c) => c.name === r)
    contacts[j].asReceiver.push({ id, from: fromContact, sent })
  })
}

// Process stats list for word cloud and store in db.
export async function processStatsContacts(): Promise<any> {
  log.info('processStatsContacts: ' + contacts.length + ' contacts')
  await db
    .collection(config.get('dbStatsContactsCollection'))
    .insertMany(contacts)
}
