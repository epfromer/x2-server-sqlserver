/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { db } from './index'

export async function getEmailSent(eq: any, res: any): Promise<void> {
  try {
    const emailSent = await db
      .collection(config.get('dbEmailSentCollection'))
      .find()
      .sort({ sent: 1 })
      .toArray()
    res.json(emailSent)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
