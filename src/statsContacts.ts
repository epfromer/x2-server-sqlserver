import { PSTMessage } from 'pst-extractor'
import { v4 as uuidv4 } from 'uuid'
import { contacts, aliasMap } from './contacts'

export const contactsMap = new Map()

const processName = (name: string): string => {
  let names = name.split(' ')

  // remove some junk
  names = names.filter((name) => name !== '')
  names = names.filter((name) => name !== '(e-mail)')

  // if 1 item (like email address) just return it
  if (names.length === 1) return name
  
  names = names.map((name) => name[0].toUpperCase() + name.slice(1))
  const lastName = names.pop() + ','
  names.unshift(lastName)
  let fullName = names.join(' ')

  // remove some junk
  fullName = fullName.replace(/[\.\'\"]/g, '')

  return fullName
}

//
export function addToStatsContacts(
  to: string,
  from: string,
  emailId: string
): void {
  // console.log(to)
  let arrTo = to.toLowerCase().split(';')
  arrTo = arrTo.map((s) => s.trim())
  arrTo.map((s) => {
    const name = processName(s)
    if (!aliasMap.has(name)) {
      console.log(`{ name: '${name}', aliases: [] },`)
    }
  })

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
