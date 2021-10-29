"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCustodians = exports.incReceiverTotal = exports.incSenderTotal = exports.addCustodiansInteraction = void 0;
const custodians_1 = require("./custodians");
// Fast map of from/to: #
const custodialInteractions = new Map();
function addCustodiansInteraction(fromCustodian, toCustodians) {
    // console.log(fromCustodian, toCustodians)
    toCustodians.forEach((toCustodian) => {
        const key = fromCustodian + '/' + toCustodian;
        custodialInteractions.set(key, custodialInteractions.has(key) ? custodialInteractions.get(key) + 1 : 1);
    });
}
exports.addCustodiansInteraction = addCustodiansInteraction;
// add to totals for Custodians
function incSenderTotal(fromCustodian) {
    custodians_1.custodians.find((c) => c.id === fromCustodian).senderTotal++;
}
exports.incSenderTotal = incSenderTotal;
function incReceiverTotal(toCustodian) {
    custodians_1.custodians.find((c) => c.id === toCustodian).receiverTotal++;
}
exports.incReceiverTotal = incReceiverTotal;
// Process list for Custodians and store in db.
async function processCustodians(insertCustodians, log) {
    if (log)
        log('processCustodians: ' + custodians_1.custodians.length + ' Custodians');
    // console.log(custodialInteractions)
    // split apart fast map into individual custodians
    custodialInteractions.forEach((value, key) => {
        const peeps = key.split('/');
        custodians_1.custodians
            .find((c) => c.id === peeps[0])
            .toCustodians.push({ custodianId: peeps[1], total: value });
    });
    await insertCustodians(custodians_1.custodians);
}
exports.processCustodians = processCustodians;
//# sourceMappingURL=processCustodians.js.map