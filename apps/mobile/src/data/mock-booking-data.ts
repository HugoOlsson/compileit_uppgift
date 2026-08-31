import type { AvailabilityResponse, AvailabilitySlot, Room } from '@/types/booking';
import { getDateKey } from '@/utils/date';

const rooms: Room[] = [
  { id: 'margret', capacity: 4, name: 'Margret' },
  { id: 'steve', capacity: 6, name: 'Steve' },
  { id: 'ada', capacity: 10, name: 'Ada' },
  { id: 'edmund', capacity: 10, name: 'Edmund' },
  { id: 'grace', capacity: 20, name: 'Grace' },
];

function createSlot(date: Date, room: Room, startHour: number): AvailabilitySlot {
  const startsAt = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    startHour,
  );
  const endsAt = new Date(startsAt);
  endsAt.setHours(endsAt.getHours() + 1);

  return {
    id: `${room.id}-${getDateKey(date)}-${startHour}`,
    roomId: room.id,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
}

export function getMockAvailability(dates: Date[]): AvailabilityResponse {
  const slots = dates.flatMap((date, dayIndex) =>
    rooms.flatMap((room, roomIndex) => {
      const isUnavailable = (dayIndex + roomIndex) % 5 === 4;
      const startHour = 8 + ((dayIndex + roomIndex) % 4);

      return isUnavailable ? [] : [createSlot(date, room, startHour)];
    }),
  );

  return { rooms, slots };
}
