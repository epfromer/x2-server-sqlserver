import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export interface EmailInterface extends mongoose.Document {
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
const schema = new Schema({
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
const EmailSchema = mongoose.model('email', schema, 'email');

export class Email {
  private _email: EmailInterface;
  constructor (email: EmailInterface) {
    this._email = email;
  }

  public async create() {
    await EmailSchema.create(this._email);
  }

  public async search() {
    await EmailSchema.find();
  }
}
