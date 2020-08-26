export interface Email {
  id: string
  sent: Date
  from: string
  fromContact?: string
  to: string
  toContact?: string
  cc: string
  bcc: string
  subject: string
  body: string
}

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

export interface Contact {
  name: string
  aliases: string[]
  title: string
  color: string
  senderTotal: number
  receiverTotal: number
  asSender: EmailSent[]
  asReceiver: EmailReceived[]
}

export interface Alias {
  name: string
  aliases: string[]
  title: string
  color: string
}

export interface WordCloudTag {
  tag: string
  weight: number
}
