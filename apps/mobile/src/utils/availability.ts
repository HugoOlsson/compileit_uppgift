import type { AvailabilitySlot, Booking, Room } from '@/types/booking';

export function createAvailableSlots(dates: Date[], rooms: Room[], bookings: Booking[]) {
  const slots: AvailabilitySlot[] = [];

  for (const date of dates) {
    for (let hour = 8; hour < 17; hour += 1) {
      for (const room of rooms) {
        const startsAt = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hour,
        );
        const endsAt = new Date(startsAt);
        endsAt.setHours(hour + 1);

        const isBooked = bookings.some(
          (booking) =>
            booking.roomId === room.id &&
            new Date(booking.startsAt) < endsAt &&
            new Date(booking.endsAt) > startsAt,
        );

        if (!isBooked) {
          slots.push({
            id: `${room.id}-${startsAt.toISOString()}`,
            roomId: room.id,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
          });
        }
      }
    }
  }

  return slots;
}
