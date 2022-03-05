"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumPSTs = exports.walkFSfolder = void 0;
const fs = __importStar(require("fs"));
const pst_extractor_1 = require("pst-extractor");
const processEmail_1 = require("./processEmail");
// creates log string with times
function ms(numDocs, msStart, msEnd) {
    const ms = msEnd - msStart;
    const msPerDoc = ms / numDocs;
    const sec = ms / 1000;
    const min = sec / 60;
    let s = ` ${numDocs} docs`;
    s += `, ${ms} ms (~ ${Math.trunc(sec)} sec)`;
    if (min > 1)
        s += ` (~ ${Math.trunc(min)} min)`;
    s += `, ~ ${Math.trunc(msPerDoc)} ms per doc`;
    return s;
}
// Walk the PST folder tree recursively and process emails, storing in list.
function walkPSTFolder(emails, folder) {
    if (folder.hasSubfolders) {
        const childFolders = folder.getSubFolders();
        for (const childFolder of childFolders) {
            walkPSTFolder(emails, childFolder);
        }
    }
    if (folder.contentCount > 0) {
        let email = folder.getNextChild();
        while (email != null) {
            // while (email != null && i++ < maxNum) {
            (0, processEmail_1.processEmail)(email, emails);
            email = folder.getNextChild();
        }
    }
}
// Processes a PST, storing emails in list.
function walkPST(filename) {
    const emails = [];
    const pstFile = new pst_extractor_1.PSTFile(filename);
    walkPSTFolder(emails, pstFile.getRootFolder());
    return emails;
}
// Walk file system folder, processing each PST in it
async function walkFSfolder(fsFolder, insertEmails, log) {
    let numEmails = 0;
    if (log)
        log(`walking ${fsFolder}`);
    const files = fs.readdirSync(fsFolder);
    for (const file of files) {
        if (log)
            log(`processing ${file}`);
        const start = Date.now();
        const emails = walkPST(fsFolder + file);
        if (log)
            log(file + '  complete, ' + ms(emails.length, start, Date.now()));
        if (emails.length > 0) {
            // insert into db
            const start = Date.now();
            if (log)
                log(`inserting ${emails.length} documents`);
            await insertEmails(emails);
            if (log)
                log(file + '  complete, ' + ms(emails.length, start, Date.now()));
            numEmails += emails.length;
        }
        else {
            if (log)
                log(file + ': complete, no emails');
        }
    }
    return numEmails;
}
exports.walkFSfolder = walkFSfolder;
// Number of PSTs to process
function getNumPSTs(fsFolder) {
    return fs.readdirSync(fsFolder).length;
}
exports.getNumPSTs = getNumPSTs;
//# sourceMappingURL=walkFSFolder.js.map