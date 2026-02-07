# AGENTS.md – Frontend (Cloud-native ToDo-App)

## Projektüberblick
Dieses Projekt ist das Frontend einer Cloud-nativen ToDo-Anwendung für ein Studienmodul
(Cloud- und Big-Data-Systeme). Ziel ist ein kleiner, aber sauber erklärbarer Funktionsumfang
mit klarer Trennung zwischen UI, API-Zugriff und Auth.

Das Frontend wird lokal mit Vite entwickelt und spricht ein eigenes Backend (Express + Prisma)
über HTTP/JSON an.

---

## Technologie-Stack
- Vite
- React
- JavaScript (JSX) *(optional: später TypeScript/TSX, aber aktuell nicht erforderlich)*
- CSS (App.css / index.css)
- Firebase Auth ist geplant bzw. teilweise vorhanden (Login-Komponente)

---

## Ziele für Agenten
- Änderungen sollen einsteigerfreundlich bleiben und die bestehende Struktur respektieren
- Keine unnötigen Libraries oder komplexe Patterns einführen
- API-Zugriffe zentral bündeln (nicht in beliebigen Komponenten verteilen)
- Auth so integrieren, dass Backend später sauber `owner_id` aus der Firebase UID ableiten kann

---

## Ordnerstruktur (Ist-Zustand)

```
Frontend/
|-- public/
|   |-- vite.svg
|-- src/
|   |-- assets/
|   |   |-- react.svg
|   |-- App.css
|   |-- App.jsx
|   |-- index.css
|   |-- Login.jsx
|   |-- main.jsx
|-- index.html
|-- eslint.config.js
|-- vite.config.js
|-- package.json
|-- package-lock.json
```

---

## Konventionen

### Komponenten
- Komponenten bleiben klein und fokussiert (UI statt Business-Logik)
- Keine Datenbank- oder Prisma-Details im Frontend
- UI-Logik (Form-State, Loading, Error-Anzeige) ist okay, aber keine API-Details pro Komponente

### API-Zugriff
- Alle HTTP-Aufrufe sollen über **eine** zentrale Stelle laufen
- Komponenten sollen nur Funktionen wie `tasksApi.list()` aufrufen, nicht direkt `fetch(...)`
- Responses enthalten IDs ggf. als **String** (BigInt-Serialisierung im Backend). Frontend behandelt IDs als String.

Empfohlene (zukünftige) Struktur:
```
src/
|-- api/
|   |-- client.js        (fetch wrapper, baseUrl, headers)
|   |-- tasksApi.js      (tasks endpoints)
|-- features/
|   |-- tasks/           (UI für tasks)
|-- components/          (wiederverwendbare UI-Komponenten)
```
*(Aktuell darf das schrittweise eingeführt werden, ohne großen Umbau.)*

### Error-Handling
- Bei API-Fehlern sollen Benutzer verständliche Fehlermeldungen sehen
- Keine Roh-Stacktraces oder interne Backend-Details im UI anzeigen
- Backend liefert idealerweise `{ error: string, details?: object }`

### Auth
- Falls Firebase Auth verwendet wird:
  - Token/UID nur über zentrale Schicht an Requests hängen
  - Keine Auth-Logik in jeder Komponente duplizieren
- Bis Auth fertig ist, kann ein Dev-Header verwendet werden (z.B. `x-user-id`) **nur lokal**.

---

## Was vermieden werden soll
- Keine großen State-Management-Libraries (Redux, MobX), solange es nicht zwingend nötig ist
- Keine komplexen Architektur-Pattern (Clean Architecture, Hexagon) im Frontend
- Keine direkten API-Calls in sehr vielen Komponenten verteilt
- Keine unnötige Umstellung auf TypeScript, wenn der Nutzen nicht klar ist

---

## Lokales Setup (Erwartungen)
- `npm install`
- `npm run dev` (Vite)
- Backend läuft separat und ist über eine konfigurierbare Base-URL erreichbar
  (optional über Vite Proxy in `vite.config.js`)

---

## Hinweise für spätere Erweiterungen (MVP-orientiert)
- Tasks: Liste, Create, Update (Status), Delete
- Labels: einfache Zuordnung zu Tasks
- Auth: Login/Logout, UID an Backend weitergeben, Backend filtert per `owner_id`
