import * as fs from 'fs';
import * as fsext from 'fs-ext';
import * as mongoose from 'mongoose';
import { Log } from './Log.class';
import { PSTMessage } from 'pst-extractor';
import { PSTFile } from 'pst-extractor';
import { PSTFolder } from 'pst-extractor';
import { PSTAttachment } from 'pst-extractor';
import { PSTRecipient } from 'pst-extractor';
import { Email, EmailModel, EmailInterface, EmailSchema } from './Email';
const config = require('config');
const mongoClient = require('mongodb').MongoClient;
const pstFolder = config.pstFolder;
const verbose = config.verbose;
let col = 0;
let promiseList: Promise<mongoose.Document>[] = [];
let emailList: PSTMessage[] = [];

// connect to MongoDB
if (config.util.getEnv('NODE_ENV') !== 'prod') {
  mongoose.set('debug', true);
}
mongoose.connect(config.DBHost);

if (config.util.getEnv('NODE_ENV') !== 'test') {
  run().catch(error => Log.error(error));
}

/**
 * Main async app that walks list of PSTs and processes them.
 */
async function run() {
  if (config['dropDatabase']) {
    dropDatabase();
  }

  let folderListing = fs.readdirSync(pstFolder);
  for (let folder of folderListing) {
    await processPST(pstFolder + folder);
  }

  if (config['createIndexes']) {
    createIndexes();
  }
}

/**
 * Remove existing emails first.
 */
function dropDatabase() {
  console.log('drop database first');
  mongoClient.connect(config.DBHost, function(err: any, db: any) {
    if (err) throw err;
    const dbo = db.db("x2");
    dbo.dropDatabase(function(err: any, obj: any) {
      if (err) throw err;
      db.close();
      console.log('database dropped');
    })
  });
}

/**
 * Create indexes.
 */
function createIndexes() {
  console.log('create indexes');
  mongoClient.connect(config.DBHost, function(err: any, db: any) {
    if (err) throw err;
    const dbo = db.db("x2");
    dbo.collection('emails').createIndex({ '$**': 'text' }, function(err: any, obj: any) {
      if (err) throw err;
      db.close();
      console.log('index creation started');
    })
  });
}

/**
 * Processes a PST, storing emails in list and walking list to add to MongoDB.
 * Create promises are stored in list, and Promise.all waits for them to complete.
 * @param {string} filename
 * @returns
 */
export function processPST(filename: string) {
  const start = Date.now();

  promiseList = [];
  emailList = [];

  console.log(filename);
  let pstFile = new PSTFile(filename);

  // extract the emails and put into list
  processFolder(emailList, pstFile.getRootFolder());

  // walk list and save to MongoDB
  saveEmails(emailList, promiseList);

  const end = Date.now();
  console.log('\n' + emailList.length + ' emails processed in ' + (end - start) + ' ms');

  return Promise.all(promiseList);
}

/**
 * Walk the folder tree recursively and process emails, storing in email list.
 * @param {PSTFolder} folder
 */
async function processFolder(emailList: PSTMessage[], folder: PSTFolder) {
  // go through the folders...
  if (folder.hasSubfolders) {
    let childFolders: PSTFolder[] = folder.getSubFolders();
    for (let childFolder of childFolders) {
      processFolder(emailList, childFolder);
    }
  }

  // and now the emails for this folder
  if (folder.contentCount > 0) {
    // get first in folder
    let email: PSTMessage = folder.getNextChild();
    while (email != null) {
      // if an email
      if (email.messageClass === 'IPM.Note') {
        let sender = email.senderName;
        if (sender !== email.senderEmailAddress) {
          sender += ' (' + email.senderEmailAddress + ')';
        }

        let recipients = email.displayTo;

        if (verbose) {
          console.log(email.clientSubmitTime + ' From: ' + sender + ', To: ' + recipients + ', Subject: ' + email.subject);
        } else {
          printDot();
        }

        emailList.push(email);
      }

      // onto next
      email = folder.getNextChild();
    }
  }
}

/**
 * Walk email list storing in Mongo and save promise in list.
 * @param {PSTMessage[]} emailList
 * @param {Promise<mongoose.Document>[]} promiseList
 */
function saveEmails(emailList: PSTMessage[], promiseList: Promise<mongoose.Document>[]) {
  emailList.forEach(email => {
    // store in MongoDB
    let mongoEmail = new Email(<any>{
      creationTime: email.creationTime,
      clientSubmitTime: email.clientSubmitTime,
      displayTo: email.displayTo,
      displayCC: email.displayCC,
      displayBCC: email.displayBCC,
      senderEmailAddress: email.senderEmailAddress,
      senderName: email.senderName,
      subject: email.subject,
      body: email.body
    });
    try {
      Log.debug1('saveEmails: ' + email.subject);
      promiseList.push(mongoEmail.create());
    } catch (err) {
      console.log(err);
    }
  });
}

/**
 * Print a dot representing a message.
 */
function printDot() {
  process.stdout.write('.');
  if (col++ > 80) {
    console.log('');
    col = 0;
  }
}
