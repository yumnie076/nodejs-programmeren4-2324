const pool = require('../src/dao/mysql-db');

describe("Manual DB Insert", () => {
    it("should insert a user directly", (done) => {
        pool.query(
            `INSERT INTO user (firstName, lastName, emailAddress, password, street, city)
             VALUES (?, ?, ?, ?, ?, ?)`,
            ["Test", "User", "test@user.nl", "secret", "Straat", "Stad"],
            (err, results) => {
                if (err) return done(err);
                console.log("Inserted ID:", results.insertId);
                done();
            }
        );
    });
});
