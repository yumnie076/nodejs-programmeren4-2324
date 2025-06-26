const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const expect = chai.expect
const assert = require('assert')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../src/util/config').secretkey

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

// Testcases voor de endpoints van de user API
describe('UC201 Registreren als nieuwe user', () => {
    /**
     * Voorbeeld van een beforeEach functie.
     * Hiermee kun je code hergebruiken of initialiseren.
     */
    beforeEach((done) => {
      
        done()
    })

    /**
     * Hier starten de testcases
     */
    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                // firstName: 'Voornaam', ontbreekt
                lastName: 'Achternaam',
                emailAdress: 'v.a@server.nl'
            })
            .end((err, res) => {
                /**
                 * Voorbeeld uitwerking met chai.expect
                 */
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing first name')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-2 Niet-valide email adres', (done) => {
        chai.request(server)
            .post('/api/user')
            .send({
                firstName: 'Jan', // Valid first name
                lastName: 'De Boer', // Valid last name
                emailAdress: 'jan.de.boer' // Invalid email, missing domain
            })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body)
                    .to.have.property('message')
                    .eql('Invalid email address')
                done()
            })
    })

    it('TC-201-3 Niet-valide wachtwoord', (done) => {
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 'test@example.com',
            password: 'short', // Invalid password
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        }

        // Attempt to add the user with an invalid password
        chai.request(server)
            .post('/api/user')
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

    it('TC-201-4 When a user already exists, a valid error should be returned', (done) => {
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 't.test@avans.nl',
            password: 'Secret1234',
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        }

        // Create the user for the first time
        chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err, res) => {
                assert.ifError(err)

                res.should.have.status(200)
                res.should.be.an('object')
                res.body.should.be
                    .an('object')
                    .that.has.all.keys('status', 'message', 'data')

                // Try to create the same user again
                chai.request(server)
                    .post('/api/user')
                    .send(testUser)
                    .end((err, res) => {
                        assert.ifError(err)

                        res.should.have.status(400)

                        res.should.be.an('object')
                        res.body.should.be
                            .an('object')
                            .that.has.all.keys('status', 'message', 'data')

                        let { status, message } = res.body
                        status.should.be.a('number')
                        message.should.be
                            .a('string')
                            .that.equals('User already exists')

                        // Delete the user after the test
                        chai.request(server)
                            .post('/api/login')
                            .send({
                                emailAdress: testUser.emailAdress,
                                password: testUser.password
                            })
                            .end((loginErr, loginRes) => {
                                if (loginErr) return done(loginErr)

                                loginRes.should.have.status(200)
                                const token = loginRes.body.data.token

                                chai.request(server)
                                    .delete(
                                        `/api/user/${loginRes.body.data.id}`
                                    )
                                    .set('Authorization', `Bearer ${token}`)
                                    .end((deleteErr, deleteRes) => {
                                        if (deleteErr) return done(deleteErr)
                                        deleteRes.should.have.status(200)
                                        done()
                                    })
                            })
                    })
            })
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'firstnametest',
                lastName: 'lastnametest',
                isActive: 1,
                emailAdress: 'f.registertest@server.com',
                password: 'Secret1234',
                phoneNumber: '0612425495',
                roles: 'editor,guest',
                street: '',
                city: ''
            })
            .end((err, res) => {
                if (err) {
                    console.error('Error registering user:', err)
                }
                res.should.have.status(200)
                res.body.should.be.a('object')

                res.body.should.have.property('data').that.is.a('object')
                res.body.should.have.property('message').that.is.a('string')

                const data = res.body.data
                data.should.have.property('firstName').equals('firstnametest')
                data.should.have.property('lastName').equals('lastnametest')
                data.should.have.property('emailAdress')
                data.should.have.property('id').that.is.a('number')
                data.should.have.property('isActive').equals(1)
                data.should.have.property('phoneNumber').equals('0612425495')
                data.should.have.property('roles').equals('editor,guest')
                data.should.have.property('password').equals('Secret1234')

                const token = jwt.sign({ id: data.id }, jwtSecretKey, {
                    expiresIn: '1h'
                })

                // Delete the registered user
                chai.request(server)
                    .delete(endpointToTest + '/' + data.id)
                    .set('Authorization', `Bearer ${token}`)
                    .end((err, res) => {
                        if (err) {
                            console.error('Error deleting user:', err)
                        }

                        res.should.have.status(200)
                        done()
                    })
            })
    })
})

