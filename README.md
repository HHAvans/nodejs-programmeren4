# Nodejs Express Server

Dit is mijn opgave voor de nodejs express server voor programmeren 4.

## Beschrijving

Deze server gebruikt express js als framework voor het maken van een API gebaseerd op de share-a-meal functioneel ontwerp. De API maakt gebruik van een database kopeling voor users en meals.

## Gebruik

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
GET /api/user/profile
Header:
Key = "Authorization"
Value = "Bearer {key}"

### Get user by id
GET /api/user/{id}

### Edit user by id
PUT /api/user/{id}
Body: {
    "firstName": "first",
    "lastName": "last",
    "email": "email@example.com",
    "password": "password"
}

### Delete user by id
DELETE /api/user/{id}

## Deployment

De server is gedeployed op Azure. Het domain kan gevonden via [LINK]