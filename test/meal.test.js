const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const tracer = require('tracer');
const { expect } = chai;

chai.should();
chai.use(chaiHttp);
tracer.setLevel('warn');

// Maak testgebruiker aan
before((done) => {
    chai.request(server)
        .post('/api/user')
        .send({
            firstName: 'Test',
            lastName: 'User',
            emailAddress: 'test@meal.nl',
            password: 'Secret123!',
            phoneNumber: '0612345678',
            street: 'Teststraat',
            city: 'Teststad',
            roles: 'guest'
        })
        .end(() => done()); // Negeert duplicate error
});

function getValidToken(callback) {
    chai.request(server)
        .post('/api/login')
        .send({ emailAddress: 'test@meal.nl', password: 'Secret123!' })
        .end((err, res) => {
            if (err || !res.body.data || !res.body.data.token) {
                return callback(new Error('Token niet ontvangen'));
            }
            callback(null, res.body.data.token);
        });
}

describe('UC-301 Add Meal', () => {
    it('TC-301-1 Required field missing', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .post('/api/meals')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza' })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    done();
                });
        });
    });

    it('TC-301-2 Not logged in', (done) => {
        chai.request(server)
            .post('/api/meals')
            .send({ name: 'Pizza', description: 'Delicious cheese pizza', price: 9.99 })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property('message').that.is.a('string');
                expect(res.body.message).to.equal('Authorization header missing!');
                done();
            });
    });

    it('TC-301-3 Meal successfully added', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .post('/api/meals')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Pizza',
                    description: 'Cheese pizza',
                    price: 9.99,
                    maxAmountOfParticipants: 5,
                    dateTime: '2024-06-22T12:00:00'
                })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    done();
                    console.log('LOGIN RESPONSE', res.body);
                });
        });
    });
});

describe('UC-302 Wijzigen van maaltijdsgegevens', () => {
    it('TC-302-1 Verplicht velden ontbreken', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .put('/api/meals/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza' })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    done();
                });
        });
    });

    it('TC-302-2 Niet ingelogd', (done) => {
        chai.request(server)
            .put('/api/meals/1')
            .send({ name: 'Pizza', price: 9.99, maxAmountOfParticipants: 10 })
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });

    it('TC-302-3 Niet de eigenaar van de data', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .put('/api/meals/2')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza', price: 9.99, maxAmountOfParticipants: 10 })
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    it('TC-302-4 Maaltijd bestaat niet', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .put('/api/meals/9999')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza', price: 9.99, maxAmountOfParticipants: 10 })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    done();
                });
        });
    });

    it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .put('/api/meals/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza', price: 9.99, maxAmountOfParticipants: 10 })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});

describe('UC-303 Opvragen van alle maaltijden', () => {
    it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
        chai.request(server)
            .get('/api/meals')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.data).to.be.an('array');
                done();
            });
    });
});

describe('UC-304 Opvragen van maaltijd bij ID', () => {
    it('TC-304-1 Maaltijd bestaat niet', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .get('/api/meals/9999')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    done();
                });
        });
    });

    it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .get('/api/meals/1')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data).to.be.an('object');
                    done();
                });
        });
    });
});

describe('UC-305 Verwijderen van maaltijd', () => {
    it('TC-305-1 Niet ingelogd', (done) => {
        chai.request(server)
            .delete('/api/meals/1')
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });

    it('TC-305-2 Niet de eigenaar van de data', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .delete('/api/meals/2')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(403);
                    done();
                });
        });
    });

    it('TC-305-3 Maaltijd bestaat niet', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .delete('/api/meals/9999')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    done();
                });
        });
    });

    it('TC-305-4 Maaltijd succesvol verwijderd', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);
            chai.request(server)
                .delete('/api/meals/1')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });
});
