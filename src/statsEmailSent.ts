/* eslint-disable @typescript-eslint/no-explicit-any */
import * as config from 'config'
import { db, statsEmailSentMap } from './index'

interface StatsEmailSentDoc {
  sent: string
  ids: string[]
}

// Add to emails sent map
export function addToStatsEmailSent(sent: Date, id: string): void {
  const day = sent.toISOString().slice(0, 10)
  if (statsEmailSentMap.has(day)) {
    statsEmailSentMap.get(day).push(id)
  } else {
    statsEmailSentMap.set(day, [id])
  }
}

// Process stats list for email sent and store in db.
export async function processStatsEmailSentMap(): Promise<any> {
  const arr: StatsEmailSentDoc[] = []
  statsEmailSentMap.forEach((value, key) => arr.push({ sent: key, ids: value }))
  await db.collection(config.get('dbStatsEmailSentCollection')).insertMany(arr)
}
