# Compileit Rooms API

Small Node.js, TypeScript, Express, and SQLite API for the meeting-room booking app.

## Run locally

```bash
npm install
npm run dev
```

The API listens on `http://localhost:3000` and stores data in `data/rooms.db`.

## Endpoints

```text
GET    /rooms
GET    /bookings?startsAt=<ISO>&endsAt=<ISO>
POST   /bookings
DELETE /bookings/:id
```

Rooms are defined directly in `src/server.ts`. SQLite contains only the `bookings` table.

Create a booking by posting the room and continuous time interval:

```json
{
  "roomId": "steve",
  "startsAt": "2026-09-01T08:00:00.000Z",
  "endsAt": "2026-09-01T09:00:00.000Z",
  "bookerName": "Erik Svensson"
}
```

The server rejects bookings that overlap an existing booking for the same room. A successful response includes a cancellation token, which the app stores locally and sends back when cancelling.