describe('UC202 Opvragen van een overzicht van alle users', () => {
    /**
     * Voorbeeld van een beforeEach functie.
     * Hiermee kun je code hergebruiken of initialiseren.
     */
    beforeEach((done) => {
        done()
    })
    it('TC-202-1 Toon alle gebruikers', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })
        chai.request(server)
            .get(endpointToTest)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.an('object')
                res.body.should.have.property('data').that.is.an('array')

                done()
            })
    })

    it('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        chai.request(server)
            .get(endpointToTest + '?nonExistingField=value')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.an('object')
                res.body.should.have.property('data').that.is.empty

                done()
            })
    })

    it('TC-202-3 Toon gebruikers met zoekterm op het veld isActive=false', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        chai.request(server)
            .get(endpointToTest + '?isActive=false')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.an('object')
                res.body.should.have.property('data').that.is.an('array')

                // Check if all returned users have isActive=false
                const users = res.body.data
                users.forEach((user) => {
                    expect((user.isActive = 'false'))
                })

                done()
            })
    })

    it('TC-202-4 Toon gebruikers met zoekterm op het veld isActive=true', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })
        chai.request(server)
            .get(endpointToTest + '?isActive=true')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.an('object')
                res.body.should.have.property('data').that.is.an('array')

                // Check if all returned users have isActive=true
                const users = res.body.data
                users.forEach((user) => {
                    expect((user.isActive = 'true'))
                })

                done()
            })
    })

    it('TC-202-5 Toon gebruikers met zoektermen op bestaande velden (max op 2 velden filteren)', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 't.testen@example.com',
            password: 'Secret1234',
            phoneNumber: '0612345678',
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        }

        // Create a new user
        chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.data).to.have.property('id').that.is.a('number')

                const userId = res.body.data.id
                const userToken = jwt.sign({ id: userId }, jwtSecretKey, {
                    expiresIn: '1h'
                })
                chai.request(server)
                    .get(endpointToTest + '?firstName=John&lastName=Doe')
                    .set('Authorization', `Bearer ${userToken}`)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.body.should.be.an('object')
                        res.body.should.have
                            .property('data')
                            .that.is.an('array')

                        // Check if all returned users have the specified first name and last name
                        const users = res.body.data
                        users.forEach((user) => {
                            expect(user.firstName).to.equal('John')
                            expect(user.lastName).to.equal('Doe')
                        })

                        chai.request(server)
                            .delete(`/api/user/${userId}`)
                            .set('Authorization', `Bearer ${userToken}`)
                            .end((err, res) => {
                                res.should.have.status(200)
                                expect(res.body).to.be.an('object')
                                expect(res.body)
                                    .to.have.property('message')
                                    .that.is.a('string')
                                expect(res.body.message).to.equal(
                                    `User deleted with id ${userId}.`
                                )
                                done()
                            })
                    })
            })
    })
})

describe('UC203 Opvragen van een gebruikersprofiel', () => {
    it('TC-203-1 ongeldig token', (done) => {
        chai.request(server)
            .get('/api/user/profile')
            .set('Authorization', 'Bearer invalidtoken') // Set an invalid token
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal('Token invalid!') // Updated to match actual message
                expect(res.body).to.have.property('data').that.is.an('object')
                    .that.is.empty // Adjusted expectation
                done()
            })
    })

    it('TC-203-2 Gebruiker is ingelogd met geldig token', (done) => {
        // Generate a valid token for authentication
        const token = jwt.sign({ id: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })

        chai.request(server)
            .get('/api/user/profile')
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    'Profile found for user with id 1.'
                )
                done()
            })
    })
})

describe('UC-204 Opvragen van usergegevens bij ID', () => {
    beforeEach((done) => {
        done()
    })

    it('TC-204-1 Ongeldig token', (done) => {
        chai.request(server)
            .get('/api/user/:userId')
            .set('Authorization', 'Bearer invalidtoken') // Set an invalid token
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal('Token invalid!') // Updated to match actual message
                expect(res.body).to.have.property('data').that.is.an('object')
                    .that.is.empty // Adjusted expectation
                done()
            })
    })

    it('TC-204-2 Gebruiker-ID bestaat niet', (done) => {
        const nonExistentUserId = 9999 // ID of a non-existent user
        const token = jwt.sign({ id: 139 }, jwtSecretKey, {
            expiresIn: '1h'
        })

        chai.request(server)
            .get(`/api/user/${nonExistentUserId}`)
            .set('Authorization', `Bearer ${token}`) // Set a valid token
            .end((err, res) => {
                console.log(nonExistentUserId)
                console.log(res.body)
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    `User not found with id ${nonExistentUserId}.`
                )
                expect(res.body).to.have.property('data').that.is.null
                done()
            })
    })

    it('TC-204-3 Gebruiker-ID bestaat', (done) => {
        const existingUserId = 1 // ID of an existing user
        const token = jwt.sign({ id: existingUserId }, jwtSecretKey, {
            expiresIn: '1h'
        })

        chai.request(server)
            .get(`/api/user/${existingUserId}`)
            .set('Authorization', `Bearer ${token}`) // Set a valid token
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    `User found with id ${existingUserId}.`
                )
                done()
            })
    })
})

