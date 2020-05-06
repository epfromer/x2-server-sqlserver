import { PSTMessage } from 'pst-extractor'
import { v4 as uuidv4 } from 'uuid'

export const contactsMap = new Map()
export const aliasesMap = new Map()

//
export function addToStatsContacts(
  to: string,
  from: string,
  emailId: string
): void {



  console.log(to)

  // if (nameToFromMap.has(from)) {
  //   // get and add to from list
  // } else {
  //   const toFromId = uuidv4()
  //   nameToFromMap.set(from, toFromId)
  //   toFromMap.set(toFromId, {
  //     id: toFromId,
  //     name: from,
  //     sender: true,
  //     receiver: false,
  //     to: [
  //       {
  //         // list of recipients/to
  //       },
  //     ],
  //     from: [],
  //   })
  // }
}
