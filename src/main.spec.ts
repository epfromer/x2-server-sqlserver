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
    count.should.equal(71);

    // get one of the emails, and confirm fields
    Email.query({ senderName: 'Clickathome,' }).then(function(data) {
      data.should.be.a('array');
      data[0].should.have.property('senderEmailAddress').eql('Clickathome@ENRON.com');
    });
  });
}

describe('main tests', () => {
  it('should process the file', () => {
    process(config.pstFile);
  });
});
