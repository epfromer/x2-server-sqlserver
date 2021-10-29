"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportStatus = exports.importPST = void 0;
const child_process_1 = __importDefault(require("child_process"));
const uuid_1 = require("uuid");
const log = [];
let importing = false;
function importPST(httpQuery) {
    if (importing)
        return `Import from ${httpQuery.loc} in progress`;
    log.length = 0; // truncate log
    importing = true;
    // fork long duration processing task
    const importer = child_process_1.default.fork('./src/doImport.ts', [httpQuery.loc], {
        execArgv: ['-r', 'ts-node/register'],
    });
    importer.on('message', (msg) => log.push({
        id: (0, uuid_1.v4)(),
        timestamp: new Date().toISOString(),
        entry: 'redis: ' + msg,
    }));
    importer.on('close', () => {
        console.log('process exit');
        importing = false;
    });
    return `Started import from ${httpQuery.loc}`;
}
exports.importPST = importPST;
function getImportStatus() {
    return log;
}
exports.getImportStatus = getImportStatus;
//# sourceMappingURL=importPST.js.map