"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEmail = void 0;
const uuid_1 = require("uuid");
const constants_1 = require("./constants");
const custodians_1 = require("./custodians");
const hash_1 = require("./hash");
const processCustodians_1 = require("./processCustodians");
const processEmailSent_1 = require("./processEmailSent");
const processWordCloud_1 = require("./processWordCloud");
const terms_1 = require("./terms");
// filter out funky stuff that isn't hot
const isValidEmail = (email) => email.messageClass === 'IPM.Note' &&
    email.clientSubmitTime !== null &&
    email.clientSubmitTime > new Date(1999, 0, 1) &&
    email.clientSubmitTime < new Date(2002, 3, 1) &&
    (email.senderName.trim() !== '' || email.senderEmailAddress.trim() !== '');
// check for custodians
const getCustodians = (s, foundCustodians) => {
    let potentialCustodians = s.toLowerCase().trim().split(';');
    potentialCustodians = potentialCustodians.map((c) => c.trim());
    potentialCustodians = potentialCustodians.filter((c) => c !== '');
    potentialCustodians.forEach((custodian) => {
        if (custodians_1.aliasMap.has(custodian)) {
            foundCustodians.add(custodians_1.aliasMap.get(custodian));
        }
    });
    return foundCustodians;
};
// helps with display of super long email addresses
const breakUpAddress = (addr) => addr.split('@').join(' @').split('+').join(' +');
// Processes individual email and stores in list.
function processEmail(email, emails) {
    // dedupe
    const h = (0, hash_1.hash)(email.body);
    if (hash_1.hashMap.has(h))
        return;
    if (!isValidEmail(email))
        return;
    // get custodians, if any
    const fromCustodiansSet = new Set();
    getCustodians(email.senderName, fromCustodiansSet);
    getCustodians(email.senderEmailAddress, fromCustodiansSet);
    const fromCustodians = [...Array.from(fromCustodiansSet)];
    const fromCustodian = fromCustodians.length
        ? fromCustodians[0]
        : '';
    const toCustodiansSet = new Set();
    getCustodians(email.displayTo, toCustodiansSet);
    getCustodians(email.displayCC, toCustodiansSet);
    getCustodians(email.displayBCC, toCustodiansSet);
    const toCustodians = [...Array.from(toCustodiansSet)];
    // load only hot emails?
    const hot = (0, terms_1.hasTerms)(email) || fromCustodian || toCustodians.length;
    if (!hot && constants_1.onlyHot)
        return;
    const emailId = (0, uuid_1.v4)();
    if (fromCustodian && toCustodians.length) {
        (0, processCustodians_1.addCustodiansInteraction)(fromCustodian, toCustodians);
    }
    if (fromCustodian)
        (0, processCustodians_1.incSenderTotal)(fromCustodian);
    if (toCustodians.length)
        toCustodians.forEach((c) => (0, processCustodians_1.incReceiverTotal)(c));
    (0, processEmailSent_1.incEmailSentByDay)(email.clientSubmitTime);
    (0, processWordCloud_1.addToWordCloud)(email, fromCustodian, toCustodians.join(' '));
    // add to list to be inserted later
    emails.push({
        id: emailId,
        sent: email.clientSubmitTime,
        from: breakUpAddress(email.senderName),
        fromCustodian: fromCustodian,
        to: breakUpAddress(email.displayTo),
        toCustodians: toCustodians,
        cc: email.displayCC,
        bcc: email.displayBCC,
        subject: email.subject,
        body: email.body,
    });
    // add to dedupe map
    hash_1.hashMap.set(h, email.body);
}
exports.processEmail = processEmail;
//# sourceMappingURL=processEmail.js.map