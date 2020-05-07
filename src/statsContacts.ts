/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { aliasMap, contacts } from './contacts'
import { db } from './index'

export const contactsMap = new Map()

// prettify name as best we can
const processName = (name: string): string => {
  let names = name.split(' ')

  // remove some junk
  names = names.filter((name) => name !== '')
  names = names.filter((name) => name !== '(e-mail)')

  // if 1 item (like email address) just return it
  if (names.length === 1) return name

  names = names.map((name) => name[0].toUpperCase() + name.slice(1))
  const lastName = names.pop() + ','
  names.unshift(lastName)
  let fullName = names.join(' ')

  // remove some junk
  fullName = fullName.replace(/[\.\'\"]/g, '')

  return fullName
}

// walk to and from and store in contacts
export function addToStatsContacts(
  from: string,
  to: string,
  id: string,
  sent: Date
): void {
  // start with 'from' / sender, punt if not in our interest list
  const sender = processName(from)
  if (!aliasMap.has(sender)) return

  // process 'to' / receivers, storing ones in our interest list
  let arrTo = to.toLowerCase().split(';')
  arrTo = arrTo.map((s) => s.trim())
  const receivers: string[] = []
  arrTo.map((s) => {
    const toName = processName(s)
    if (aliasMap.has(toName)) {
      receivers.push(aliasMap.get(toName))
      // console.log(`{ name: '${toName}', aliases: [] },`)
    }
  })

  if (!receivers.length) return

  // for the sender, add EmailSent
  const i = contacts.findIndex((c) => c.name === aliasMap.get(sender))
  // console.log(contacts[i].name)
  contacts[i].asSender.push({ id, to: receivers, sent })

  // for each receiver, add EmailReceived
  receivers.forEach((r) => {
    const j = contacts.findIndex((c) => c.name === r)
    contacts[j].asReceiver.push({ id, from: sender, sent })
  })
}

// Process stats list for word cloud and store in db.
export async function processStatsContacts(): Promise<any> {
  console.log('processStatsContacts: ' + contacts.length + ' contacts')
  await db
    .collection(config.get('dbStatsContactsCollection'))
    .insertMany(contacts)
}