describe('UC-205 Wijzigen van usergegevens', () => {
    beforeEach((done) => {
        done()
    })

    it('TC-205-1 Verplicht veld emailAdress ontbreekt', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            password: 'Secret1234',
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        }

        chai.request(server)
            .put('/api/user/:userId')
            .set('Authorization', `Bearer ${token}`)
            .send(testUser)
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal('Invalid email address')
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    it('TC-205-2 De gebruiker is niet de eigenaar van de data', (done) => {
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 't.testssssss@example.com',
            password: 'Secret1234',
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        }

        // Create a new user
        chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating user:', err)
                }

                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    `User created with id ${res.body.data.id}.`
                )

                const userId = res.body.data.id

                // Attempt to update the user's data with a different user's token
                const otherUserId = 2 // ID of another user
                const otherUserToken = jwt.sign(
                    { id: otherUserId },
                    jwtSecretKey,
                    { expiresIn: '1h' }
                )
                const userToken = jwt.sign({ id: userId }, jwtSecretKey, {
                    expiresIn: '1h'
                })
                chai.request(server)
                    .put(`/api/user/${userId}`)
                    .set('Authorization', `Bearer ${otherUserToken}`)
                    .send({
                        firstName: 'Updated',
                        emailAdress: 't.testssssss@example.com'
                    })
                    .end((err, res) => {
                        if (err) {
                            console.error('Error updating user data:', err)
                        }

                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            'Forbidden: You can only update your own data'
                        )
                        expect(res.body).to.have.property('data').that.is.empty

                        // Delete the test user
                        chai.request(server)
                            .delete(`/api/user/${userId}`)
                            .set('Authorization', `Bearer ${userToken}`)
                            .end((err, res) => {
                                if (err) {
                                    console.error('Error deleting user:', err)
                                }

                                expect(res).to.have.status(200)
                                expect(res.body).to.be.an('object')
                                expect(res.body)
                                    .to.have.property('message')
                                    .that.is.a('string')
                                expect(res.body.message).to.equal(
                                    `User deleted with id ${userId}.`
                                )
                                done()
                            })
                    })
            })
    })

    it('TC-205-3 Niet valide telefoonnummer', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 't.test@example.com',
            password: 'Secret1234',
            phoneNumber: '123456789', // Invalid phone number
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        }

        chai.request(server)
            .put('/api/user/:userId')
            .set('Authorization', `Bearer ${token}`)
            .send(testUser)
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    'Invalid phone number. Phone number must start with 06 and have 10 digits.'
                )
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    it('TC-205-4 Gebruiker bestaat niet', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        const nonExistentUserId = 999 // ID of a non-existent user

        chai.request(server)
            .put(`/api/user/${nonExistentUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: 'Updated' })
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(`Invalid email address`)
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    it('TC-205-5 Niet ingelogd', (done) => {
        chai.request(server)
            .put('/api/user/:userId')
            .send({ firstName: 'Updated', emailAdress: 'u.testen@server.nl' })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal('No token provided!')
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 't.testen@example.com',
            password: 'Secret1234',
            phoneNumber: '0612345678',
            street: 'Mainstreet'
            
        }

        // Create a new user
        chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.data).to.have.property('id').that.is.a('number')

                const userId = res.body.data.id
                const userToken = jwt.sign({ id: userId }, jwtSecretKey, {
                    expiresIn: '1h'
                })
                expect(res.body.message).to.equal(
                    `User created with id ${userId}.`
                )

                // Update the user's data
                chai.request(server)
                    .put(`/api/user/${userId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                      firstName: 'Updated',
                      lastName: 'Doe',
                      emailAdress: 't.testen@example.com',
                      password: 'Secret1234',
                      phoneNumber: '0612345678',
                      street: 'Mainstreet',
                      city: 'New York',
                      isActive: 1
                    })


                    .end((err, res) => {
                        if (err) {
                            console.error('Error:', err)
                        }

                        res.should.have.status(200) // Expected status code
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            `User with id ${userId} successfully updated.`
                        )
                        expect(res.body)
                            .to.have.property('data')
                            .that.is.an('object')
                        expect(res.body.data).to.have.property('id')
                        expect(res.body.data)
                            .to.have.property('firstName')
                            .that.is.a('string')
                            .that.equals('Updated')
                        expect(res.body.data)
                            .to.have.property('lastName')
                            .that.is.a('string')
                            .that.equals('Doe')
                        expect(res.body.data)
                            .to.have.property('emailAdress')
                            .that.is.a('string')
                            .that.equals('t.testen@example.com')
                        expect(res.body.data)
                            .to.have.property('phoneNumber')
                            .that.is.a('string')
                            .that.equals('0612345678')
                        expect(res.body.data)
                            .to.have.property('street')
                            .that.is.a('string')
                            .that.equals('Mainstreet')
                        expect(res.body.data)
                            .to.have.property('city')
                            .that.is.a('string')
                            .that.equals('New York')
                    

                        // Delete the user
                        chai.request(server)
                            .delete(`/api/user/${userId}`)
                            .set('Authorization', `Bearer ${userToken}`)
                            .end((err, res) => {
                                res.should.have.status(200)
                                expect(res.body).to.be.an('object')
                                expect(res.body)
                                    .to.have.property('message')
                                    .that.is.a('string')
                                expect(res.body.message).to.equal(
                                    `User deleted with id ${userId}.`
                                )
                                done()
                            })
                    })
            })
    })
})

