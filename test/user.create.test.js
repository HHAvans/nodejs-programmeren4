const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/user'

describe('UC201 Registreren als nieuwe user', function() {
    this.timeout(5000); // Set timeout to 5 seconds to allow azure to work
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
        this.timeout(5000); // Set timeout to 5 seconds to allow azure to work
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
        this.timeout(5000); // Set timeout to 5 seconds to allow azure to work
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
        this.timeout(5000); // Set timeout to 5 seconds to allow azure to work
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                email: 'v.a@server.nl',
                password: 'short'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res).not.to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Password must be at least 6 characters long')
                chai.expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty

                done()
            })
    })

    it('TC-201-4 Gebruiker bestaat al', function(done) {
        this.timeout(5000); // Set timeout to 5 seconds to allow azure to work
        // First, let's create a user with the same email address
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Existing',
                lastName: 'User',
                email: 'existinguser@example.com',
                password: 'password'
            })
            .end(() => {
                // Now, attempt to register a user with the same email address
                chai.request(server)
                    .post(endpointToTest)
                    .send({
                        firstName: 'New',
                        lastName: 'User',
                        email: 'existinguser@example.com',
                        password: 'newpassword'
                    })
                    .end((err, res) => {
                        chai.expect(res.body).to.be.a('object')
                        chai.expect(res.body).to.have.property('status').equals(500)
                        chai.expect(res.body).to.have.property('message').include("Duplicate entry 'existinguser@example.com'")
                        chai.expect(res.body).to.have.property('data').that.is.a('object').that.is.empty
    
                        done()
                    })
            })
    })

    it('TC-201-5 Gebruiker succesvol geregistreerd', function(done) {
        this.timeout(5000); // Set timeout to 5 seconds to allow azure to work
        chai.request(server)
            .post(endpointToTest)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                email: 'v.a@server.nl',
                password: 'secret'
            })
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('object')

                res.body.should.have.property('data').that.is.a('object')
                res.body.should.have.property('message').that.is.a('string')

                done()
            })
    })
})
