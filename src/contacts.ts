/*
  This is a list of players in the Enron dataset.  

  See README for list of these people, their roles, etc.
*/

export interface EmailSent {
  id: string
  to: string[]
  sent: Date
}

export interface EmailReceived {
  id: string
  from: string
  sent: Date
}

export interface Contact {
  asSender: EmailSent[]
  asReceiver: EmailReceived[]
  name: string
  aliases: string[]
}

export interface Alias {
  name: string
  aliases: string[]
}

//  { name: '', aliases: [] },

const aliases: Alias[] = [
  { name: 'Fleming, Rosalee', aliases: ['Rosalee Fleming'] },
  {
    name: 'Baxter, Cliff',
    aliases: [
      'cliff baxter',
      'cbaxter@enron.com',
      'Baxter@ect, Cliff',
      'Cliff, Baxter',
      'cliff baxter@ect',
      'baxter  cliff  aep',
      'baxter  cliff',
      'baxter',
    ],
  },
  { name: 'Boyle, Dan', aliases: [] },
  {
    name: 'Belden, Tim',
    aliases: [
      'belden',
      'belden  tim',
      'tim.belden@enron.com',
      'tim belden',
      'tim belden/hou/ect@ect',
    ],
  },
  { name: 'Bennett, Robert', aliases: [] },
  { name: 'Berardino, Joseph', aliases: [] },
  {
    name: 'Causey, Richard',
    aliases: [
      'richard causey@enron',
      'richard causey',
      'causey',
      'Causey@enron, Richard',
      'Richard, Causey',
      'causey  richard',
    ],
  },
  {
    name: 'Dasovich, Jeff',
    aliases: ['dasovich', 'dasovich  jeff', 'jeff.dasovich@enron.com'],
  },
  { name: 'Ellen, Philip', aliases: ['ellen'] },
  {
    name: 'Fastow, Andrew',
    aliases: [
      'andy fastow',
      'andrew s fastow',
      'Fastow, Andy',
      'Fastow, Andrew S',
      'Andrew, Fastow',
      'fastow  andrew',
      'andrew.fastow@enron.com',
    ],
  },
  { name: 'Fastow, Lea', aliases: [] },
  {
    name: 'Frevert, Mark',
    aliases: [
      'frevert  mark',
      'mark frevert@enron',
      'Mark, Frevert',
      'mark frevert',
      'mark.frevert@enron.com',
    ],
  },
  {
    name: 'Glisan, Ben',
    aliases: [
      'ben.glisan@enron.com',
      'glisan  ben',
      'Glisan, Ben F',
      'Ben, Glisan',
      'ben f glisan',
      'ben glisan',
      'ben glisan/hou/ect@ect',
    ],
  },
  {
    name: 'Kitchen, Louise',
    aliases: [
      'kitchen  louise',
      'lkitchen@enron.com',
      'louise kitchen',
      'kitchen',
      'louise.kitchen@enron.com',
      'louise kitchen (e-mail)',
      'louise kitchen/hou/ect@ect',
    ],
  },
  { name: 'Kopper, Michael', aliases: [] },
  { name: 'Lavoreto, John', aliases: [] },
  {
    name: 'Lay, Kenneth',
    aliases: [
      'kenneth l. lay - enron',
      'kenneth l. lay/enron',
      'kenneth lay (e-mail)',
      'kenneth l. lay (e-mail)',
      'lay  kenneth l.',
      'lay  kenneth',
      'dr. kenneth lay',
      'kenneth  lay',
      'ken lay (e-mail)',
      'ken lay',
      'kenneth l. lay',
      'lay  ken',
      'kenneth lay@enron',
      'kenneth l. lay',
      'lay  ken',
      'Chairman, Office Of The',
      'Chairman, Enron Office Of The',
      'Board@enron, Ken Lay- Chairman Of The',
      'kenlay@enron.com',
      'k.lay@enron.com',
      'Lay, Dr Kenneth',
      'L, Lay Kenneth',
      'Enron, Kenneth L Lay -',
      'k.l.lay@enron.com',
      'k.lay@enron.com',
      'k_lay@enron.com',
      'lay@enroncom, Ken',
      'klay@enron.com.',
      'klay@enron',
      'ken',
      'Lay/enron, Kenneth L',
      'Lay@enron, Ken',
      'lay',
      'kennethlay@enron.com',
      'kenneth_lay@enron.net',
      'kenneth.l.lay@enron.com',
      'kenneth',
      'ken_lay@enron.net',
      'ken.lay@enron.com',
      'Ken, Lay',
      'ken_lay@enron.com',
      'Lay@enron, Kenneth',
      'Lay, Kenneth L',
      'Chairman, Ken Lay - Office Of The',
      'kenneth.lay@enron.com',
      'kenneth_lay@enron.com',
      'layk@enron.com',
      'klay@enron.com',
      'Lay, Ken',
      'Kenneth, Lay',
      'kenneth lay',
      'ken lay@enron',
      'ken lay- chairman of the board@enron',
      'ken .lay@enron.com',
      'ken lay - office of the chairman',
      'mbx_klayofficechair@enron.com ',
      'ken lay-@enron',
    ],
  },
  {
    name: 'McMahon, Jeffrey',
    aliases: [
      'jeffrey.mcmahon@enron.com',
      'mcmahon  jeffrey',
      'jeffrey mcmahon',
      'jeffrey mcmahon@ect',
      'jeff mcmahon - president & coo',
      'mbx_anncjmcmahon@enron.com',
      'mcmahon',
    ],
  },
  {
    name: 'Presto, Kevin',
    aliases: [
      'presto',
      'presto  kevin m.',
      'kevin.m.presto@enron.com',
      'kevin m presto',
      'kevin m. presto',
    ],
  },
  {
    name: 'Skilling, Jeff',
    aliases: [
      'jeffrey k skilling@enron',
      'jeff skilling@enron',
      'jskilli@enron.com',
      'Skilling@enron, Jeffrey K',
      'Skilling@enron, Jeff',
      'Jeff, Skilling',
      'Skilling, Jeffrey',
      'jeff skilling',
      'jeffrey skilling',
      'skilling  jeff',
      'jeffreyskilling@yahoo.com',
      'ken lay and jeff skilling',
      'ken lay and jeff skilling@enron',
    ],
  },
  {
    name: 'Symes, Kate',
    aliases: [
      'symes  kate',
      'kate.symes@enron.com',
      'symes',
      'kate symes',
      'kate symes/pdx/ect@ect',
    ],
  },
  {
    name: 'Whalley, Greg',
    aliases: [
      'greg whalley',
      'gwhalle@enron.com',
      'gwhalley@enron.com',
      'Greg, Whalley',
      'whalley  greg',
      'whalley',
    ],
  },
]

// set up contacts list from aliases, and map for quick access to contact
export const possibleHits = [
  'baxter',
  'boyle',
  'belden',
  'bennett',
  'berardino',
  'causey',
  'daso',
  'ellen',
  'fastow',
  'frevert',
  'glisan',
  'kitchen',
  'kopper',
  'lavoreto',
  'lay',
  'mcmahon',
  'presto',
  'skilling',
  'symes',
  'whalley',
]
export const contacts: Contact[] = []
export const aliasMap = new Map()
aliases.map((contact) => {
  contacts.push({ asSender: [], asReceiver: [], ...contact })
  contact.aliases.map((alias) => {
    aliasMap.set(alias.toLowerCase(), contact.name)
  })
  aliasMap.set(contact.name.toLowerCase(), contact.name)
})
