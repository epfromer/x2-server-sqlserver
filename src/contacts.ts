/* eslint-disable prettier/prettier */
/*
  This is a list of players in the Enron dataset.  

  For more details, consult these articles:

  https://www.theguardian.com/business/2002/jan/13/corporatefraud.enron
  https://www.foxnews.com/story/fast-facts-key-enron-players
  https://rodgersnotes.wordpress.com/2013/11/19/enron-email-analysis-persons-of-interest/
  https://www.infosys.tuwien.ac.at/team/dschall/email/enron-employees.txt
  https://pdfs.semanticscholar.org/4d7d/8fe43f391a966e0e15b68e6509fe6b533540.pdf

  The key players are:

  Lay, Kenneth
  Fastow, Andrew S
  Skilling, Jeff
  
  This list is used to make analysis easier, and combines the myriad differences on spellings to a single
  pretty human-readable form of lastname, firstname.
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

export const contacts: Contact[] = [
{ asSender: [], asReceiver: [], name: 'Bannantine, James M', aliases: ['jbannan@enron.com'] },
{ asSender: [], asReceiver: [], name: 'Baxter, Cliff', aliases: ['cbaxter@enron.com', 'Baxter@ect, Cliff', 'Cliff, Baxter'] },    
{ asSender: [], asReceiver: [], name: 'Bhatnagar, Sanjay', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Bibi, Philippe A', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Blachman, Jeremy', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Bradley, Rob', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Brown, Katherine', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Buy, Rick', aliases: [] },        
{ asSender: [], asReceiver: [], name: 'Causey, Richard', aliases: ['causey', 'Causey@enron, Richard', 'Richard, Causey',] },  
{ asSender: [], asReceiver: [], name: 'Clark, Mary', aliases: ['Mary, Clark',] },
{ asSender: [], asReceiver: [], name: 'Culver, Anne', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Delainey, David W', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Fastow, Andrew', aliases: ['Fastow, Andy','Fastow, Andrew S', 'Andrew, Fastow',] },
{ asSender: [], asReceiver: [], name: 'Fitch, Gary', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Fitzgerald, Jay', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Fleming, Rosalee', aliases: ['Rosalee, Fleming', ] },
{ asSender: [], asReceiver: [], name: 'Frevert, Mark', aliases: ['Mark, Frevert',] },
{ asSender: [], asReceiver: [], name: 'Garten, Jeffrey', aliases: ['Jeffrey, Garten',] },
{ asSender: [], asReceiver: [], name: 'Glisan, Ben', aliases: ['Glisan, Ben F', 'Ben, Glisan',] },
{ asSender: [], asReceiver: [], name: 'Groscrand, Vanessa', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Herrold, Beau', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Hillings, Joe', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Kean, Steven J', aliases: ['skean@enron.com', 'Steven, Kean', 'Kean@ees, Steven J', 'Kean, Steve', 'J, Kean Steven',] },
{ asSender: [], asReceiver: [], name: 'Keepers, Sally', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Koenig, Mark', aliases: [] },     
{ asSender: [], asReceiver: [], name: 'Lay, Elizabeth', aliases: ['Vittor, Elizabeth Lay', 'Lay, Vittor Elizabeth', ] },
{ asSender: [], asReceiver: [], name: 'Lay, Kenneth', aliases: ['Chairman, Office Of The','Chairman, Enron Office Of The','Board@enron, Ken Lay- Chairman Of The', 'kenlay@enron.com', 'k.lay@enron.com', 'Lay, Dr Kenneth', 'L, Lay Kenneth', 'Enron, Kenneth L Lay -', 'k.l.lay@enron.com', 'k.lay@enron.com', 'k_lay@enron.com', 'lay@enroncom, Ken', 'klay@enron.com.','klay@enron','ken', 'Lay/enron, Kenneth L', 'Lay@enron, Ken', 'lay', 'kennethlay@enron.com', 'kenneth_lay@enron.net','kenneth.l.lay@enron.com', 'kenneth', 'ken_lay@enron.net', 'ken.lay@enron.com', 'Ken, Lay','ken_lay@enron.com', 'Lay@enron, Kenneth','Lay, Kenneth L','Chairman, Ken Lay - Office Of The','kenneth.lay@enron.com', 'kenneth_lay@enron.com', 'layk@enron.com', 'klay@enron.com', 'Lay, Ken', 'Kenneth, Lay'], },
{ asSender: [], asReceiver: [], name: 'Lay, Linda', aliases: ['Mrslinda@lplpicom@enron, Linda P Lay', 'Linda, Lay', 'Lay, Linda P', 'mrslinda@lplpi.com',] },
{ asSender: [], asReceiver: [], name: 'Lay, Mark', aliases: ['mark.lay@solutioncompany.com@enron',  'mark.lay@enron.com', 'mark','Lay, Mark K',] },
{ asSender: [], asReceiver: [], name: 'Lay, Sharon', aliases: ['Sharon, Lay', ] },
{ asSender: [], asReceiver: [], name: 'Mccarty, Arlene', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Mcconnell, Mike', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Mcdonald, Rebecca', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Milken, Michael', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Moore, Charles', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Sandherr, Cynthia', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Skilling, Jeff', aliases: ['jskilli@enron.com', 'Skilling@enron, Jeffrey K', 'Skilling@enron, Jeff','Jeff, Skilling', 'Skilling, Jeffrey'] },
{ asSender: [], asReceiver: [], name: 'Smith, Linda', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Sutton, Joseph W', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Wells, Tori L', aliases: [] },
{ asSender: [], asReceiver: [], name: 'Whalley, Greg', aliases: ['gwhalle@enron.com','gwhalley@enron.com','Greg, Whalley'] },

]

export const aliasMap = new Map()
contacts.map((contact) => {
  contact.aliases.map((alias) => {
    aliasMap.set(alias, contact.name)
  })
  aliasMap.set(contact.name, contact.name)
})