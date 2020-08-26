/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { db } from './index'

// HTTP GET /contacts
export async function getContacts(req: any, res: any): Promise<void> {
  try {
    const contacts = await db
      .collection(config.get('dbContactsCollection'))
      .find()
      .toArray()
    res.json(contacts)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
