import * as chai from 'chai';
import * as mocha from 'mocha';
import { Log } from './Log.class';
import { PSTFile } from 'pst-extractor';
const resolve = require('path').resolve
const expect = chai.expect;
let pstFile: PSTFile;

before(() => {
    // pstFile = new PSTFile(resolve('./src/testdata/michelle_lokay_000_1_1_1_1.pst'));
});

after(() => {
    // pstFile.close();
});

describe('main tests', () => {
    it('should process the file', () => {

        // drop db if it exists
        
        // open the config file (michelle lokay)

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