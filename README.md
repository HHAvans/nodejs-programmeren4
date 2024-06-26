# Nodejs Express Server

Dit is mijn opgave voor de nodejs express server voor programmeren 4 herkansing.

## Beschrijving

Deze server gebruikt express js als framework voor het maken van een API gebaseerd op de share-a-meal functioneel ontwerp. De API maakt gebruik van een database kopeling voor users en meals. De database is gehost op aiven met domein https://nodejs-express-server.azurewebsites.net/ . De api is gehost op azure die via omgevingsvariablen verbinding met de mysql database heeft. Bij deployen worden alle route's en variaties daarop grondig getest en wordt de server niet gedeployed als deze niet slagen. De test database wordt automatisch op github lokaal gegeneerd bij het testen. Ook kan je lokaal testen met je eigen lokale database via `npm test`.

## Gebruik

Voor sommige route's is authentication required `(Auth required)`. Hiermee moet je eerst inloggen en dan de token die je daarmee krijgt als `Authorization` header zetten met value `Bearer {token}`.

### Info
GET /api/info

### Login
POST api/auth/login
Body: {
    "emailAdress": "email@example.com",
    "password": "password"
}

### Add user
POST api/user
Body: {
    "firstName": "first",
    "lastName": "last",
    "email": "email@example.com",
    "password": "password"
}

### Show all users
GET /api/user

### Get profile
GET /api/user/profile (Auth required)

### Get user by id
GET /api/user/{id}

### Edit user by id
PUT /api/user/{id} (Auth required)
Body: {
    "firstName": "first",
    "lastName": "last",
    "email": "email@example.com",
    "password": "password"
}

### Delete user by id
DELETE /api/user/{id} (Auth required)

### Add meal
POST /api/meal (Auth required)
Body: {
    "id": "10",
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
}

### Edit meal
PUT /api/meal (Auth required)
Body: {
    "isactive": "1",
    "datetime": "2022-03-22 17:35:00",
    "maxamountofparticipants": "10",
    "price": "10.55",
    "imageurl": "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
    "name": "Pizza",
    "description": "Domino's is lekker",
    "allergenes": "gluten"
}

### Get meals
GET /api/meal

### Get meal by id
GET /api/meal/:id 

### Delete meal
DELETE /api/meal/:id (Auth required)


## Deployment
De server is gedeployed op Azure. Het domain kan gevonden via https://nodejs-express-server.azurewebsites.net/
