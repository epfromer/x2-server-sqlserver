import { emailSentByDayCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import { db } from './index'

// HTTP GET /emailsent
export async function getEmailSentByDay(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const emailSentByDay = await db
      .collection(emailSentByDayCollection)
      .find()
      .sort({ sent: 1 })
      .toArray()
    res.json(
      emailSentByDay.map((day) => ({
        sent: day.sent,
        emailIds: day.emailIds,
      }))
    )
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}
