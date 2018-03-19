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
import { PSTMessage } from 'pst-extractor';
import { PSTFile } from 'pst-extractor';
import { PSTFolder } from 'pst-extractor';
import { Log } from './Log.class';
import { PSTAttachment } from 'pst-extractor';
import { PSTRecipient } from 'pst-extractor';
import { Email } from './Email';
import { EmailInterface } from './Email';

const pstFolder = '/media/sf_Outlook/test/';
const verbose = false;
let col = 0;

// set up MongoDB
mongoose.set('debug', true);
let uri = 'mongodb://localhost/x2';
mongoose.connect(uri, (err) => {
    if (err) {
        console.log(err.message);
        console.log(err);
    }
    else {
        console.log('Connected to MongoDb');

        // walk through PSTs in folder
        let directoryListing = fs.readdirSync(pstFolder);
        directoryListing.forEach(filename => {
            console.log(pstFolder + filename);

            // time for performance comparison to Java and improvement
            const start = Date.now();
            let pstFile = new PSTFile(pstFolder + filename);
            console.log(pstFile.getMessageStore().displayName);
            processFolder(pstFile.getRootFolder());
            const end = Date.now();
            console.log('\nprocessed in ' + (end - start) + ' ms');
        });

        Log.flushLogsAndExit();
    }
});

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

            if (verbose) {
                console.log(email.clientSubmitTime + ' From: ' + sender + ', To: ' + recipients + ', Subject: ' + email.subject);
            } else {
                printDot();
            }

            // store in MongoDB
            let mongoEmail = new Email(<EmailInterface>{
                foo: email.subject
            });
            create(mongoEmail);

            // onto next
            email = folder.getNextChild();
        }
    }
}

async function create(mongoEmail: Email) {
    try {
        await mongoEmail.create();
        console.log('await finished')
    } catch (err) {
        console.log(err); 
    }
}

/**
 * Print a dot representing a message.
 */
function printDot() {
    process.stdout.write('.');
    if (col++ > 100) {
        console.log('');
        col = 0;
    }
}