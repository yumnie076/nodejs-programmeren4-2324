const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const expect = chai.expect
const assert = require('assert')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey
const db = require('../src/dao/dbconnection')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')
const endpointToTest = '/api/login'

describe('UC101 Inloggen', () => {
    beforeEach((done) => {
        
        done()
    })

    it('TC-101-1 Verplicht veld ontbreekt', (done) => {
        // Attempt to log in without providing an email address
        chai.request(server)
            .post('/api/login')
            .send({
                password: 'Secret123456'
            })
            .end((err, res) => {
                expect(res).to.have.status(400)

                // Attempt to log in without providing a password
                chai.request(server)
                    .post('/api/login')
                    .send({
                        emailAdress: 'test@example.com'
                    })
                    .end((err, res) => {
                        expect(res).to.have.status(400)

                        done()
                    })
            })
    })

    it('TC-101-2 niet valide wachtwoord', (done) => {
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 't.testeneeee@example.com',
            password: 123456, // Invalid password type (not a string)
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        }

        // Attempt to add the user with an invalid password type
        chai.request(server)
            .post('/api/login')
            .send(testUser)
            .end((err, res) => {
                assert.ifError(err)

                // The server should respond with a 400 status code for invalid input
                res.should.have.status(400)
                res.should.be.an('object')
                res.body.should.be
                    .an('object')
                    .that.has.all.keys('status', 'message', 'data')

                done()
            })
    })

    it('TC-101-3 niet bestaande gebruiker', (done) => {
        // Attempt to log in with a non-existing user
        chai.request(server)
            .post('/api/login')
            .send({
                emailAdress: 'n.notexisting@example.com',
                password: 'Secret123456'
            })
            .end((err, res) => {
                assert.ifError(err)

                // The server should respond with a 404 status code for non-existing user
                res.should.have.status(404)
                res.should.be.an('object')
                res.body.should.be
                    .an('object')
                    .that.has.all.keys('status', 'message', 'data')

                done()
            })
    })

    it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
        // Create a test user
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' });
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 't.testen@example.com',
            password: 'Secret123456',
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        };
    
        // Add the user
        chai.request(server)
            .post('/api/user')
            .set('Authorization', `Bearer ${token}`)
            .send(testUser)
            .end((err, res) => {
                assert.ifError(err);
                res.should.have.status(200);
                res.should.be.an('object');
    
                const userId = res.body.data.id;
    
                // Update token with user ID
                const updatedToken = jwt.sign({ id: userId }, jwtSecretKey, { expiresIn: '1h' });
    
                // Attempt to log in with the correct password
                chai.request(server)
                    .post('/api/login')
                    .send({
                        emailAdress: testUser.emailAdress,
                        password: 'Secret123456' // Correct password
                    })
                    .end((err, res) => {
                        assert.ifError(err);
                        res.should.have.status(200);
                        res.should.be.an('object');
    
                        // Delete the user
                        chai.request(server)
                            .delete(`/api/user/${userId}`)
                            .set('Authorization', `Bearer ${updatedToken}`)
                            .end((err, res) => {
                                assert.ifError(err);
                                res.should.have.status(200);
                                res.should.be.an('object');
    
                                done();
                            });
                    });
            });
    });
    
    

})
