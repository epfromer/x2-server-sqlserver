"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
async function sleep(ms = 0) {
    return new Promise((r) => setTimeout(r, ms));
}
exports.sleep = sleep;
//# sourceMappingURL=misc.js.map