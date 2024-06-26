process.env.DB_DATABASE = 'share_a_meal'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const db = require('../src/dao/mysql-db')
const INSERT_USER =
'INSERT INTO `user` (`firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
'("first", "last", "name@server.nl", "secret", "street", "city");'

const endpointToTest = '/api/user'

before((done) => {
    console.log('Waiting for a few seconds before starting tests...');
    setTimeout(() => {
      console.log('Starting tests...');
      done();
    }, 1000);
  });

describe('UC201 Registreren als nieuwe user', function() {
    this.timeout(50000); // Set timeout to 5 seconds to allow azure to work
    /**
     * Voorbeeld van een beforeEach functie.
     * Hiermee kun je code hergebruiken of initialiseren.
     */
    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    /**
     * Hier starten de testcases
     */
    it('TC-201-1 Verplicht veld ontbreekt', function(done) {
        this.timeout(50000); // Set timeout to 5 seconds to allow azure to work
        chai.request(server)
            .post(endpointToTest)
            .send({
                // firstName: 'Voornaam', ontbreekt
                lastName: 'Achternaam',
                email: 'v.a@server.nl'
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
                    .equals('Missing or incorrect firstName field')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-2 Niet-valide email adres', function(done) {
        this.timeout(50000); // Set timeout to 5 seconds to allow azure to work
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                email: 'invalidemail',
                password: 'secret'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Invalid email address')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-3 Niet-valide password', function(done) {
        this.timeout(50000); // Set timeout to 5 seconds to allow azure to work
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                email: 'v.aaaaa@server.nl',
                password: 'short'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Password must be at least 8 characters long')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-4 Gebruiker bestaat al', function(done) {
        this.timeout(50000); // Set timeout to 5 seconds to allow azure to work
        // First, let's create a user with the same email address
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Existing',
                lastName: 'User',
                email: 'e.xistinguser@example.com',
                password: 'password'
            })
            .end(() => {
                // Now, attempt to register a user with the same email address
                chai.request(server)
                    .post(endpointToTest)
                    .send({
                        firstName: 'New',
                        lastName: 'User',
                        email: 'e.xistinguser@example.com',
                        password: 'newpassword'
                    })
                    .end((err, res) => {
                        chai.expect(res.body).to.be.a('object')
                        chai.expect(res.body).to.have.property('status').equals(500)
                        chai.expect(res.body).to.have.property('message').include("Duplicate entry 'e.xistinguser@example.com'")
                        chai.expect(res.body).to.have.property('data').that.is.a('object').that.is.empty
    
                        done()
                    })
            })
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', function(done) {
        this.timeout(50000); // Set timeout to 5 seconds to allow azure to work
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                email: 'v.aaaa@server.nl',
                password: 'secretpassword'
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')

                res.body.should.have.property('data').that.is.a('object')
                res.body.should.have.property('message').that.is.a('string')

                done()
            })
    })

    describe('GET /api/user', () => {
        it('should return all users', (done) => {
            chai
                .request(server)
                .get('/api/user')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('data').which.is.an('array');
                    done();
                });
        });
    });

    describe('GET /api/user/profile', () => {
        it('should return 401 if token is not provided', (done) => {
            chai
                .request(server)
                .get('/api/user/profile')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    describe('GET /api/user/:userId', () => {
        it('should return 404 if user is not found', (done) => {
            chai
                .request(server)
                .get('/api/user/999')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('should return a user if found', (done) => {
            chai
                .request(server)
                .get(`/api/user/1`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('data').which.is.an('object');
                    res.body.data.should.have.property('firstName').eql('first');
                    done();
                });
        });
    });

    describe('PUT /api/user/:id', () => {
        it('should return 401 if user is not authorized', (done) => {
            chai
                .request(server)
                .put('/api/user/1')
                .send({
                    firstName: 'Updated',
                    lastName: 'Lastname',
                    email: 'test@example.com',
                    password: 'password'
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('should update a user if authorized', (done) => {
            chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "name@server.nl",
                    password: "secret"
                })
                .end((err, loginRes) => {
                    if (err) {
                        return done(err);
                    }
                    const token = "Bearer " + loginRes.body.data.token; // Store the authentication token
                    console.log("Token = " + token)
        
                    chai.request(server)
                        .put('/api/user/1')
                        .set('Authorization', token)
                        .send({
                            "firstName": 'Updated',
                            "lastName": 'Lastname',
                            "email": 'u.pdated@example.com',
                            "password": 'password'
                        })
                        .end((err, res) => {
                            if (err) {
                                return done(err);
                            }
                            res.should.have.status(200);
                            res.body.should.have.property('message').eql(`User with id 1 edited successfully.`);
                            done();
                        });
                });
        });        
    });

    describe('DELETE /api/user/:id', () => {
        it('should return 401 if user is not authorized', (done) => {
            chai
                .request(server)
                .delete('/api/user/1')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });

        it('should delete a user if authorized', (done) => {
            db.getConnection((err, connection) => {
                if (err) throw err;
                connection.query(INSERT_USER, ['Firstname', 'Lastname', 'test@example.com', 'password'], (error, results, fields) => {
                    connection.release();
                    if (error) throw error;
                    chai.request(server)
                    .post('/api/auth/login')
                    .send({
                        emailAdress: "another@server.nl",
                        password: "secret"
                    })
                    .end((err, loginRes) => {
                        if (err) {
                            return done(err);
                        }
                        const token = "Bearer " + loginRes.body.data.token; // Store the authentication token
                        console.log("Token = " + token)

                        chai
                        .request(server)
                        .delete(`/api/user/1111`)
                        .set('Authorization', token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property('message').include(`deleted successfully.`);
                            done();
                        });
                    });
                })
            });
        });
    });
});
