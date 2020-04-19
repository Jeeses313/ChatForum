# Käyttöohje

## Sovelluksen käynnistäminen  
Netissä olevaan sovellukseen pääsee [täältä](https://powerful-waters-43426.herokuapp.com).  
Jos haluat kokeilla sovellusta paikallisesti, lataa/pull:aa projekti ja mene komentokehotteella kansioon *backend* ja suorita 
komento ```npm start```, jolloin sovellukseen pääsee osoitteesta *localhost:3001*. Kommennon suorittaminen voi vaatio node:n asennuksen.  

## Kun et ole kirjautunut  

### Kirjautuminen  
Mennessäsi sovelluksen sivulle, sinut ohjataan suoraan kirjautumissivulle, jossa pyydetään käyttäjänimeäsi ja salasanaasi. Kirjoitettuasi 
tietosi, voit kirjautua klikkaamalla nappia *login*. Jos käyttäjänimi tai salasana oli väärin, siitä annetaan ilmoitus sivun yläreunassa. 
Jos sinulla ei ole vielä käyttäjätunnusta, voit rekisteröityä sivulta, johon pääseee klikkaamalla linkkiä *signin*.  

### Rekisteröityminen  
Sivulla pyydetään käyttäjänimeä ja salasanaa, joita haluat käyttää sovelluksessa. Molempien tulee olla 3-15 merkkiä pitkiä ja käyttäjänimen tulee olla uniikki. 
Kun tiedot on annettu, painamalla nappia *sign in* voi rekisteröityä. Jos tiedoissa oli virheitä, siitä annetaan ilmoitus sivun yläreunassa. Jos rekisteröityminen onnistui, 
sinut kirjataan automaattisesti sisään ja ohjataan chattien sivulle. Sivulla on myös mahdollisuus mennä takaisin kirjautumissivulle klikkaamalla linkkiä *login*.  

## Kun olet kirjautunut  
### Chattien sivu  
Sivulla on listattuna chatteja, joiden otsikkoa klikkaamalla pääsee chatin sivulle. Chateista kerrotaan joko aika, jolloin chatti on aloitettu, tai aika, jolloin chatissa 
on viimeksi lisätty kommentti ja kyseisen kommentin sisältö ja sen lisänneen käyttäjän nimi. Chatit ovat aikajärjestyksessä luontiajan ja viimeisimmän viestin mukaan, mutta chatin voi 
halutessa "pinnata" klikkaamalla nappia *Pin*. *Pinnatut* chatit ovat ennen muita chatteja aikajärjestyksessä. "Pinnauksen" voi poistaa klikkaamalla nappia *Unpin*. Chatin voi myös ilmoittaa asiattomaksi klikkaamalla nappia *Report*, jolloin admin voi ilmoituksen huomattuaan 
poistaa chatin. Ilmotuksen voi poistaa klikkaamalla nappia *Unreport*. Sivun oikeassa yläkulmassa on myös tekstikenttä, johon kirjoittamalla voi filtteröidä chatteja niiden otsikoiden mukaan, ja alareunassa olevaan tekstikenttään kirjoittamalla ja nappia *Start new chat* klikkaamalla voi aloittaa uuden chatin, 
jolloin sinut ohjataan chatin sivulle.  

### Yksittäisen chatin sivu  
Samoin kuin chattien sivulla, chatin otsikon vierestä chatin voi "pinnata" klikkaamalla nappia *Pin* tai poistaa "pinnauksen" napilla *Unpin* ja ilmoittaa asiattomaksi napilla *Report* ja poistaa ilmoituksen napilla *Unreport*. Chatissa näkyy kommentteja aikajärjestyksessä. Jokaisessa kommentissa on lähettäjän nimi, jota klikkaamalla pääsee lähettäjän profiilisivulle, 
mahdollinen käyttäjän profiilikuva, lähetysaika ja sisältö. Muiden käyttäjien kommenteissa on nappi *Report*, joka toimii samoin kuin chateissa. Napilla *Unreport* ilmoituksen voi poistaa. Omissa kommenteissa on nappi *Delete comment*, jolla kommentin voi poistaa, ja *Start editing*, jota klikkaamalla voi muokata kommenttiaan. Muokatessa kommenttia voi muuttaa sen sisältöä ja vaihtaa siihen liitetyn kuvan tai videon. Klikkaamalla 
*Stop editing* voi muokkaamisen lopettaa ja hylätä muutokset ja napilla *Submit edit* voi hyväksyä muutokset. Sivun alareunassa on tekstikenttä, johon voi kirjoittaa uuden kommentin, ja kentän alla on toinen kenttä, johon voi halutessaan kirjoittaa kuvan tai videon osoitteen, jonka haluaa liittää kommenttiin. Klikkaamalla nappia *Send* kommentti lähetetään. Sivun oikeassa yläkulmassa on tekstikenttä, jolla voi filtteröidä kommentteja niiden 
sisällön mukaan.    

### Profiilisivu
Sivun vasemmassa yläkulmassa näkyy käyttäjän profiilikuva ja käyttäjänimi. Omalla profiilisivulla näkyy myös nappi *Set image*, jolla voi asettaa profiilikuvan. Kun nappia on painettu, esiin tulee tekstikenttä, johon voi kirjoittaa kuvan ositteen ja klikkaamalla nappia *Set image* kuva asetetaan profiilikuvaksi. Napilla *Back* voi keskeyttää kuvan asettamisen ja napilla *Delete image* voi poistaa profiilikuvan. Sivulla on myös käyttäjän oma chatti, joka toimii 
samoin kuin yksittäisen chatin sivussa.  

## Admin oikeudet  
Admin voi nähdä kuinka monta kertaa chatit ja kommentit on ilmoitettu asiattomaksi. Admin voi poistaa chatteja ja kommentteja. Chatteja voi poistaa chattien sivulta tai ilmoitettujen chattien sivulta, johon vain admin pääsee klikkaamalla navigointipalkin nappia *Reported chats* ja joka toimii samoin kuin chattien sivu, mutta siinä näytetään vain chatteja, jotka on ilmoitettu asiattomiksi. Kommentteja voi poistaa yksittäisen chatin sivulta tai ilmoitettujen kommenttien sivulta, johon pääsee 
vain admin pääsee klikkaamalla navigointipalkin nappia *Reported comments* ja joka toimii samoin kuin yksittäisen chatin sivu, mutta siinä näytetään vain chatteja, jotka on ilmoitettu asiattomiksi. Admin voi myös nollata chattien ja kommenttien ilmoitukset napilla *Zero reports*, joka on löytyy ilmoitettujen chattien ja kommenttien kohdasta, jossa on myös nappi niiden poistamiselle.  

### Navigointipalkki  
#### Kaikille  
Klikkaamalla nappia *Dark/Light mode* saa vaihdettua sivun taustan värin mustaksi/valkoiseksi.  

#### Kirjautuneille  
Klikkaamalla nappia *Chats* pääsee chattien sivulle ja klikkaamalla linkkiä, joka on käyttäjänimesi, pääsee omalle profiili sivulle. 
Napilla *Logout* pääsee kirjautumaan ulos, jolloin ohjataan takaisin kirjautumissivulle.  

#### Adminille  
Napilla *Reported chats* pääsee ilmoitettujen chattien sivulle ja napilla *Reported comments* pääsee ilmoitettujen kommenttien sivulle.  

### Ilmoitukset  
Kaikki sovelluksen ilmoitukset näkyvät sivun yläreunassa. Vihreä tausta kertoo onnistuneesta toiminnon suorituksesta ja punainen virheestä. 
Ilmoitusta klikkaamalla se katoaa näkyvistä.  