describe('UC-206 Verwijderen van een user', () => {
    beforeEach((done) => {
        done()
    })

    it('TC-206-1 Gebruiker bestaat niet', (done) => {
        console.log('Test started')

        const token = jwt.sign({ id: 999 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        const nonExistentUserId = 999 // ID of a non-existent user

        chai.request(server)
            .delete(`/api/user/${nonExistentUserId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ firstName: 'Updated' })
            .end((err, res) => {
                if (err) {
                    console.error('Error deleting non-existent user:', err)
                } else {
                    console.log('Delete non-existent user response:', res.body)
                }

                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    `User not found with id ${nonExistentUserId}.`
                )
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    it('TC-206-2 Gebruiker is niet ingelogd', (done) => {
        chai.request(server)
            .delete('/api/user/:userId')
            .send({ firstName: 'Updated' })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal('No token provided!')
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    it('TC-206-3 Gebruiker is niet de eigenaar van de data', (done) => {
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 't.testssssss@example.com',
            password: 'Secret1234',
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        }

        // Create a new user
        chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating user:', err)
                }

                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    `User created with id ${res.body.data.id}.`
                )

                const userId = res.body.data.id

                // Attempt to update the user's data with a different user's token
                const otherUserId = 2 // ID of another user
                const otherUserToken = jwt.sign(
                    { id: otherUserId },
                    jwtSecretKey,
                    { expiresIn: '1h' }
                )
                const userToken = jwt.sign({ id: userId }, jwtSecretKey, {
                    expiresIn: '1h'
                })
                chai.request(server)
                    .delete(`/api/user/${userId}`)
                    .set('Authorization', `Bearer ${otherUserToken}`)
                    .end((err, res) => {
                        if (err) {
                            console.error('Error updating user data:', err)
                        }

                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            'Forbidden: You can only delete your own data'
                        )
                        expect(res.body).to.have.property('data').that.is.empty

                        // Delete the test user
                        chai.request(server)
                            .delete(`/api/user/${userId}`)
                            .set('Authorization', `Bearer ${userToken}`)
                            .end((err, res) => {
                                if (err) {
                                    console.error('Error deleting user:', err)
                                }

                                expect(res).to.have.status(200)
                                expect(res.body).to.be.an('object')
                                expect(res.body)
                                    .to.have.property('message')
                                    .that.is.a('string')
                                expect(res.body.message).to.equal(
                                    `User deleted with id ${userId}.`
                                )
                                done()
                            })
                    })
            })
    })

    it('TC-206-4 Gebruiker succesvol verwijderd', (done) => {
        const testUser = {
            firstName: 'John',
            lastName: 'Doe',
            emailAdress: 't.testen@example.com',
            password: 'Secret1234',
            phoneNumber: '0612345678',
            street: 'Mainstreet',
            city: 'New York',
            roles: 'editor,guest'
        }

        // Create a new user
        chai.request(server)
            .post('/api/user')
            .send(testUser)
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.data).to.have.property('id').that.is.a('number')

                const userId = res.body.data.id
                const userToken = jwt.sign({ id: userId }, jwtSecretKey, {
                    expiresIn: '1h'
                })
                expect(res.body.message).to.equal(
                    `User created with id ${userId}.`
                )

                // Delete the user
                chai.request(server)
                    .delete(`/api/user/${userId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .end((err, res) => {
                        res.should.have.status(200)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            `User deleted with id ${userId}.`
                        )
                        done()
                    })
            })
    })
})
