"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startupQuery = exports.searchHistoryCollection = exports.wordCloudCollection = exports.emailSentByDayCollection = exports.custodianCollection = exports.emailCollection = exports.onlyHot = exports.defaultLimit = exports.dbName = void 0;
// Common vars
exports.dbName = 'x2';
exports.defaultLimit = 50;
exports.onlyHot = true;
exports.emailCollection = 'email';
exports.custodianCollection = 'custodians';
exports.emailSentByDayCollection = 'emailsentbyday';
exports.wordCloudCollection = 'wordcloud';
exports.searchHistoryCollection = 'searchhistory';
exports.startupQuery = `{"sort":"sent","order":1}`;
//# sourceMappingURL=constants.js.map