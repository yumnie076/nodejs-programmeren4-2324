const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index'); 
const tracer = require('tracer');

const { expect } = chai;

chai.should();
chai.use(chaiHttp);
tracer.setLevel('warn');

describe('UC-301 Add Meal', () => {
    function getValidToken(callback) {
        chai.request(server)
            .post('/api/login')
            .send({ emailAddress: 'h.huizinga@server.nl', password: 'secret' }) 
            .end((err, res) => {
                if (err) return callback(err);
                const token = res.body.data.token;
                callback(null, token);
            })
    }
    // TC-301-1 Required field missing
    it('TC-301-1 Required field missing', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);

            chai.request(server)
                .post('/api/meals')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza' }) 
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').that.is.a('string');
                    expect(res.body.message).to.equal('Missing required fields: name, description, price, and cookId are required.');
                    done();
                });
        });
    });

    // TC-301-2 Not logged in
    it('TC-301-2 Not logged in', (done) => {
        chai.request(server)
            .post('/api/meals')
            .send({ name: 'Pizza', description: 'Delicious cheese pizza', price: 9.99 })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.be.an('object');
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
                    description: 'Delicious cheese pizza', 
                    price: 9.99, 
                    cookId: 1,
                    dateTime: '2024-05-15T12:00:00'
                })
                .end((err, res) => {
                    expect(res).to.have.status(500);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').that.is.a('string');
                    expect(res.body.message).to.equal('Database error');
                    done();
                });
        });
    });

});


describe('UC-302 Wijzigen van maaltijdsgegevens', () => {
    function getValidToken(callback) {
        chai.request(server)
            .post('/api/login')
            .send({ emailAddress: 'h.huizinga@server.nl', password: 'secret' })
            .end((err, res) => {
                if (err) return callback(err);
                const token = res.body.data.token;
                callback(null, token);
            });
    }

    // TC-302-1 Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants” ontbreken 400
    it('TC-302-1 Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants” ontbreken', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);

            chai.request(server)
                .put('/api/meals/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza' }) 
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').that.is.a('string');
                    expect(res.body.message).to.equal('Missing required fields for update: name, description, and price.');
                    done();
                });
        });
    });

    // TC-302-2 Niet ingelogd 401
    it('TC-302-2 Niet ingelogd', (done) => {
        chai.request(server)
            .put('/api/meals/1')
            .send({ name: 'Pizza', price: 9.99, maxAmountOfParticipants: 10 })
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message').that.is.a('string');
                expect(res.body.message).to.equal('Authorization header missing!');
                done();
            });
    });

    // TC-302-3 Niet de eigenaar van de data 403
    it('TC-302-3 Niet de eigenaar van de data', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);

            chai.request(server)
                .put('/api/meals/2') 
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza', price: 9.99, maxAmountOfParticipants: 10 })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').that.is.a('string');
                    expect(res.body.message).to.equal('Missing required fields for update: name, description, and price.');
                    done();
                });
        });
    });

    // TC-302-4 Maaltijd bestaat niet 404
    it('TC-302-4 Maaltijd bestaat niet', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);

            chai.request(server)
                .put('/api/meals/9999') 
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza', price: 9.99, maxAmountOfParticipants: 10 })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').that.is.a('string');
                    expect(res.body.message).to.equal('Missing required fields for update: name, description, and price.');
                    done();
                });
        });
    });

    // TC-302-5 Maaltijd succesvol gewijzigd 200
    it('TC-302-5 Maaltijd succesvol gewijzigd', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);

            chai.request(server)
                .put('/api/meals/1') 
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Pizza', price: 9.99, maxAmountOfParticipants: 10 })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').that.is.a('string');
                    expect(res.body.message).to.equal('Missing required fields for update: name, description, and price.');
                    done();
                });
        });
    });
});

describe('UC-303 Opvragen van alle maaltijden', () => {
    // TC-303-1 Lijst van maaltijden geretourneerd 200
    it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
        chai.request(server)
            .get('/api/meals') 
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data').that.is.an('array');
                res.body.data.forEach(meal => {
                    expect(meal).to.have.property('id').that.is.a('number');
                    expect(meal).to.have.property('name').that.is.a('string');
                    expect(meal).to.have.property('description').that.is.a('string');
                    
                    
                });
                done();
            });
    });
});

describe('UC-304 Opvragen van maaltijd bij ID', () => {
    // TC-304-1 Maaltijd bestaat niet 404
    it('TC-304-1 Maaltijd bestaat niet', (done) => {
        chai.request(server)
            .get('/api/meals/9999') 
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message').that.is.a('string');
                expect(res.body.message).to.equal('Authorization header missing!');
                done();
            });
    });

    // TC-304-2 Details van maaltijd geretourneerd 200
    it('TC-304-2 Details van maaltijd geretourneerd', (done) => {
        chai.request(server)
            .get('/api/meals/1') 
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('data').that.is.an('object');
                
                done();
            });
    });
});

describe('UC-305 Verwijderen van maaltijd', () => {
    function getValidToken(callback) {
        chai.request(server)
            .post('/api/login')
            .send({ emailAddress: 'h.huizinga@server.nl', password: 'secret' }) 
            .end((err, res) => {
                if (err) return callback(err);
                const token = res.body.data.token;
                callback(null, token);
            });
    }

    // TC-305-1 Niet ingelogd 401
    it('TC-305-1 Niet ingelogd', (done) => {
        chai.request(server)
            .delete('/api/meals/1') 
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message').that.is.a('string');
                expect(res.body.message).to.equal('Authorization header missing!');
                done();
            });
    });

    // TC-305-2 Niet de eigenaar van de data 403
    it('TC-305-2 Niet de eigenaar van de data', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);

            chai.request(server)
                .delete('/api/meals/2')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').that.is.a('string');
                    expect(res.body.message).to.equal('Meal not found with id 2');
                    done();
                });
        });
    });
    // TC-305-3 Maaltijd bestaat niet 404
    it('TC-305-3 Maaltijd bestaat niet', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);

            chai.request(server)
                .delete('/api/meals/9999')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').that.is.a('string');
                    expect(res.body.message).to.equal('Meal not found with id 9999');
                    done();
                });
        });
    });

    // TC-305-4 Maaltijd succesvol verwijderd 200
    it('TC-305-4 Maaltijd succesvol verwijderd', (done) => {
        getValidToken((err, token) => {
            if (err) return done(err);

            chai.request(server)
                .delete('/api/meals/1') 
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('message').that.is.a('string');
                    expect(res.body.message).to.equal('Meal not found with id 1');
                    done();
                });
        });
    });
});