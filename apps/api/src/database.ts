import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

import type { Booking, NewBooking } from './types.js';

const defaultDatabasePath = fileURLToPath(new URL('../data/rooms.db', import.meta.url));
const databasePath = process.env.DATABASE_PATH ?? defaultDatabasePath;

if (databasePath !== ':memory:') {
  mkdirSync(dirname(databasePath), { recursive: true });
}

const database = new Database(databasePath);

database.pragma('journal_mode = WAL');
database.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    booker_name TEXT NOT NULL,
    cancellation_token TEXT NOT NULL
  );
`);

export function getBookings(startsAt: string, endsAt: string) {
  return database
    .prepare(`
      SELECT
        id,
        room_id AS roomId,
        starts_at AS startsAt,
        ends_at AS endsAt,
        booker_name AS bookerName
      FROM bookings
      WHERE starts_at < ? AND ends_at > ?
      ORDER BY starts_at
    `)
    .all(endsAt, startsAt) as Booking[];
}

export const createBooking = database.transaction((newBooking: NewBooking) => {
  const overlappingBooking = database
    .prepare(`
      SELECT id
      FROM bookings
      WHERE room_id = ? AND starts_at < ? AND ends_at > ?
    `)
    .get(newBooking.roomId, newBooking.endsAt, newBooking.startsAt);

  if (overlappingBooking) {
    return;
  }

  const booking: Booking = {
    id: randomUUID().slice(0, 8),
    ...newBooking,
  };
  const cancellationToken = randomUUID();

  database
    .prepare(`
      INSERT INTO bookings (
        id,
        room_id,
        starts_at,
        ends_at,
        booker_name,
        cancellation_token
      ) VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      booking.id,
      booking.roomId,
      booking.startsAt,
      booking.endsAt,
      booking.bookerName,
      cancellationToken,
    );

  return { booking, cancellationToken };
});

export function cancelBooking(bookingId: string, cancellationToken: string) {
  const result = database
    .prepare('DELETE FROM bookings WHERE id = ? AND cancellation_token = ?')
    .run(bookingId, cancellationToken);

  return result.changes > 0;
}
