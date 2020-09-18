import { dbName, emailSentByDayCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import * as mongodb from 'mongodb'

// HTTP GET /emailsentbyday
export async function getEmailSentByDay(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const client = await mongodb.MongoClient.connect(process.env.MONGODB_HOST, {
      useUnifiedTopology: false,
    })
    const db = client.db(dbName)
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
