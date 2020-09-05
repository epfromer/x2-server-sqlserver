export interface Email {
  id: string
  sent: Date
  sentShort: string
  from: string
  fromCustodian?: string
  to: string
  toCustodian?: string
  cc: string
  bcc: string
  subject: string
  body: string
}

// TODO remove
export interface EmailSentREMOVE {
  sent: string
  ids: string[]
}

export interface EmailSent {
  sent: Date
  id: string
  to: string[]
}

export interface EmailReceived {
  id: string
  from: string
  sent: Date
}

export interface Custodian {
  id: string
  name: string
  aliases: string[]
  title: string
  color: string
  senderTotal: number
  receiverTotal: number
  toCustodians: EmailSent[]
  fromCustodians: EmailReceived[]
}

export interface Alias {
  id: string
  name: string
  aliases: string[]
  title: string
  color: string
}

export interface WordCloudTag {
  tag: string
  weight: number
}

export interface HTTPQuery {
  sent?: string
  timeSpan?: number
  allText?: string
  from?: string
  to?: string
  subject?: string
  body?: string
}
