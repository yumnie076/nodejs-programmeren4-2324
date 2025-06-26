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

const endpointToTest = '/api/meal'

describe('UC301 toevoegen van maaltijd', () => {
    beforeEach((done) => {
        done()
    })

    it('TC-301-1 Verplicht veld ontbreekt bij toevoegen maaltijd', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        // Maaltijdgegevens zonder het verplichte veld 'name'
        const incompleteMealData = {
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg',
            isActive: true,
            isVega: false,
            isVegan: false,
            isToTakeHome: true,
            allergenes: 'gluten'
        }

        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${token}`)
            .send(incompleteMealData)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating meal:', err)
                } else {
                    console.log('Create meal response:', res.body)
                }

                // We verwachten een 400 status omdat een verplicht veld ontbreekt
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    'Missing required field(s): name'
                )
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    it('TC-301-2 Gebruiker is niet ingelogd', (done) => {
        const mealData = {
            name: 'Pasta Bolognese',
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg',
            isActive: true,
            isVega: false,
            isVegan: false,
            isToTakeHome: true,
            allergenes: 'gluten'
        }

        chai.request(server)
            .post('/api/meal')
            .send(mealData)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating meal:', err)
                }

                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal('No token provided!')
                expect(res.body).to.have.property('data').that.is.empty
                done()
            })
    })

    it('TC-301-3 Maaltijd succesvol aangemaakt', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        const mealData = {
            name: 'Pasta Bolognese',
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg'
        }

        // Voeg een nieuwe maaltijd toe
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${token}`)
            .send(mealData)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating meal:', err)
                    return done(err)
                }

                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                expect(res.body.data).to.have.property('cookId').that.equals(1)

                const mealId = res.body.data.id

                // Verwijder de gecreëerde maaltijd
                chai.request(server)
                    .delete(`/api/meal/${mealId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .end((err, res) => {
                        if (err) {
                            console.error('Error deleting meal:', err)
                            return done(err)
                        }

                        expect(res).to.have.status(200)
                        done()
                    })
            })
    })
})

describe('UC-302 wijzigen van maaltijd', () => {
    beforeEach((done) => {
        done()
    })

    it('TC-302-1 Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants” ontbreken', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        const mealData = {
            description: 'Heerlijke pasta met bolognesesaus',
            dateTime: '2024-05-26 18:00:00',
            imageUrl: 'https://example.com/image.jpg'
        }

        // Test missing 'name'
        let updatedMeal = {
            ...mealData,
            price: 5.0,
            maxAmountOfParticipants: 10
        }

        chai.request(server)
            .put('/api/meal/:mealId') // Adjust the endpoint as needed
            .set('Authorization', `Bearer ${token}`)
            .send(updatedMeal)
            .end((err, res) => {
                expect(res).to.have.status(400)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    'Missing required field(s): name'
                )
                expect(res.body).to.have.property('data').that.is.empty

                // Test missing 'price'
                updatedMeal = {
                    ...mealData,
                    name: 'Pasta Bolognese',
                    maxAmountOfParticipants: 10
                }

                chai.request(server)
                    .put('/api/meal/:mealId') // Adjust the endpoint as needed
                    .set('Authorization', `Bearer ${token}`)
                    .send(updatedMeal)
                    .end((err, res) => {
                        expect(res).to.have.status(400)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            'Missing required field(s): price'
                        )
                        expect(res.body).to.have.property('data').that.is.empty

                        // Test missing 'maxAmountOfParticipants'
                        updatedMeal = {
                            ...mealData,
                            name: 'Pasta Bolognese',
                            price: 5.0
                        }

                        chai.request(server)
                            .put('/api/meal/:mealId') // Adjust the endpoint as needed
                            .set('Authorization', `Bearer ${token}`)
                            .send(updatedMeal)
                            .end((err, res) => {
                                expect(res).to.have.status(400)
                                expect(res.body).to.be.an('object')
                                expect(res.body)
                                    .to.have.property('message')
                                    .that.is.a('string')
                                expect(res.body.message).to.equal(
                                    'Missing required field(s): maxAmountOfParticipants'
                                )
                                expect(res.body).to.have.property('data').that
                                    .is.empty

                                done()
                            })
                    })
            })
    })

    it('TC-302-2 Gebruiker is niet ingelogd', (done) => {
        const mealData = {
            name: 'Pasta Bolognese',
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg'
        }

        chai.request(server)
            .put('/api/meal/:mealId') // Adjust the endpoint as needed
            .send(mealData)
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal('No token provided!')
                expect(res.body).to.have.property('data').that.is.empty

                done()
            })
    })

    it('TC-302-3 Gebruiker is niet de eigenaar van de data', (done) => {
        const nonOwnerUserToken = jwt.sign({ id: 999 }, jwtSecretKey, {
            expiresIn: '1h'
        }) // Token voor een niet-eigenaar

        const newMealData = {
            name: 'Pasta Bolognese',
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg',
            isActive: true,
            isVega: false,
            isVegan: false,
            isToTakeHome: true,
            allergenes: 'gluten'
        }

        const userToken = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' }) // Token voor een eigenaar

        // Maak een nieuwe maaltijd aan
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${userToken}`)
            .send(newMealData)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating meal:', err)
                    return done(err)
                }

                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                const mealId = res.body.data.id

                // Probeer de maaltijd te wijzigen met een andere gebruiker
                chai.request(server)
                    .put(`/api/meal/${mealId}`)
                    .set('Authorization', `Bearer ${nonOwnerUserToken}`)
                    .send(newMealData)
                    .end((err, res) => {
                        if (err) {
                            console.error('Error updating meal:', err)
                            return done(err)
                        }

                        // Verwacht een 403 Forbidden status omdat de ingelogde gebruiker niet de eigenaar is
                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            'Forbidden: You can only update your own data'
                        )

                        // Verwijder de maaltijd met de juiste eigenaar
                        chai.request(server)
                            .delete(`/api/meal/${mealId}`)
                            .set('Authorization', `Bearer ${userToken}`)
                            .end((err, res) => {
                                if (err) {
                                    console.error('Error deleting meal:', err)
                                    return done(err)
                                }

                                expect(res).to.have.status(200)
                                expect(res.body).to.be.an('object')
                                expect(res.body)
                                    .to.have.property('message')
                                    .that.is.a('string')
                                expect(res.body.message).to.equal(
                                    `Meal with ID ${mealId} deleted successfully.`
                                )

                                done()
                            })
                    })
            })
    })

    it('TC-302-4 Maaltijd bestaat niet', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        const nonExistentMealId = 99999 // ID van een niet-bestaande maaltijd

        chai.request(server)
            .put(`/api/meal/${nonExistentMealId}`)
            .send({
                name: 'Pasta Bolognese',
                description: 'Heerlijke pasta met bolognesesaus',
                price: 8.5,
                dateTime: '2024-05-26 18:00:00',
                maxAmountOfParticipants: 10,
                imageUrl: 'https://example.com/image.jpg'
            })
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error updating meal:', err)
                    return done(err)
                }

                // Log the response for debugging purposes
                console.log('Response status:', res.status)
                console.log('Response body:', res.body)

                // Verwacht een 404 Not Found status omdat de maaltijd niet bestaat
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    `Meal with ID ${nonExistentMealId} not found`
                )

                done()
            })
    })

    it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        const newMealData = {
            name: 'Pasta Bolognese',
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg',
            isActive: true,
            isVega: false,
            isVegan: false,
            isToTakeHome: true,
            allergenes: 'gluten'
        }

        // Voeg een nieuwe maaltijd toe
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${token}`)
            .send(newMealData)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating meal:', err)
                    return done(err)
                }

                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                const mealId = res.body.data.id

                // Update de maaltijd met de gegenereerde ID
                const updatedMealData = {
                    name: 'Pasta Carbonara',
                    description: 'Heerlijke pasta met carbonarasaus',
                    price: 9.5,
                    dateTime: '2024-05-26 18:00:00',
                    maxAmountOfParticipants: 15,
                    imageUrl: 'https://example.com/image2.jpg',
                    isActive: true,
                    isVega: false,
                    isVegan: false,
                    isToTakeHome: true,
                    allergenes: 'gluten'
                }

                chai.request(server)
                    .put(`/api/meal/${mealId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(updatedMealData)
                    .end((err, res) => {
                        if (err) {
                            console.error('Error updating meal:', err)
                            return done(err)
                        }

                        // We verwachten een 200 status omdat de maaltijd succesvol is gewijzigd
                        expect(res).to.have.status(200)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('data')
                            .that.is.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            `Meal with id ${mealId} successfully updated.`
                        )

                        chai.request(server)
                            .delete(`/api/meal/${mealId}`)
                            .set('Authorization', `Bearer ${token}`)
                            .end((err, res) => {
                                if (err) {
                                    console.error('Error deleting meal:', err)
                                    return done(err)
                                }

                                expect(res).to.have.status(200)
                                done()
                            })
                    })
            })
    })
})

