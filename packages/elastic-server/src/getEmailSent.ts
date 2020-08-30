import { emailSentCollection } from '@klonzo/common'
import { Request, Response } from 'express'

export async function getEmailSent(eq: Request, res: Response): Promise<void> {
  try {
    // const emailSent = await db
    //   .collection(emailSentCollection)
    //   .find()
    //   .sort({ sent: 1 })
    //   .toArray()
    const emailSent = {}
    res.json(emailSent)
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
