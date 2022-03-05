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
exports.processWordCloud = exports.addToWordCloud = void 0;
const sw = __importStar(require("stopword"));
const terms_1 = require("./terms");
// TODO investigate https://www.npmjs.com/package/natural
const wordCloudMap = new Map();
terms_1.keyTerms.forEach((term) => wordCloudMap.set(term.toLowerCase(), 0));
// Tokenize body for word cloud
function addToWordCloud(email, fromCustodian, toCustodians) {
    // remove EDRM sig
    const zlSig = '***********';
    let cleanBody = email.body.slice(0, email.body.indexOf(zlSig));
    // add in other fields to body
    cleanBody += ' ' + email.senderName;
    cleanBody += ' ' + fromCustodian;
    cleanBody += ' ' + email.displayTo;
    cleanBody += ' ' + toCustodians;
    cleanBody += ' ' + email.displayCC;
    cleanBody += ' ' + email.displayBCC;
    cleanBody += ' ' + email.subject;
    // remove CR/LF and lowercase
    cleanBody = cleanBody.replace(/[\r\n\t]/g, ' ').toLowerCase();
    // remove stopwords (common words that don't affect meaning)
    let cleanArr = cleanBody.split(' ');
    cleanArr = sw.removeStopwords(cleanArr);
    // bump counts for any term in our key terms
    cleanArr.forEach((term) => {
        if (wordCloudMap.has(term)) {
            wordCloudMap.set(term, wordCloudMap.get(term) + 1);
        }
    });
}
exports.addToWordCloud = addToWordCloud;
// Process list for word cloud and store in db.
async function processWordCloud(insertWordCloud, log) {
    const words = [];
    wordCloudMap.forEach((v, k) => {
        words.push({ tag: k, weight: v });
    });
    if (log)
        log('processWordCloud: ' + words.length + ' terms');
    await insertWordCloud(words);
}
exports.processWordCloud = processWordCloud;
//# sourceMappingURL=processWordCloud.js.map