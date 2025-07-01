# 🍽️ Share-a-Meal API

**Share-a-Meal** is een Node.js RESTful API waarmee gebruikers zich kunnen registreren, maaltijden kunnen aanmaken en zich kunnen aanmelden voor gezamenlijke eetmomenten. De backend is beveiligd met JWT-authenticatie en gekoppeld aan een MySQL-database (bijv. op DigitalOcean of lokaal via XAMPP).

---

##  Technologieën

- **Node.js** + Express.js  
- **MySQL** (cloud of lokaal)  
- **JWT** voor authenticatie  
- **Mocha/Chai** voor testen  
- **CI/CD** via GitHub Actions  
- **Deployment** via Azure App Service  

---

##  Authenticatie

- Registratie: `POST /api/user`  
- Inloggen: `POST /api/login`  
  → retourneert een JWT-token  
- Beveiligde endpoints vereisen header:
  ```
  Authorization: Bearer <token>
  ```

---

##  Installatie (lokaal)

1. Clone de repository:
   ```bash
   git clone 
   cd share-a-meal
   ```

2. Installeer dependencies:
   ```bash
   npm install
   ```

3. Maak een `.env` bestand aan met de juiste databasegegevens:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=secret
   DB_DATABASE=share-a-meal
   ```

4. Start de server:
   ```bash
   npm start
   ```

---

##  Deployment (Azure)

Voor productie gebruik je Azure App Service met deze **Application Settings**:

| Key           | Value                                               |
|---------------|-----------------------------------------------------|
| `DB_HOST`     | `db-mysql-ams3-46626-do-user-8155278-0.b.db.ondigitalocean.com` |
| `DB_PORT`     | `25060`                                             |
| `DB_USER`     | 2211614                                             |
| `DB_PASSWORD` |                                          |
| `DB_DATABASE` | 2211614                                             |

Zorg dat de poort en IP-toegang correct zijn ingesteld in DigitalOcean.

---

##  API Endpoints

###  Authenticatie

| Methode | Endpoint         | Beschrijving                   |
|---------|------------------|-------------------------------|
| POST    | `/api/user`      | Registreer nieuwe gebruiker   |
| POST    | `/api/login`     | Log in met e-mail + wachtwoord|

###  Gebruikers

| Methode | Endpoint               | Beschrijving                                 |
|---------|------------------------|----------------------------------------------|
| GET     | `/api/user`            | Lijst met gebruikers                         |
| GET     | `/api/user/profile`    | Huidige gebruikersgegevens (via token)       |
| GET     | `/api/user/:userId`    | Details van gebruiker via ID                 |
| PUT     | `/api/user/:userId`    | Wijzig gebruikersgegevens                    |
| DELETE  | `/api/user/:userId`    | Verwijder gebruiker                          |

###  Maaltijden

| Methode | Endpoint                        | Beschrijving                                 |
|---------|----------------------------------|----------------------------------------------|
| GET     | `/api/meal`                     | Alle maaltijden                              |
| GET     | `/api/meal/:mealId`             | Details van maaltijd                         |
| POST    | `/api/meal`                     | Nieuwe maaltijd aanmaken                     |
| PUT     | `/api/meal/:mealId`             | Wijzig maaltijd                              |
| DELETE  | `/api/meal/:mealId`             | Verwijder maaltijd                           |

###  Deelname

| Methode | Endpoint                                         | Beschrijving                                 |
|---------|--------------------------------------------------|----------------------------------------------|
| POST    | `/api/meal/:mealId/participate`                 | Aanmelden voor maaltijd                      |
| DELETE  | `/api/meal/:mealId/participate`                 | Afmelden voor maaltijd                       |
| GET     | `/api/meal/:mealId/participants`               | Bekijk deelnemers van maaltijd               |
| GET     | `/api/meal/:mealId/participants/:participantId`| Details van deelnemer                        |

---

##  Testen

Test je API met:

```bash
npm test
```

Testcases zijn geschreven met **Mocha** en **Chai** op basis van de functionele specificaties. Testen controleren o.a.:

- statuscodes (200, 400, 401, 403, 404)  
- correcte inhoud van `data`, `message` en `status`  
- validatie van invoer  

---

##  Responsestructuur

Alle API-responses volgen deze structuur:

```json
{
  "status": 200,
  "message": "Beschrijving van de actie",
  "data": {}
}
```

---

##  Licentie & Auteur


Auteur: *2211614*

---
