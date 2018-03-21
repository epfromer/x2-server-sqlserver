/**
 * Copyright 2010-2018 Richard Johnson, Orin Eman & Ed Pfromer
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * ---
 *
 * This file is part of pst-extractor.
 *
 * pst-extractor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * pst-extractor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with pst-extractor. If not, see <http://www.gnu.org/licenses/>.
 */
import * as fs from 'fs';
import * as fsext from 'fs-ext';
import * as mongoose from 'mongoose';
import { Log } from './Log.class';
import { PSTMessage } from 'pst-extractor';
import { PSTFile } from 'pst-extractor';
import { PSTFolder } from 'pst-extractor';
import { PSTAttachment } from 'pst-extractor';
import { PSTRecipient } from 'pst-extractor';
import { Email, EmailModel, EmailInterface } from './Email';

const pstFolder = '/media/sf_Outlook/test/';
const verbose = true;
let col = 0;
let promiseList: Promise<mongoose.Document>[] = [];
let emailList: PSTMessage[] = [];

// connect to MongoDB
mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/x2');

// let directoryListing = fs.readdirSync(pstFolder);
// if (directoryListing.length > 0) {
//     let promise = processPST(directoryListing[0]);
//     for (var i = 1; i < directoryListing.length; i++) {
//         promise = promise.then(function(values) {
//             processPST(directoryListing[i])
//         })
//     }
// }

async function run() {
    let folderListing = fs.readdirSync(pstFolder);
    for (let folder of folderListing) {
        console.log(await processPST(folder));
    }
}

run()

// async function runPromisesInSequence(promises) {
//     for (let promise of promises) {
//       console.log(await promise());
//     }
//   }

// processPST('kate_symes_003_1_1.pst').then(function(values) {
//     processPST('phillip_allen_002_1_1.pst');
// })


// let directoryListing = fs.readdirSync(pstFolder);
// directoryListing.forEach(filename => {
//     processPST(filename);

//     Log.debug1('all promises complete')
// })

function processPST(filename: string) {
    promiseList = [];
    emailList = [];

    console.log(pstFolder + filename);
    let pstFile = new PSTFile(pstFolder + filename);
    console.log(pstFile.getMessageStore().displayName);

    // extract the emails and put into list
    processFolder(emailList, pstFile.getRootFolder());

    // walk list and save to MongoDB
    saveEmails(emailList, promiseList);

    return Promise.all(promiseList);
}

Log.debug1('exiting')

        // const start = Date.now();
        // const end = Date.now();
        // console.log('\n' + emailList.length + ' emails processed in ' + (end - start) + ' ms');


// // walk through PSTs in folder
// let directoryListing = fs.readdirSync(pstFolder);
// directoryListing.forEach(filename => {

//     let emailList: PSTMessage[] = [];
//     let promiseList: Promise<mongoose.Document>[] = [];

//     const start = Date.now();
//     console.log(pstFolder + filename);
//     let pstFile = new PSTFile(pstFolder + filename);
//     console.log(pstFile.getMessageStore().displayName);

//     // extract the emails and put into list
//     processFolder(emailList, pstFile.getRootFolder());

//     // walk list and save to MongoDB
//     saveEmails(emailList, promiseList);

//     // wait for all promises to finish
//     Promise.all(promiseList).then(function(values) {
//         Log.debug1('all promises resolved');

//         const end = Date.now();
//         console.log('\n' + emailList.length + ' emails processed in ' + (end - start) + ' ms');
//     })
// });


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
            // creationTime: email.creationTime,
            // displayTo: email.displayTo,
            // displayCC: email.displayCC,
            // displayBCC: email.displayBCC,
            // senderEmailAddress: email.senderEmailAddress,
            // senderName: email.senderName,
            subject: email.subject,
            // body: email.body,
        });
        try {
            Log.debug1('saveEmails: ' + email.subject)
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