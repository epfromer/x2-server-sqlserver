import * as assert from 'assert';
import * as config from 'config';
import * as fs from 'fs';
import * as logUpdate from 'log-update';
import * as mongodb from 'mongodb';
import { PSTMessage } from 'pst-extractor';
import { PSTFile } from 'pst-extractor';
import { PSTFolder } from 'pst-extractor';
import { Log } from './Log.class';

const MongoClient = mongodb.MongoClient;
const pstFolder: string = config.get('pstFolder');
let numEmails = 0;
const logUpdateFrames = ['-', '\\', '|', '/'];
let logUpdateIdx = 0;

/**
 * Main async app that walks list of PSTs and processes them.
 */
(async () => {
    try {
        // connect to db
        const client = await MongoClient.connect(config.get('dbHost'));
        console.log(`connected to ${config.get('dbHost')}`);
        const db = client.db(config.get('dbName'));
        Log.debug1(`connected to ${config.get('dbHost')}/${config.get('dbName')}`);

        // drop database if requested
        if (config.get('dropDatabase')) {
            console.log(`dropping database ${config.get('dbName')}`);
            await db.dropDatabase();
        }

        // walk folder
        console.log(`walking folder ${pstFolder}`);
        const folderListing = fs.readdirSync(pstFolder);
        for (const file of folderListing) {

            // process a file
            console.log(`processing ${file}\n`);
            const processStart = Date.now();
            const docList = processPST(pstFolder + file);
            if (docList.length > 0) {
                Log.debug1(file + ': processing complete, ' + msString(docList.length, processStart, Date.now()));

                // insert into db
                const dbInsertStart = Date.now();
                console.log(`inserting ${docList.length} documents into MongoDB`);
                const res = await db.collection(config.get('dbCollection')).insertMany(docList);
                Log.debug1(file + ': insertion complete, ' + msString(docList.length, dbInsertStart, Date.now()));
                assert.equal(docList.length, res.insertedCount);
                numEmails += docList.length;
            } else {
                Log.debug1(file + ': processing complete, no emails');
            }
        }

        // create indexes if requested
        if (config.get('createIndexes')) {
            console.log('creating indexes');
            await db.collection(config.get('dbCollection')).createIndex({ '$**': 'text' });
        }

        console.log(`${numEmails} emails processed`);
        client.close();
    } catch (err) {
        console.log(err.stack);
    }
})();

function msString(numDocs: number, msStart: number, msEnd: number) {
    const ms = msEnd - msStart;
    const msPerDoc = ms / numDocs;
    const sec = ms / 1000;
    const min = sec / 60;
    let s = ` ${numDocs} docs`;
    s += `, ${ms} ms (~ ${Math.trunc(sec)} sec)`;
    if (min > 1) {
        s += ` (~ ${Math.trunc(min)} min)`;
    }
    s += `, ~ ${Math.trunc(msPerDoc)} ms per doc`;
    return s;
}

/**
 * Processes a PST, storing emails in list.
 * @param {string} filename
 * @returns
 */
function processPST(filename: string) {
    const docList: Array<{}> = [];
    const pstFile = new PSTFile(filename);

    processFolder(docList, pstFile.getRootFolder());

    return docList;
}

/**
 * Walk the folder tree recursively and process emails, storing in email list.
 * @param {PSTFolder} folder
 */
function processFolder(docList: Array<{}>, folder: PSTFolder) {
    // go through the folders...
    if (folder.hasSubfolders) {
        const childFolders: PSTFolder[] = folder.getSubFolders();
        for (const childFolder of childFolders) {
            processFolder(docList, childFolder);
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

                const recipients = email.displayTo;

                if (config.get('verbose')) {
                    console.log(email.clientSubmitTime + ' From: ' + sender + ', To: ' + recipients + ', Subject: ' + email.subject);
                } else {
                    logUpdate(logUpdateFrames[(logUpdateIdx = ++logUpdateIdx % logUpdateFrames.length)]);
                }

                docList.push({
                    body: email.body,
                    clientSubmitTime: email.clientSubmitTime,
                    creationTime: email.creationTime,
                    displayBCC: email.displayBCC,
                    displayCC: email.displayCC,
                    displayTo: email.displayTo,
                    senderEmailAddress: email.senderEmailAddress,
                    senderName: email.senderName,
                    subject: email.subject,
                });
            }

            // onto next
            email = folder.getNextChild();
        }
    }
}