import { emailCollection } from '@klonzo/common'
import { Request, Response } from 'express'
import { db } from './index'

// HTTP GET /email/<id>
export async function getSpecificEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const email = await db
      .collection(emailCollection)
      .findOne({ id: req.params.id })
    res.json({
      id: email.id,
      sent: email.sent,
      sentShort: new Date(email.sent).toISOString().slice(0, 10),
      from: email.from,
      fromCustodian: email.fromCustodian,
      to: email.to,
      toCustodians: email.toCustodians,
      cc: email.cc,
      bcc: email.bcc,
      subject: email.subject,
      body: email.body,
    })
  } catch (err) {
    console.error(err.stack)
    res.status(404).send(err.msg)
  }
}
