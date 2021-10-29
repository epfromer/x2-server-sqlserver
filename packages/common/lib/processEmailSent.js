"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEmailSentByDay = exports.incEmailSentByDay = exports.emailSentByDay = void 0;
exports.emailSentByDay = new Map();
// Add to emails sent map
function incEmailSentByDay(sent) {
    const day = sent.toISOString().slice(0, 10);
    exports.emailSentByDay.set(day, exports.emailSentByDay.has(day) ? exports.emailSentByDay.get(day) + 1 : 1);
}
exports.incEmailSentByDay = incEmailSentByDay;
// Process list for email sent and store in db.
async function processEmailSentByDay(insertEmailSentByDay, log) {
    const email = [];
    exports.emailSentByDay.forEach((value, key) => email.push({ sent: key, total: value }));
    email.sort((a, b) => new Date(a.sent).getTime() - new Date(b.sent).getTime());
    if (log)
        log('processEmailSentByDay: ' + email.length + ' records');
    await insertEmailSentByDay(email);
}
exports.processEmailSentByDay = processEmailSentByDay;
//# sourceMappingURL=processEmailSent.js.map