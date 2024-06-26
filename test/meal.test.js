if (process.env.DB_DATABASE != 'share_a_meal') {
    process.env.DB_DATABASE = 'share-a-meal-testdb'
}

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const db = require('../src/dao/mysql-db')

let token;

//login
before(async () => {

    //Add required tables to db
    db.getConnection((err, connection) => { //INSERT INTO `user` (`id`,`firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES (1, 'Updated', 'LastName', 'u.pdated@example.com', 'password', street, city), (2, 'Existing', 'User', 'e.xistinguser@exmaple.com', 'password', street, city), (3, 'first', 'last', 'name@server.nl', 'secret', street, city), (4, 'Voornaam', 'Achternaam', 'v.aaaa@server.nl', 'secretpassword', street, city); INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES (1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1), (2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1), (100, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1); 
        connection.query("INSERT INTO `user` (`id`,`firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES (1, 'Updated', 'LastName', 'u.pdated@example.com', 'password', street, city), (2, 'Existing', 'User', 'e.xistinguser@exmaple.com', 'password', street, city), (3, 'first', 'last', 'name@server.nl', 'secret', street, city), (4, 'Voornaam', 'Achternaam', 'v.aaaa@server.nl', 'secretpassword', street, city); INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES (1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1), (2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1), (100, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1); ",
            (error, results, fields) => {
            connection.release();
            if (err) {
                console.log('inserteed error')
                console.log(err)
            }
            console.log("Inserted")
        })
    })

    try {
      const loginResponse = await chai.request(server)
        .post('/api/auth/login')
        .send({
            "emailAdress": "u.pdated@example.com",
            "password": "password"
        })
  
      token = "Bearer " + loginResponse.body.data.token; // Store the authentication token
  
      console.log('Auth Token:', token);
  
    } catch (error) {
      console.error('Error during setup:', error);
      throw error;
    }
  });
  

describe('UC-301 Adding a Meal', () => {
    const endpointToTest = '/api/meal';

    it('TC-301-1 Missing required fields', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .set('Authorization', token)
            .send({
                // No fields
            })
            .end((err, res) => {
                console.log('Results adding meal: ' + token, + "\n" + res.body)
                chai.expect(res).to.have.status(400);
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('status').equals(400);
                chai.expect(res.body).to.have.property('message').equals('Fields are missing');
                done();
            });
    });

    it('TC-301-2 Unauthorized (Not logged in)', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                // not neccesary
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(401);
                done();
            });
    });

    it('TC-301-3 Meal successfully added', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .set('Authorization', token)
            .send({
                "id": "11",
                "isactive": "1",
                "isvega": "1",
                "isvegan": "1",
                "istotakehome": "1",
                "datetime": "2022-03-22 17:35:00",
                "maxamountofparticipants": "10",
                "price": "10.55",
                "imageurl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                "name": "Pizza",
                "description": "Domino's is lekker",
                "allergenes": "gluten"
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('message').equals('Meal succesfully inserted.');
                done();
            });
    });
});

describe('UC-302 Updating a Meal', () => {
    const idToUpdate = 11;

    it('TC-302-1 Missing required fields', (done) => {
        chai.request(server)
            .put(`/api/meal/${idToUpdate}`)
            .set('Authorization', token)
            .send({
                // Missing required fields intentionally
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400);
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('status').equals(400);
                chai.expect(res.body).to.have.property('message').equals('Fields are missing');
                done();
            });
    });

    it('TC-302-2 Unauthorized (Not logged in)', (done) => {
        chai.request(server)
            .put(`/api/meal/${idToUpdate}`)
            .send({
                // Provide valid fields here
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(401);
                done();
            });
    });

    it('TC-302-3 Unauthorized (Not the owner)', (done) => {
        chai.request(server)
            .put(`/api/meal/${idToUpdate}`)
            .set('Authorization', token)
            .send({
                // Provide valid fields here
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400);
                done();
            });
    });

    it('TC-302-4 Meal does not exist', (done) => {
        chai.request(server)
            .put('/api/meal/999') // Assuming meal with ID 999 doesn't exist
            .send({
                "isactive": "1",
                "datetime": "2022-03-22 17:35:00",
                "maxamountofparticipants": "10",
                "price": "10.55",
                "imageurl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                "name": "Pizza",
                "description": "Domino's is lekker",
                "allergenes": "gluten"
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(401);
                done();
            });
    });

    it('TC-302-5 Meal successfully updated', (done) => {
        chai.request(server)
            .put(`/api/meal/${idToUpdate}`)
            .set('Authorization', token)
            .send({
                "isactive": "1",
                "datetime": "2022-03-22 17:35:00",
                "maxamountofparticipants": "10",
                "price": "10.55",
                "imageurl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                "name": "Pizza",
                "description": "Domino's is lekker",
                "allergenes": "gluten"
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('message').equals('Meal succesfully edited.');
                done();
            });
    });
});

describe('UC-303 Retrieving All Meals', () => {
    it('TC-303-1 Successfully retrieve list of meals', (done) => {
        chai.request(server)
            .get('/api/meal')
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('message').include("Retrieved");
                chai.expect(res.body).to.have.property('data').which.is.an('array');
                done();
            });
    });
});

describe('UC-304 Retrieving a Meal by ID', () => {
    const mealId = 1;

    it('TC-304-1 Meal does not exist', (done) => {
        chai.request(server)
            .get('/api/meal/999')
            .end((err, res) => {
                chai.expect(res).to.have.status(401);
                done();
            });
    });

    it('TC-304-2 Successfully retrieve meal details', (done) => {
        chai.request(server)
            .get(`/api/meal/${mealId}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('message').equals('Meal succesfully retrieved.');
                chai.expect(res.body).to.have.property('data').which.is.an('object');
                done();
            });
    });
});

describe('UC-305 Deleting a Meal', () => {
    const mealIdToDelete = 1;

    it('TC-305-1 Unauthorized (Not logged in)', (done) => {
        chai.request(server)
            .delete(`/api/meal/${mealIdToDelete}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(401);
                done();
            });
    });

    it('TC-305-2 Unauthorized (Not the owner)', (done) => {
        chai.request(server)
            .delete(`/api/meal/${mealIdToDelete}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(401);
                done();
            });
    });

    it('TC-305-3 Meal does not exist', (done) => {
        chai.request(server)
            .delete('/api/meal/999') // Assuming meal with ID 999 doesn't exist
            .end((err, res) => {
                chai.expect(res).to.have.status(401);
                done();
            });
    });

    it('TC-305-4 Meal successfully deleted', (done) => {
        //add to be deleted meal to db
        db.getConnection((err, connection) => {
            connection.query("INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES (100, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1);", (error, results, fields) => {
                connection.release();

                chai.request(server)
                .post('/api/auth/login')
                .send({
                    emailAdress: "u.pdated@example.com",
                    password: "password"
                })
                .end((err, loginRes) => {
                    if (err) {
                        return done(err);
                    }
                    const token2 = "Bearer " + loginRes.body.data.token; // Store the authentication token
                    console.log("Token = " + token2)

                    
                    chai.request(server)
                        .delete(`/api/meal/100`) //Using pre defined inserted meal
                        .set('Authorization', token2)
                        .end((err, res) => {
                        chai.expect(res).to.have.status(200);
                        chai.expect(res.body).to.have.property('message').equals('Meal succesfully deleted.');
                        done();
                    });
                });
            })
        })
    });
});
