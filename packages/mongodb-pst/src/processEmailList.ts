import * as config from 'config'
import { db, EmailDoc } from './index'

// Process email list to store in db.
export async function processEmailList(emailList: EmailDoc[]): Promise<any> {
  await db.collection(config.get('dbEmailCollection')).insertMany(emailList)
}
