# Cloud-native ToDo Application

## Projektübersicht
Dieses Projekt ist eine Cloud-native ToDo-Anwendung, die im Rahmen des Moduls
"Cloud- und Big-Data-Systeme" entwickelt wurde.

Ziel ist die praktische Umsetzung zentraler Cloud-Konzepte wie zustandslose Services,
zustandsbehaftete Datenhaltung, automatisiertes Deployment sowie skalierbarer Betrieb
in einer Public Cloud.

Die Anwendung ermöglicht es Benutzer:innen, Aufgaben zu erstellen, zu verwalten und zu kategorisieren. 
Die Authentifizierung erfolgt über Firebase Authentication, die Persistenz erfolgt über eine 
relationale Datenbank (PostgreSQL).

---

## Projektziele (prüfungsrelevant)
- Umsetzung einer Cloud-nativen Architektur nach dem IDEAL-Modell
- Trennung von zustandsloser Applikationslogik und zustandsbehafteter Datenhaltung
- Nutzung von Managed Cloud Services (Google Cloud)
- Automatisierbares Deployment und vorbereitete horizontale Skalierung
- Saubere Konfigurationsverwaltung nach den 12-Factor-App-Prinzipien

---

## Features
- Tasks erstellen, bearbeiten, abschliessen, löschen
- Labels anlegen und Tasks zuordnen
- Activity-Log für Task-Änderungen (Create/Update/Delete)
- Filter & Cursor-Pagination für Tasks (status, due_before, limit, cursor)

---

## Architekturübersicht

### Komponenten

| Komponente | Beschreibung |
|-----------|-------------|
| Frontend | Web-Frontend (SPA) zur Aufgabenverwaltung |
| Backend | Node.js / Express REST-API (zustandslos) |
| Authentifizierung | Firebase Authentication |
| Datenbank | Cloud SQL (PostgreSQL) |
| Infrastruktur | Google Cloud Platform |
| Deployment | Container-basiert, Cloud Run vorbereitet |

---

### Architekturprinzipien
- Stateless Backend: keine Sitzungsdaten im Service
- Stateful Storage: Persistenz ausschließlich in PostgreSQL
- Loose Coupling: Kommunikation über klar definierte APIs
- Externalized Configuration: Konfiguration über Environment Variablen
- Automatisierbarkeit: Build- & Deployment-Pipeline vorbereitet

---

## Datenmodell (Kurzbeschreibung)
- users: Benutzer (Firebase UID als Primärschlüssel)
- tasks: Aufgaben mit Status, Fälligkeitsdatum und Owner
- labels: Benutzerdefinierte Kategorien
- task_labels: n:m-Relation zwischen Tasks und Labels
- activity_log: optionale Ereignisprotokollierung

Listen werden bewusst nicht als eigene Entität, sondern über Labels abgebildet,
sodass eine Aufgabe mehreren Kategorien zugeordnet sein kann.

---

## API-Konventionen (Auszug)
- Tasks liefern immer ihre Labels mit (inkl. task_labels).
- Tasks sind owner-gebunden: ein User sieht nur seine eigenen Tasks.
- Task-Listen verwenden Cursor-Pagination (limit, cursor), damit "Mehr laden" effizient ist.
- Labels werden immer komplett geliefert (keine Pagination), da die Menge klein bleibt.

---

## Technologie-Stack

| Ebene | Technologie |
|------|------------|
| Frontend | z.B. React (erweiterbar) |
| Backend | Node.js, TypeScript, Express |
| Datenbank | PostgreSQL (Cloud SQL) |
| Authentifizierung | Firebase Authentication |
| Cloud Provider | Google Cloud Platform |
| Entwicklung | Cloud SQL Auth Proxy, dotenv |

---

## Lokales Setup (Backend)

### Voraussetzungen
- Node.js (empfohlen: Node 20 LTS)
- Google Cloud CLI (`gcloud`)
- Zugriff auf das Google Cloud Projekt
- Cloud SQL Auth Proxy

---

### Repository klonen
```bash
git clone <REPOSITORY_URL>
cd ToDo-App/backend
npm install
```

---

## Environment Variablen konfigurieren

Für das lokale Setup wird eine `.env` Datei benötigt.
Als Vorlage dient die Datei `.env.example`, die im Repository enthalten ist.

### Vorlage kopieren
```bash
copy .env.example .env
```
(unter macOS / Linux entsprechend:)
```bash
cp .env.example .env
```

---

### Beispiel .env
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=todoapp
DB_USER=todo_user
DB_PASSWORD="********"
PORT=8080
```

>Hinweis:
>Passwörter oder Secrets mit Sonderzeichen (z.B. #, !, $) müssen in Anführungszeichen gesetzt werden, da sie sonst in `.env` Dateien als Kommentar interpretiert werden.
