# Svi serveri

- Baze podataka u jednom poddirektoriju
- Učitavanje konfiguracije iz datoteke koja se nalazi u poddirektoriju
- Serveri se registriraju od toplevela prema dolje
- Query podaci se šalju od gore prema dolje i vraćaju frontendu preko Promise-a
- Ime i tip (iz konfiguracijske datoteke) su vidljivi svima
- JWT
- Upgrade na GLFW3.3
- Add database startup code in Makefile

## Konfiguracijska datoteka

```json
{
  "name": "RH toplevel server",
  "type": "toplevel",
  "address": "172.16.0.2",
  "port": 8080,
  "password": "password",
  "children": [
    {
      "name": "Institution 1",
      "address": "172.16.0.3",
      "port": 8080
    },
    {
      "name": "Institution 2",
      "address": "172.16.0.4",
      "port": 8080
    }
  ]
}
```

# Testovi za napraviti

- Usporedba sa i bez ZFS kompresije

# Toplevel server

## Uloge

- WebRTC
- Autorizacija

## Tablice u bazi podataka

- UserData
- PatientData

## RESTful API

- Auth
- User
- Patient

# Institution server

## Uloge

- Auth token dobiven od više razine

## Tablice u bazi podataka

- RecordData
- SessionData
- RecordSessionData

## RESTful API

- Record
- Session

# Node server

- TGA file format
- Submit OpenGL naredbi preko Golang channel-a

## Uloge

- Grafički API

## Tablice u bazi podataka

- Nema

## RESTful API

- Render

# Korisničko sučelje

- Promjena svjetline slike
- Mjerenje udaljenosti na slici
