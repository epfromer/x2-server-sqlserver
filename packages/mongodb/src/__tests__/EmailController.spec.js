import * as request from 'supertest'
import * as app from '../index'

/*
  These are really integration tests and perform CRUD functions on the same database as the core app.
*/

const email1 = {
  body: 'email1 body',
  sent: '2019-03-07T21:01:00.000Z',
  bcc: 'email1 displayBCC',
  cc: 'email1 displayCC',
  to: 'email1 displayTo',
  from: 'email1 senderEmailAddress',
  subject: 'email1 subject',
}

const email2 = {
  body: 'email2 body',
  sent: '2019-03-07T21:01:00.000Z',
  bcc: 'email2 displayBCC',
  cc: 'email2 displayCC',
  to: 'email2 displayTo',
  from: 'email2 senderEmailAddress',
  subject: 'email2 subject',
}

beforeAll((done) => {
  // wait for app to emit event that it's started
  // and has a database connection
  app.on('appStarted', () => done())
})

test('should get all email', (done) => {
  request(app).get('/email').expect('Content-Type', /json/).expect(200, done)
})

test('should search body, to, from, and subject', (done) => {
  request(app)
    .get('/email?body=foo&to=foo&from=foo&subject=foo')
    .expect('Content-Type', /json/)
    .expect(200, done)
})

test('should search time', (done) => {
  request(app)
    .get('/email?sent=2019-03-07&timeSpan=2')
    .expect('Content-Type', /json/)
    .expect(200, done)
})

test('should search all fields', (done) => {
  request(app)
    .get('/email?allText=foo')
    .expect('Content-Type', /json/)
    .expect(200, done)
})

test('should skip, limit', (done) => {
  request(app)
    .get('/email?skip=10&limit=10')
    .expect('Content-Type', /json/)
    .expect(200, done)
})

test('should create and get specific email', (done) => {
  // create email
  request(app)
    .post('/email')
    .send(email1)
    .expect('Content-Type', /json/)
    .expect(201)
    .then((response) => {
      // get it
      const id = response.body._id
      request(app)
        .get('/email/' + id)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((response) => {
          // verify same as what was sent
          expect(response.body.body).toEqual(email1.body)
          // times are different (localized) - fix this
          // expect(response.body.sent).toEqual(email1.sent);
          expect(response.body.bcc).toEqual(email1.bcc)
          expect(response.body.cc).toEqual(email1.cc)
          expect(response.body.to).toEqual(email1.to)
          expect(response.body.from).toEqual(email1.from)
          expect(response.body.subject).toEqual(email1.subject)

          // delete it
          request(app)
            .delete('/email/' + id)
            .expect(200, done)
        })
    })
})

test('should create and update specific email', (done) => {
  // create email
  request(app)
    .post('/email')
    .send(email1)
    .expect('Content-Type', /json/)
    .expect(201)
    .then((response) => {
      // update it
      const id = response.body._id
      request(app)
        .put('/email/' + id)
        .send(email2)
        .expect(200)
        .then((response) => {
          // get it
          request(app)
            .get('/email/' + id)
            .expect('Content-Type', /json/)
            .expect(200)
            .then((response) => {
              // verify same as what was sent
              expect(response.body.body).toEqual(email2.body)
              // times are different (localized) - fix this
              // expect(response.body.sent).toEqual(email1.sent);
              expect(response.body.bcc).toEqual(email2.bcc)
              expect(response.body.cc).toEqual(email2.cc)
              expect(response.body.to).toEqual(email2.to)
              expect(response.body.from).toEqual(email2.from)
              expect(response.body.subject).toEqual(email2.subject)

              // delete it
              request(app)
                .delete('/email/' + id)
                .expect(200, done)
            })
        })
    })
})
