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
let numEmailsThisFile = 0;
let numEmails = 0;
let promiseList: Promise<mongoose.Document>[] = [];
let emailList: PSTMessage[] = [];
let dbo: any = null;
const logUpdate = require('log-update');
const logUpdateFrames = ['-', '\\', '|', '/'];
let logUpdateIdx = 0;

// connect to MongoDB
if (config.util.getEnv('NODE_ENV') !== 'prod') {
    mongoose.set('debug', true);
}

    // mongoClient.connect(config.DBHost, function(err: any, db: any) {
    //     if (err) throw err;
    //     dbo = db.db('x2');
        if (config.util.getEnv('NODE_ENV') !== 'test') {
            run().catch(error => Log.error(error));
        }
        // db.close();
    // });

/**
 * Main async app that walks list of PSTs and processes them.
 */ 
async function run() {
    // if (config['dropDatabase']) {
    //     await dropDatabase();
    // }

    let folderListing = fs.readdirSync(pstFolder);
    for (let folder of folderListing) {
        const start = Date.now();

        await processPST(pstFolder + folder);

        const end = Date.now();
        console.log(pstFolder + folder + ', ' + numEmailsThisFile + ' emails processed in ' + (end - start) + ' ms');
    }

    // if (config['createIndexes']) {
    //     createIndexes();
    // }
    console.log('\n${numEmails} total emails processed');

}

/**
 * Remove existing emails first.
 */
// function dropDatabase() {
//     console.log('drop database');
//     return new Promise((resolve, reject) => {
//         dbo.dropDatabase((err: any, obj: any) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(obj);
//             }
//         });
//     });
// }

/**
 * Create indexes.
 */
// function createIndexes() {
//     console.log('create indexes');
//     return new Promise((resolve, reject) => {
//         dbo.collection('emails').createIndex({ '$**': 'text' }, (err: any, obj: any) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(obj);
//             }
//         });
//     });
// }

/**
 * Processes a PST, storing emails in list and walking list to add to MongoDB.
 * Create promises are stored in list, and Promise.all waits for them to complete.
 * @param {string} filename
 * @returns
 */
export function processPST(filename: string) {
    promiseList = [];
    emailList = [];

    console.log(filename);
    let pstFile = new PSTFile(filename);

    // extract the emails and put into list
    processFolder(emailList, pstFile.getRootFolder());

    // walk list and save to MongoDB
    saveEmails(emailList, promiseList);

    numEmailsThisFile = emailList.length;
    numEmails += numEmailsThisFile;

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
                    logUpdate(logUpdateFrames[logUpdateIdx = ++logUpdateIdx % logUpdateFrames.length]);
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
            Log.debug2('saveEmails: ' + email.subject);
            promiseList.push(mongoEmail.create());
        } catch (err) {
            console.log(err);
        }
    });
}