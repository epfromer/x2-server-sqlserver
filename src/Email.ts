let mongoose = require('mongoose');

export interface EmailInterface {
  creationTime: Date;
  displayTo: String;
  displayCC: String;
  displayBCC: String;
  senderEmailAddress: String;
  senderName: String;
  subject: String;
  body: String;
}

// create a schema
const EmailSchema = new mongoose.Schema({
  creationTime: Date,
  displayTo: String,
  displayCC: String,
  displayBCC: String,
  senderEmailAddress: String,
  senderName: String,
  subject: String,
  body: String
});

// create a model based on the schema
export const EmailModel = mongoose.model('email', EmailSchema);

export class Email {
  private _email: EmailInterface;
  constructor(email: EmailInterface) {
    this._email = email;
  }

  public create() {
    return EmailModel.create(this._email);
  }
}