# Käyttöohje

## Sovelluksen käynnistäminen  
Netissä olevaan sovellukseen pääsee [täältä](https://powerful-waters-43426.herokuapp.com).  
Jos haluat kokeilla sovellusta paikallisesti, lataa/pull:aa projekti ja mene komentokehotteella kansioon *backend* ja suorita 
komento ```npm start```, jolloin sovellukseen pääsee osoitteesta *localhost:3001*. Kommennon suorittaminen voi vaatio node:n asennuksen.  

## Kun et ole kirjautunut  

### Kirjautuminen  
Mennessäsi sovelluksen sivulle, sinut ohjataan suoraan kirjautumis sivulle, jossa pyydetään käyttäjänimeäsi ja salasanaasi. Kirjoitettuasi 
tietosi, voit kirjautua klikkaamalla nappia *login*. Jos käyttäjänimi tai salasana oli väärin, siitä annetaan ilmoitus sivun yläreunassa. 
Jos sinulla ei ole vielä käyttäjätunnusta, voit rekisteröityä sivulta, johon pääseee klikkaamalla linkkiä *signin*.  

### Rekisteröityminen  
Sivulla pyydetään käyttäjänimeä ja salasanaa, joita haluat käyttää sovelluksessa. Molempien tulee olla 3-15 merkkiä pitkiä ja käyttäjänimen tulee olla uniikki. 
Kun tiedot on annettu, painamalla nappia *sign in* voi rekisteröityä. Jos tiedoissa oli virheitä, siitä annetaan ilmoitus sivun yläreunassa. Jos rekisteröityminen onnistui, 
sinut kirjataan automaattisesti siään ja ohjataan chattien sivulle. Sivulla on myös mahdollisuus mennä takaisin kirjautumis sivulle klikkaamalla linkkiä *login*.  

### Kun olet kirjautunut  

## Navigointipalkki  

## Chattien sivu  

### Admin oikeudet  


### Ilmoitukset  
Kaikki sovelluksen ilmoitukset näkyvät sivun yläreunassa. Vihreä tausta kertoo onnistuneesta toiminnon suorituksesta ja punainen virheestä. 
Ilmoitusta klikkaamalla se katoaa näkyvistä.  