describe('UC-303 opvragen van maaltijden', () => {
    beforeEach((done) => {
        done()
    })
    it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
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
})

describe('UC-304 opvragen van maaltijd bij ID', () => {
    beforeEach((done) => {
        done()
    })

    it('TC-304-1 Maaltijd bestaat niet', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })
        const nonExistentMealId = 99999 // ID van een niet-bestaande maaltijd

        chai.request(server)
            .get(`/api/meal/${nonExistentMealId}`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error retrieving meal:', err)
                    return done(err)
                }

                // We verwachten een 404 status omdat de maaltijd niet bestaat
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    `Meal with ID ${nonExistentMealId} not found.`
                )
                expect(res.body).to.have.property('data').that.is.empty

                done()
            })
    })

    it('TC-304-2 Gegevens succesvol geretourneerd', (done) => {
        const token = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        const newMealData = {
            name: 'Pasta Bolognese',
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg',
            isActive: true,
            isVega: false,
            isVegan: false,
            isToTakeHome: true,
            allergenes: 'gluten'
        }

        // Voeg een nieuwe maaltijd toe
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${token}`)
            .send(newMealData)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating meal:', err)
                    return done(err)
                }

                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    `Meal created with ID ${res.body.data.id}.`
                )

                const mealId = res.body.data.id

                // Vraag de maaltijd op met de gegenereerde ID
                chai.request(server)
                    .get(`/api/meal/${mealId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .end((err, res) => {
                        if (err) {
                            console.error('Error retrieving meal:', err)
                            return done(err)
                        }

                        // We verwachten een 200 status omdat de maaltijd succesvol is opgehaald
                        expect(res).to.have.status(200)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('data')
                            .that.is.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            `Found meal with ID ${mealId}.`
                        )

                        // Controleer of de teruggegeven gegevens overeenkomen met de ingevoerde gegevens

                        // Verwijder de gecreëerde maaltijd
                        chai.request(server)
                            .delete(`/api/meal/${mealId}`)
                            .set('Authorization', `Bearer ${token}`)
                            .end((err, res) => {
                                if (err) {
                                    console.error('Error deleting meal:', err)
                                    return done(err)
                                }

                                expect(res).to.have.status(200)
                                expect(res.body).to.be.an('object')
                                expect(res.body)
                                    .to.have.property('message')
                                    .that.is.a('string')
                                expect(res.body.message).to.equal(
                                    `Meal with ID ${mealId} deleted successfully.`
                                )

                                done()
                            })
                    })
            })
    })
})

