const pool = require('../src/dao/mysql-db');      
const { expect } = require('chai');

describe("Manual DB Insert", () => {
    it('should insert a user directly', (done) => {
        const uniqueEmail = `test${Date.now()}@user.nl`;
        pool.query(
            'INSERT INTO user (firstName, lastName, emailAddress, password, phoneNumber, street, city) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['Test', 'User', uniqueEmail, 'secret', '0612345678', 'Straat', 'Stad'],
            (err, results) => {
                expect(err).to.be.null;
                expect(results).to.be.an('object');
                done();
            }
        );

    });

});
