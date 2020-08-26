import { Email, EMAIL_COLLECTION } from '@klonzo/common'
import { db } from './index'

// Process email list to store in db.
export async function processEmailList(emailList: Email[]): Promise<any> {
  await db.collection(EMAIL_COLLECTION).insertMany(emailList)
}
