"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = exports.hashMap = void 0;
// Create hash to dedupe.
exports.hashMap = new Map();
function hash(s) {
    let h = 0, i, chr;
    for (i = 0; i < s.length; i++) {
        chr = s.charCodeAt(i);
        h = (h << 5) - h + chr;
        h |= 0; // Convert to 32bit integer
    }
    return h;
}
exports.hash = hash;
//# sourceMappingURL=hash.js.map