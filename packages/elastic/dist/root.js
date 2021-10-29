"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const common_1 = require("@klonzo/common");
const getEmail_1 = require("./getEmail");
const importPST_1 = require("./importPST");
const searchHistory_1 = require("./searchHistory");
const getWordCloud = async () => {
    try {
        const client = new elasticsearch_1.Client({
            node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
        });
        const { body } = await client.search({
            index: common_1.dbName + common_1.wordCloudCollection,
            q: '*',
        });
        return body.hits.hits[0]._source.wordCloudCollection;
    }
    catch (err) {
        console.error(err.stack);
    }
};
const getEmailSentByDay = async () => {
    try {
        const client = new elasticsearch_1.Client({
            node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
        });
        const { body } = await client.search({
            index: common_1.dbName + common_1.emailSentByDayCollection,
            q: '*',
        });
        return body.hits.hits[0]._source.emailSentCollection;
    }
    catch (err) {
        console.error(err.stack);
    }
};
const getCustodians = async () => {
    try {
        const client = new elasticsearch_1.Client({
            node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
        });
        const { body } = await client.search({
            index: common_1.dbName + common_1.custodianCollection,
            q: '*',
            sort: 'id.keyword:asc',
        });
        return body.hits.hits.map((custodian) => ({
            id: custodian._source.id,
            name: custodian._source.name,
            title: custodian._source.title,
            color: custodian._source.color,
            senderTotal: custodian._source.senderTotal,
            receiverTotal: custodian._source.receiverTotal,
            toCustodians: custodian._source.toCustodians,
            fromCustodians: custodian._source.fromCustodians,
        }));
    }
    catch (err) {
        console.error(err.stack);
    }
};
const setCustodianColor = async (httpQuery) => {
    const client = new elasticsearch_1.Client({
        node: `http://${process.env.ELASTIC_HOST}:${process.env.ELASTIC_PORT}`,
    });
    await client.update({
        index: common_1.dbName + common_1.custodianCollection,
        id: httpQuery.id,
        body: {
            doc: {
                color: httpQuery.color,
            },
        },
    });
    await client.indices.refresh({ index: common_1.dbName + common_1.custodianCollection });
    const { body } = await client.search({
        index: common_1.dbName + common_1.custodianCollection,
        q: '*',
        sort: 'id.keyword:asc',
    });
    return body.hits.hits.map((custodian) => ({
        id: custodian._source.id,
        name: custodian._source.name,
        title: custodian._source.title,
        color: custodian._source.color,
        senderTotal: custodian._source.senderTotal,
        receiverTotal: custodian._source.receiverTotal,
        toCustodians: custodian._source.toCustodians,
        fromCustodians: custodian._source.fromCustodians,
    }));
};
exports.root = {
    clearSearchHistory: () => (0, searchHistory_1.clearSearchHistory)(),
    getCustodians: () => getCustodians(),
    getEmail: (httpQuery) => (0, getEmail_1.getEmail)(httpQuery),
    getEmailSentByDay: () => getEmailSentByDay(),
    getImportStatus: () => (0, importPST_1.getImportStatus)(),
    getSearchHistory: () => (0, searchHistory_1.getSearchHistory)(),
    getWordCloud: () => getWordCloud(),
    importPST: (httpQuery) => (0, importPST_1.importPST)(httpQuery),
    setCustodianColor: (httpQuery) => setCustodianColor(httpQuery),
};
exports.default = exports.root;
//# sourceMappingURL=root.js.map