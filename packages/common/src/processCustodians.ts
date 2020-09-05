import { custodians } from './custodians'
import { Custodian } from './types'

export const custodiansMap = new Map()

// walk to and from and store in Custodians
export function addToCustodiansInteraction(
  fromCustodian: string,
  toCustodian: string,
  id: string,
  sent: Date
): void {
  const receivers = toCustodian.split(';').map((i) => i.trim())

  // for the sender, add EmailSent
  const i = custodians.findIndex((c) => c.name === fromCustodian)
  custodians[i].toCustodians.push({ id, to: receivers, sent })

  // for each receiver, add EmailReceived
  receivers.forEach((r) => {
    const j = custodians.findIndex((c) => c.name === r)
    custodians[j].fromCustodians.push({ id, from: fromCustodian, sent })
  })
}

// add to totals for named Custodians
export function incSenderTotal(fromCustodian: string): void {
  const i = custodians.findIndex((c) => c.name === fromCustodian)
  custodians[i].senderTotal++
}
export function incReceiverTotal(toCustodian: string): void {
  const receivers = toCustodian.split(';').map((i) => i.trim())
  receivers.forEach((r) => {
    const i = custodians.findIndex((c) => c.name === r)
    custodians[i].receiverTotal++
  })
}

// Process list for Custodians and store in db.
export async function processCustodians(
  insertCustodians: (words: Array<Custodian>) => void
): Promise<void> {
  console.log('processCustodians: ' + custodians.length + ' Custodians')
  await insertCustodians(custodians)
}
