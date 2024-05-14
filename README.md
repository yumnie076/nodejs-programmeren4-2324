Dit project is een eenvoudige Node.js server gebouwd met het Express framework. Het biedt een basisstructuur voor het ontwikkelen van API's en webapplicaties.

## Inhoud

- [Overzicht](#overzicht)
- [Installatie](#installatie)
- [Configuratie](#configuratie)
- [Gebruik](#gebruik)
- [Projectstructuur](#projectstructuur)
- [Scripts](#scripts)
- [Database](#database)
- [Testen](#testen)
- [Licentie](#licentie)

## Overzicht

Deze server is ontworpen als een leermiddel om te laten zien hoe je een Express server kunt opzetten en gebruiken. Het project bevat basisvoorbeelden van het gebruik van routes, controllers, middleware en databaseverbindingen.

## Installatie

Volg deze stappen om de server te installeren en te draaien:

1. **Clone de repository:**

    ```bash
    git clone <repository-url>
    cd nodejs-programmeren4-2324
    ```

2. **Installeer de benodigde npm-pakketten:**

    ```bash
    npm install
    ```

## Configuratie

Maak een `.env` bestand in de hoofdmap van het project met de volgende inhoud:

```dotenv
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=share-a-meal