describe('UC-305 verwijderen van een maaltijd', () => {
    it('TC-305-1 Gebruiker is niet ingelogd', (done) => {
        const newMealData = {
            name: 'Pasta Bolognese',
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg',
            isActive: true,
            isVega: false,
            isVegan: false,
            isToTakeHome: true,
            allergenes: 'gluten'
        }

        const userToken = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        // Maak een nieuwe maaltijd aan
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${userToken}`)
            .send(newMealData)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating meal:', err)
                    return done(err)
                }

                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                const mealId = res.body.data.id

                // Probeer de maaltijd te verwijderen zonder in te loggen
                chai.request(server)
                    .delete(`/api/meal/${mealId}`)
                    .end((err, res) => {
                        if (err) {
                            console.error(
                                'Error trying to delete meal without logging in:',
                                err
                            )
                            return done(err)
                        }

                        // Verwacht een 401 Unauthorized status omdat de gebruiker niet is ingelogd
                        expect(res).to.have.status(401)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal('No token provided!')

                        // Verwijder de maaltijd met de juiste eigenaar
                        chai.request(server)
                            .delete(`/api/meal/${mealId}`)
                            .set('Authorization', `Bearer ${userToken}`)
                            .end((err, res) => {
                                if (err) {
                                    console.error('Error deleting meal:', err)
                                    return done(err)
                                }

                                expect(res).to.have.status(200)
                                expect(res.body).to.be.an('object')
                                expect(res.body)
                                    .to.have.property('message')
                                    .that.is.a('string')
                                expect(res.body.message).to.equal(
                                    `Meal with ID ${mealId} deleted successfully.`
                                )

                                done()
                            })
                    })
            })
    })

    it('TC-305-2 Gebruiker is niet de eigenaar van de data', (done) => {
        const nonOwnerUserToken = jwt.sign({ id: 999 }, jwtSecretKey, {
            expiresIn: '1h'
        }) // Token voor een niet-eigenaar

        const newMealData = {
            name: 'Pasta Bolognese',
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg',
            isActive: true,
            isVega: false,
            isVegan: false,
            isToTakeHome: true,
            allergenes: 'gluten'
        }

        const userToken = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' }) // Token voor een eigenaar

        // Maak een nieuwe maaltijd aan
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${userToken}`)
            .send(newMealData)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating meal:', err)
                    return done(err)
                }

                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                const mealId = res.body.data.id

                // Probeer de maaltijd te verwijderen met een andere gebruiker
                chai.request(server)
                    .delete(`/api/meal/${mealId}`)
                    .set('Authorization', `Bearer ${nonOwnerUserToken}`)
                    .end((err, res) => {
                        if (err) {
                            console.error('Error deleting meal:', err)
                            return done(err)
                        }

                        // Verwacht een 403 Forbidden status omdat de ingelogde gebruiker niet de eigenaar is
                        expect(res).to.have.status(403)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            'Forbidden: You can only delete your own meals'
                        )

                        // Verwijder de maaltijd met de juiste eigenaar
                        chai.request(server)
                            .delete(`/api/meal/${mealId}`)
                            .set('Authorization', `Bearer ${userToken}`)
                            .end((err, res) => {
                                if (err) {
                                    console.error('Error deleting meal:', err)
                                    return done(err)
                                }

                                expect(res).to.have.status(200)
                                expect(res.body).to.be.an('object')
                                expect(res.body)
                                    .to.have.property('message')
                                    .that.is.a('string')
                                expect(res.body.message).to.equal(
                                    `Meal with ID ${mealId} deleted successfully.`
                                )

                                done()
                            })
                    })
            })
    })

    it('TC-305-3 Verwijderen van een maaltijd die niet bestaat', (done) => {
        const nonExistentMealId = 999999 // Een ID waarvan we zeker weten dat het niet bestaat
        const userToken = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' }) // Token voor een eigenaar

        chai.request(server)
            .delete(`/api/meal/${nonExistentMealId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .end((err, res) => {
                if (err) {
                    console.error('Error deleting meal:', err)
                    return done(err)
                }

                // Verwacht een 404 Not Found status omdat de maaltijd niet bestaat
                expect(res).to.have.status(404)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').that.is.a('string')
                expect(res.body.message).to.equal(
                    `Meal with ID ${nonExistentMealId} not found`
                )

                done()
            })
    })

    it('TC-305-4 Maaltijd succesvol verwijderd', (done) => {
        const newMealData = {
            name: 'Pasta Bolognese',
            description: 'Heerlijke pasta met bolognesesaus',
            price: 8.5,
            dateTime: '2024-05-26 18:00:00',
            maxAmountOfParticipants: 10,
            imageUrl: 'https://example.com/image.jpg',
            isActive: true,
            isVega: false,
            isVegan: false,
            isToTakeHome: true,
            allergenes: 'gluten'
        }

        const userToken = jwt.sign({ id: 1 }, jwtSecretKey, { expiresIn: '1h' })

        // Maak een nieuwe maaltijd aan
        chai.request(server)
            .post('/api/meal')
            .set('Authorization', `Bearer ${userToken}`)
            .send(newMealData)
            .end((err, res) => {
                if (err) {
                    console.error('Error creating meal:', err)
                    return done(err)
                }

                expect(res).to.have.status(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('data').that.is.an('object')
                const mealId = res.body.data.id

                // Verwijder de maaltijd
                chai.request(server)
                    .delete(`/api/meal/${mealId}`)
                    .set('Authorization', `Bearer ${userToken}`)
                    .end((err, res) => {
                        if (err) {
                            console.error('Error deleting meal:', err)
                            return done(err)
                        }

                        expect(res).to.have.status(200)
                        expect(res.body).to.be.an('object')
                        expect(res.body)
                            .to.have.property('message')
                            .that.is.a('string')
                        expect(res.body.message).to.equal(
                            `Meal with ID ${mealId} deleted successfully.`
                        )

                        done()
                    })
            })
    })
})
