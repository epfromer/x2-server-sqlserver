import * as chai from 'chai';
import * as mocha from 'mocha';
import { PSTFile } from 'pst-extractor';
import { Email, EmailModel } from './Email';
let mongoose = require('mongoose');
const config = require('config');
const expect = chai.expect;
const should = chai.should();
const main = require('./main');

before(() => {
  // drop collection if it exists
  mongoose.connection.db.dropCollection('emails', function(err: any, result: any) {
    if (err) {
      console.log(err);
    }
  });
});

after(() => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
});

/**
 * Async function which waits till Mongo promises complete and then
 * performs additional tests.
 * @param {string} pstFile 
 */
async function process(pstFile: string) {
  await main.processPST(config.pstFile);

  // confirm # of items
  Email.count().then(function(count) {
    expect(count).to.equal(71);

    // get one of the emails, and confirm fields
    
  });
}

describe('main tests', () => {
  it('should process the file', () => {
    console.log('using database ' + config.DBHost);

    // process the test file
    process(config.pstFile);

    // find one, and confirm

    // expect(pstFile.encryptionType).to.equal(1);
    // expect(pstFile.pstFileType).to.equal(23);
    // expect(pstFile.pstFilename).to.contain('michelle_lokay_000_1_1_1_1.pst');
    // expect(pstFile.getMessageStore().displayName).to.equal('Personal folders');
    // expect(pstFile.getRootFolder()).to.not.be.null;
    // Log.debug1(JSON.stringify(pstFile, null, 2));
  });
});
