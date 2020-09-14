import { custodians } from './custodians'
import { Custodian } from './types'

export function addCustodiansInteraction(
  fromCustodian: string,
  toCustodians: string[],
  emailId: string
): void {
  // for the sender, add EmailSentToCustodians
  custodians
    .find((c) => c.id === fromCustodian)
    .toCustodians.push({ emailId, custodianIds: toCustodians })

  // for each receiver, add EmailReceivedFromCustodians
  toCustodians.forEach((toc) => {
    custodians
      .find((c) => c.id === toc)
      .fromCustodians.push({ emailId, custodianId: fromCustodian })
  })
}

// add to totals for Custodians
export function incSenderTotal(fromCustodian: string): void {
  custodians.find((c) => c.id === fromCustodian).senderTotal++
}
export function incReceiverTotal(toCustodian: string): void {
  custodians.find((c) => c.id === toCustodian).receiverTotal++
}

// Process list for Custodians and store in db.
export async function processCustodians(
  insertCustodians: (words: Array<Custodian>) => void,
  log?: (msg: string) => void
): Promise<void> {
  if (log) log('processCustodians: ' + custodians.length + ' Custodians')
  await insertCustodians(custodians)
}
