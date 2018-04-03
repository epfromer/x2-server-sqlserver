import * as fs from 'fs';
import { Log } from './Log.class';
import { PSTMessage } from 'pst-extractor';
import { PSTFile } from 'pst-extractor';
import { PSTFolder } from 'pst-extractor';
const memwatch = require('memwatch-next');
const assert = require('assert');
const config = require('config');
const logUpdate = require('log-update');
const MongoClient = require('mongodb').MongoClient;
const pstFolder = config.pstFolder;
let numEmails = 0;
const logUpdateFrames = ['-', '\\', '|', '/'];
let logUpdateIdx = 0;

/**
 * Main async app that walks list of PSTs and processes them.
 */
(async function() {
    try {
        // connect to db
        const client = await MongoClient.connect(config.dbHost);
        console.log(`connected to ${config.dbHost}`);
        const db = client.db(config.dbName);
        Log.debug1(`connected to ${config.dbHost}/${config.dbName}`);

        // drop database if requested
        if (config['dropDatabase']) {
            console.log(`dropping database ${config.dbName}`);
            await db.dropDatabase();
        }

        // walk folder
        console.log(`walking folder ${pstFolder}`);
        let folderListing = fs.readdirSync(pstFolder);
        for (let file of folderListing) {

            // process a file
            const start = Date.now();
            console.log(`starting ${file}\n`);
            const docList = processPST(pstFolder + file);

            // insert into db
            const dbStart = Date.now();
            Log.debug1(`starting insert of ${docList.length} documents into MongoDB`);
            const res = await db.collection(config.dbCollection).insertMany(docList);
            const dbEnd = Date.now();
            Log.debug1('completed insertion in ' + (dbEnd - dbStart) + ' ms, which is ' + ((dbEnd - dbStart) /  docList.length) + ' ms per doc');
            assert.equal(docList.length, res.insertedCount);
            numEmails += docList.length;
            
            // all done for this file
            const end = Date.now();
            const s = file + ', ' + docList.length + ' emails processed in ' + (end - start) + ' ms';
            Log.debug1(s);
            console.log(s);
        }

        // create indexes if requested
        if (config['createIndexes']) {
            console.log(`creating indexes`);
            await db.collection(config.dbCollection).createIndex({ '$**': 'text' });
        }

        console.log(`${numEmails} emails processed`);
        client.close();
    } catch (err) {
        console.log(err.stack);
    }
})();

//     if (config.util.getEnv('NODE_ENV') !== 'test') {

/**
 * Processes a PST, storing emails in list.
 * @param {string} filename
 * @returns
 */
function processPST(filename: string) {
    let docList: {}[] = [];
    let pstFile = new PSTFile(filename);

    processFolder(docList, pstFile.getRootFolder());

    return docList;
}

/**
 * Walk the folder tree recursively and process emails, storing in email list.
 * @param {PSTFolder} folder
 */
function processFolder(docList: {}[], folder: PSTFolder) {
    // go through the folders...
    if (folder.hasSubfolders) {
        let childFolders: PSTFolder[] = folder.getSubFolders();
        for (let childFolder of childFolders) {
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

                let recipients = email.displayTo;

                if (config.verbose) {
                    console.log(email.clientSubmitTime + ' From: ' + sender + ', To: ' + recipients + ', Subject: ' + email.subject);
                } else {
                    logUpdate(logUpdateFrames[(logUpdateIdx = ++logUpdateIdx % logUpdateFrames.length)]);
                }

                docList.push({
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
            }

            // onto next
            email = folder.getNextChild();
        }
    }
}