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
import { Email, EmailInterface } from './Email';

const pstFolder = '/media/sf_Outlook/test/';
const verbose = true;
let col = 0;
let count = 0;

mongoose.set('debug', true);
mongoose.connect('mongodb://localhost/x2');

// walk through PSTs in folder
let directoryListing = fs.readdirSync(pstFolder);
directoryListing.forEach(filename => {
    console.log(pstFolder + filename);

    // time for performance comparison to Java and improvement
    count = 0;
    const start = Date.now();
    let pstFile = new PSTFile(pstFolder + filename);
    console.log(pstFile.getMessageStore().displayName);
    processFolder(pstFile.getRootFolder());
    const end = Date.now();
    console.log('\n' + count + ' emails processed in ' + (end - start) + ' ms');
});

console.log('exiting')
// Log.flushLogsAndExit();

/**
 * Walk the folder tree recursively and process emails.
 * @param {PSTFolder} folder 
 */
function processFolder(folder: PSTFolder) {
    // go through the folders...
    if (folder.hasSubfolders) {
        let childFolders: PSTFolder[] = folder.getSubFolders();
        for (let childFolder of childFolders) {
            processFolder(childFolder);
        }
    }

    // and now the emails for this folder
    if (folder.contentCount > 0) {
        let email: PSTMessage = folder.getNextChild();
        while (email != null && email.messageClass === 'IPM.Note') {

            let sender = email.senderName;
            if (sender !== email.senderEmailAddress) {
                sender += ' (' + email.senderEmailAddress + ')';
            }

            let recipients = email.displayTo;

            count++;
            if (verbose) {
                console.log(email.clientSubmitTime + ' From: ' + sender + ', To: ' + recipients + ', Subject: ' + email.subject);
            } else {
                printDot();
            }

            // store in MongoDB
            let mongoEmail = new Email(<any>{
                creationTime: email.creationTime,
                displayTo: email.displayTo,
                displayCC: email.displayCC,
                displayBCC: email.displayBCC,
                senderEmailAddress: email.senderEmailAddress,
                senderName: email.senderName,
                subject: email.subject,
                body: email.body,
            });
            try {
                mongoEmail.create();
                console.log('back from await');
                console.log(mongoEmail.search())
                console.log('back from search');
            } catch (err) {
                console.log(err);
            }

            // onto next
            email = folder.getNextChild();
        }
    }
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