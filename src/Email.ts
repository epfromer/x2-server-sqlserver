import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

// create a schema
const EmailSchema: Schema = new Schema ({
    creationTime: Date,
    displayTo: String,
    displayCC: String,
    displayBCC: String,
    senderEmailAddress: String,
    senderName: String,
    subject: String,
    body: String
    // messageSize: number;
    // descriptorNodeId: number;
    // importance: number;
    // numberOfAttachments: number;
    // receivedByName: string;
    // receivedByAddress: string;
    // numberOfRecipients: number;
    // bodyHTML: string;
    // bodyRTF: string;
  });

// create a model based on the schema
export const Email = mongoose.model('Email', EmailSchema, 'email');
