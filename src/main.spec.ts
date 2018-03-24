import * as chai from 'chai';
import * as mocha from 'mocha';
import { Log } from './Log.class';
import { PSTFile } from 'pst-extractor';
import { Email } from './Email';
let mongoose = require('mongoose');
const config = require('config');
const resolve = require('path').resolve;
const expect = chai.expect;
const should = chai.should();
const main = require('./main');
let pstFile: PSTFile;

before(() => {
  pstFile = new PSTFile(resolve('./src/testdata/michelle_lokay_000_1_1_1_1.pst'));
});

after(() => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  pstFile.close();
});

describe('main tests', () => {
  it('should process the file', () => {
    Log.error('using database ' + config.DBHost);

    // drop collection if it exists
    mongoose.connection.db.dropCollection('emails', function(err: any, result: any) {
        if (err) {
            Log.error(err)
        }
    });

    // open the config file (michelle lokay)
    main.processPST('./src/testdata/michelle_lokay_000_1_1_1_1.pst')

    // process it

    // confirm # of items

    // find one, and confirm

    // expect(pstFile.encryptionType).to.equal(1);
    // expect(pstFile.pstFileType).to.equal(23);
    // expect(pstFile.pstFilename).to.contain('michelle_lokay_000_1_1_1_1.pst');
    // expect(pstFile.getMessageStore().displayName).to.equal('Personal folders');
    // expect(pstFile.getRootFolder()).to.not.be.null;
    // Log.debug1(JSON.stringify(pstFile, null, 2));
  });
});
