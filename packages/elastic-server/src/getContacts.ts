import { contactCollection } from '@klonzo/common'
import { Request, Response } from 'express'

// HTTP GET /contacts
export async function getContacts(req: Request, res: Response): Promise<void> {
  try {
    const contacts = {}
    // const contacts = await db.collection(contactCollection).find().toArray()
    res.json(contacts)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
