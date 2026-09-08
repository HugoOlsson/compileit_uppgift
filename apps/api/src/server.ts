import express from 'express';

import { cancelBooking, createBooking, getBookings } from './database.js';
import type { Room } from './types.js';

const rooms: Room[] = [
  { id: 'margret', name: 'Margret', capacity: 4 },
  { id: 'steve', name: 'Steve', capacity: 6 },
  { id: 'ada', name: 'Ada', capacity: 10 },
  { id: 'edmund', name: 'Edmund', capacity: 10 },
  { id: 'grace', name: 'Grace', capacity: 20 },
];

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get('/rooms', (_request, response) => {
  response.json(rooms);
});

app.get('/bookings', (request, response) => {
  const { startsAt, endsAt } = request.query;

  if (typeof startsAt !== 'string' || typeof endsAt !== 'string') {
    response.status(400).json({ message: 'Missing dates.' });
    return;
  }

  response.json(getBookings(startsAt, endsAt));
});

app.post('/bookings', (request, response) => {
  const { roomId, startsAt, endsAt, bookerName } = request.body ?? {};
  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (
    typeof roomId !== 'string' ||
    typeof startsAt !== 'string' ||
    typeof endsAt !== 'string' ||
    typeof bookerName !== 'string' ||
    !bookerName.trim() ||
    !rooms.some((room) => room.id === roomId) ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    startDate >= endDate
  ) {
    response.status(400).json({ message: 'Invalid booking information.' });
    return;
  }

  const result = createBooking({
    roomId,
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
    bookerName: bookerName.trim(),
  });

  if (!result) {
    response.status(409).json({ message: 'The time has already been booked.' });
    return;
  }

  response.status(201).json(result);
});

app.delete('/bookings/:id', (request, response) => {
  const cancellationToken = request.body?.cancellationToken;

  if (
    typeof cancellationToken !== 'string' ||
    !cancelBooking(request.params.id, cancellationToken)
  ) {
    response.status(404).json({ message: 'Booking not found.' });
    return;
  }

  response.sendStatus(204);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://localhost:${port}`);
});
