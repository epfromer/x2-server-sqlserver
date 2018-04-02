import * as mongoose from 'mongoose';

export interface EmailInterface {
  creationTime: Date;
  clientSubmitTime: Date;
  displayTo: String;
  displayCC: String;
  displayBCC: String;
  senderEmailAddress: String;
  senderName: String;
  subject: String;
  body: String;
}

// create a schema
export const EmailSchema = new mongoose.Schema({
  creationTime: Date,
  clientSubmitTime: Date,
  displayTo: String,
  displayCC: String,
  displayBCC: String,
  senderEmailAddress: String,
  senderName: String,
  subject: String,
  body: String
});

// create a model based on the schema
export const EmailModel = mongoose.model('Email', EmailSchema);

export class Email {
  private _email: EmailInterface;
  constructor(email: EmailInterface) {
    this._email = email;
  }

  public create() {
    return EmailModel.create(this._email);
  }

  public static count() {
    return EmailModel.count({}).exec();
  }

  public static query(queryString: {}) {
    return EmailModel.find(queryString).exec();
  }
}